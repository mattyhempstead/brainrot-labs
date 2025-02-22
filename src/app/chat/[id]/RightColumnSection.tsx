"use client";

import { api } from "@/trpc/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RightColumnSection() {
    // Fetching video logic moved here
    const { data: jobs } = api.brainrot.listJobs.useQuery(undefined, {
      refetchInterval: 10000 // Refetch every 10 seconds
    });
  
    return (
      <div className="flex h-full w-1/2 flex-col">
        {/* Content Studio header */}
        <div className="border-border p-4">
          <h2 className="text-2xl font-semibold">Content Studio</h2>
        </div>
        
        {/* Videos container - scrollable area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-4 gap-4">
            {jobs?.map((job) => (
              <div key={job.id} className="relative">
                {job.status === "in_progress" ? (
                  <div className="relative aspect-[9/16] w-full bg-muted flex items-center justify-center rounded-lg">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : job.videoUrl && (
                  <div className="flex flex-col gap-2">
                    <div className="relative aspect-[9/16] w-full">
                      <video
                        src={job.videoUrl}
                        className="rounded-lg object-cover w-full h-full"
                        controls
                      />
                    </div>
                    <Button asChild size="sm" className="w-full">
                      <a href={job.videoUrl} target="_blank" download>
                        Download
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }