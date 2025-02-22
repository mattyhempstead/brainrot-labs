import { env } from "@/env";
import { PATH_BRAINROT_JOB_STATUS } from "@/lib/paths";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { brainrotJobTable } from "@/server/db/schema";
import { fal } from "@fal-ai/client";
import { eq } from "drizzle-orm";
import { z } from "zod";

type MinimaxVideo01ImageToVideoInput = {
    /**
     *
     */
    prompt: string;
    /**
     * URL of the image to use as the first frame
     */
    image_url: string | Blob | File;
    /**
     * Whether to use the model's prompt optimizer Default value: `true`
     */
    prompt_optimizer?: boolean;
};

const VIDEO_MODEL = "fal-ai/minimax/video-01/image-to-video";

export const brainrotRouter = createTRPCRouter({
  listJobs: publicProcedure
    .query(async () => {
      const jobs = await db.select().from(brainrotJobTable);
      return jobs;
    }),

  generateVideo: publicProcedure
    .input(z.object({
      prompt: z.string(),
      imageUrl: z.string()
    }))
    .mutation(async ({ input }) => {
      const params: MinimaxVideo01ImageToVideoInput = {
        prompt: input.prompt,
        image_url: input.imageUrl,
        prompt_optimizer: true,
      };

      console.log(params);

      console.log({
        webhookUrl: `${env.DEPLOYMENT_URL}${PATH_BRAINROT_JOB_STATUS}`,
      })

      fal.config({
        credentials: env.FAL_API_KEY,
      });

      const { request_id } = await fal.queue.submit(VIDEO_MODEL, {
        input: params,
        webhookUrl: `${env.DEPLOYMENT_URL}${PATH_BRAINROT_JOB_STATUS}`,
      });
      // const { request_id } = await fal.queue.submit("fal-ai/playai/tts/v3", {
      //   input: {
      //     input: input.prompt,
      //     voice: "Jennifer (English (US)/American)",
      //   },
      //   webhookUrl: `${env.DEPLOYMENT_URL}${PATH_BRAINROT_JOB_STATUS}`,
      // });

      const [ newJob ] = await db.insert(brainrotJobTable).values({
        falRequestId: request_id,
        status: "in_progress",
        videoUrl: null,
      }).returning();

      if (!newJob) {
        throw new Error("Failed to create job");
      }

      return { jobId: newJob.id };
    }),

  getJobStatus: publicProcedure
    .input(z.object({
      jobId: z.string().uuid()
    }))
    .mutation(async ({ input }) => {
      const job = await db.query.brainrotJobTable.findFirst({
        where: eq(brainrotJobTable.id, input.jobId)
      });

      if (!job) {
        throw new Error("Job not found");
      }

      fal.config({
        credentials: env.FAL_API_KEY,
      });

      const status = await fal.queue.status(VIDEO_MODEL, {
        requestId: job.falRequestId,
        logs: true,
      });

      return status;
    }),

  webhookJobStatus: publicProcedure
    .input(z.object({
      falRequestId: z.string(),
      status: z.enum(["completed", "failed"])
    }))
    .mutation(async ({ input }) => {
      const [updatedJob] = await db
        .update(brainrotJobTable)
        .set({ status: input.status })
        .where(eq(brainrotJobTable.falRequestId, input.falRequestId))
        .returning();

      if (!updatedJob) {
        throw new Error("Job not found");
      }

      if (input.status === "completed") {
        fal.config({
          credentials: env.FAL_API_KEY,
        });

        // const result = await fal.queue.result("fal-ai/playai/tts/v3", {
        //   requestId: input.falRequestId
        // });
        // const videoUrl = result.data.audio.url;

        const result = await fal.queue.result(VIDEO_MODEL, {
          requestId: input.falRequestId
        });
        const videoUrl = result.data.video.url;
        console.log(videoUrl);

        // const videoUrl = "https://fal.media/files/monkey/iazc7FsWpz_WGGIFdMTQB_output.mp4";

        await db
          .update(brainrotJobTable)
          .set({ videoUrl: videoUrl })
          .where(eq(brainrotJobTable.falRequestId, input.falRequestId));

        console.log("Job result data:", result.data);
        console.log("Job requestId:", result.requestId);
      }

      return updatedJob;
    }),
});
