import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { db } from "@/server/db";
import { brainrotJobTable } from "@/server/db/schema";
import { fal } from "@fal-ai/client";
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
});

// const status = await fal.queue.status("fal-ai/flux/dev", {
//   requestId: "764cabcf-b745-4b3e-ae38-1200304cf45b",
//   logs: true,
// });
