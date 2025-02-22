import { api } from "@/trpc/server";
import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import fs from "fs";
import path from "path";
import { z } from "zod";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  const { messages, systemMessage, model = 'gpt-4o-mini' } = await req.json();

  // Process messages to handle image paths
  const processedMessages = messages.map((msg: any) => {
    // If content is an array (multimodal message)
    if (Array.isArray(msg.content)) {
      return {
        role: msg.role,
        content: msg.content.map((content: any) => {
          if (content.type === 'image') {
            return {
              type: 'text',
              text: `imageUrl:${content.image}`
            };
          }
          return content;
        }).map((c: any) => c.text).join('\n\n') // Join all text contents
      };
    }
    // If content is a string or object
    return {
      role: msg.role,
      content: typeof msg.content === 'object' ? msg.content.text : msg.content
    };
  });

  const allMessages = systemMessage
    ? [{ role: "system", content: systemMessage }, ...processedMessages]
    : processedMessages;

  const result = streamText({
    model: openai(model),
    messages: allMessages,
    tools: {
      generateVideo: tool({
        description: 'Generate a video if the user provides an imageURL',
        parameters: z.object({
          prompt: z.string().describe('The prompt to generate a video for'),
          imageUrl: z.enum(['/images/ronaldo.jpg', '/images/squidgame.jpg', '/images/taylor.jpg']),
        }),
        execute: async ({
          prompt,
          imageUrl
        }: {
          prompt: string;
          imageUrl: '/images/ronaldo.jpg' | '/images/squidgame.jpg' | '/images/taylor.jpg'
        }) => {
          const imageResponse = await fetch(`${process.env.DEPLOYMENT_URL}${imageUrl}`);
          const arrayBuffer = await imageResponse.arrayBuffer();
          const base64Url = `data:${imageResponse.headers.get('content-type')};base64,${Buffer.from(arrayBuffer).toString('base64')}`;

          // Call the generateVideo mutation
          const { jobId } = await api.brainrot.generateVideo({
            prompt,
            imageUrl: base64Url
          });

          return {
            base64Url,
            imageUrl,
            jobId
          };
        },
      }),
    },
    maxTokens: 1000,
    temperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
  });

  return result.toDataStreamResponse();
}