"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  jobId: z.string().uuid("Must be a valid job ID")
});

export default function Page() {
  const [status, setStatus] = useState<any>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobId: ""
    }
  });

  const getJobStatus = api.brainrot.getJobStatus.useMutation({
    onSuccess: (data) => {
      setStatus(data);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    getJobStatus.mutate(values);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Check Job Status</h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="jobId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job ID</FormLabel>
                <FormControl>
                  <input 
                    {...field}
                    className="w-full p-2 border rounded"
                    placeholder="Enter the job ID"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <button
            type="submit"
            disabled={getJobStatus.isPending}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {getJobStatus.isPending ? "Checking..." : "Check Status"}
          </button>
        </form>
      </Form>

      {getJobStatus.error && (
        <p className="text-red-500 mt-4">
          Error: {getJobStatus.error.message}
        </p>
      )}

      {status && (
        <div className="mt-4">
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
