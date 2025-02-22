"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  imageUrl: z.string().url("Must be a valid URL")
});

export default function Page() {
  const [jobId, setJobId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      imageUrl: ""
    }
  });

  const generateVideo = api.brainrot.generateVideo.useMutation({
    onSuccess: (data) => {
      setJobId(data.jobId);
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const response = await fetch('/images/1.jpg');
    const blob = await response.blob();
    const reader = new FileReader();
    const base64Url = await new Promise<string>((resolve) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    generateVideo.mutate({
      ...values,
      imageUrl: base64Url
    });
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Generate Video</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt</FormLabel>
                <FormControl>
                  <input 
                    {...field}
                    className="w-full p-2 border rounded"
                    placeholder="Enter a prompt for the video"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    className="w-full p-2 border rounded"
                    placeholder="Enter the URL of the first frame"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <button
            type="submit"
            disabled={generateVideo.isPending}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {generateVideo.isPending ? "Generating..." : "Generate Video"}
          </button>
        </form>
      </Form>

      {generateVideo.error && (
        <p className="text-red-500 mt-4">
          Error: {generateVideo.error.message}
        </p>
      )}

      {jobId && (
        <div className="mt-4">
          <p>Job ID: {jobId}</p>
        </div>
      )}
    </div>
  );
}
