import { openai } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import fs from "fs";
import path from "path";
import { z } from "zod";
// Change runtime to nodejs
export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  const { messages, systemMessage, model = 'gpt-4o-mini' } = await req.json();

  // Process messages to handle image paths
  const processedMessages = messages.map((msg: any) => {
    if (Array.isArray(msg.content)) {
      return {
        ...msg,
        content: msg.content.map((content: any) => {
          if (content.type === 'image' && content.image) {
            // Get the absolute path from the relative path
            const absolutePath = path.join(process.cwd(), 'public', content.image);
            return {
              type: 'image',
              image: fs.readFileSync(absolutePath)
            };
          }
          return content;
        })
      };
    }
    return msg;
  });

  const allMessages = systemMessage
    ? [{ role: "system", content: systemMessage }, ...processedMessages]
    : processedMessages;

  const result = await streamText({
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

          // todo: fal ai
          console.log(imageUrl);

          return {
            base64Url: base64Url,
            imageUrl: imageUrl,
          }
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