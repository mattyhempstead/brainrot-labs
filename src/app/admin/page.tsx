"use client";

import { api } from "@/trpc/react";
import { useState } from "react";

export default function Page() {
  const [jobId, setJobId] = useState<string | null>(null);

  const generateVideo = api.brainrot.generateVideo.useMutation({
    onSuccess: (data) => {
      setJobId(data.jobId);
    },
  });

  const handleSubmit = () => {
    generateVideo.mutate({
      prompt: "A funny cat video",
      imageUrl: "https://example.com/cat.jpg" // Replace with actual image URL
    });
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Generate Video</h1>
      
      <button
        onClick={handleSubmit}
        disabled={generateVideo.isPending}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {generateVideo.isPending ? "Generating..." : "Generate Video"}
      </button>

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
