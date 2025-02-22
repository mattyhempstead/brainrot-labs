"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowUp, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ImageSelector from "../../_components/ImageSelector";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChat } from "./chatStore";
import { api } from "@/trpc/react";


export function RightColumnSection() {
    // Fetching video logic moved here
    const { data: jobs } = api.brainrot.listJobs.useQuery();
  
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
                {job.videoUrl && (
                  <div className="relative aspect-[9/16] w-full">
                    <video
                      src={job.videoUrl}
                      className="rounded-lg object-cover w-full h-full"
                      controls
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  