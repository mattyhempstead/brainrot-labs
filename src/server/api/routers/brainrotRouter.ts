import { env } from "@/env";
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

export const brainrotRouter = createTRPCRouter({
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

      // return {
      //   jobId: "test",
      // }

      fal.config({
        credentials: env.FAL_API_KEY,
      });

      const { request_id } = await fal.queue.submit("fal-ai/minimax/video-01/image-to-video", {
        input: params,
        webhookUrl: "https://optional.webhook.url/for/results",
      });

      const [ newJob ] = await db.insert(brainrotJobTable).values({
        falRequestId: request_id,
        status: "in_progress"
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

      const status = await fal.queue.status("fal-ai/minimax/video-01/image-to-video", {
        requestId: job.falRequestId,
        logs: true,
      });

      return status;
    }),
});
