"use client";

import { useState } from "react";
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

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  images?: string[];
}

interface VideoCard {
  id: string;
  thumbnail: string;
  title: string;
  duration: string;
  views: number;
}

const images = ["/images/1.jpg", "/images/2.jpg", "/images/3.jpg"];

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    content: "Hey, can you help me create some viral contadawdawdent?",
    sender: 'user'
  },
  {
    id: '2',
    content: "Of course! What kind of content are you looking to create?",
    sender: 'assistant'
  },
  {
    id: '3',
    content: "I want to make some dance videos with cool effects",
    sender: 'user',
    images: ['/images/1.jpg']
  },
  {
    id: '4',
    content: "I can help with that! What style of dance are you interested in?",
    sender: 'assistant'
  },
  {
    id: '5',
    content: "I'm thinking of doing some hip-hop with some cool transition effects",
    sender: 'user'
  },
  {
    id: '6',
    content: "Great choice! I've got some trending effects that would work perfectly with hip-hop. Would you like to see some examples?",
    sender: 'assistant'
  },
  {
    id: '7',
    content: "Yes, please show me!",
    sender: 'user'
  },
  {
    id: '8',
    content: "Here are some popular effects you might like. The 'explosive' transition effect is trending right now!",
    sender: 'assistant'
  }
];

const mockVideos: VideoCard[] = [
  {
    id: 'v1',
    thumbnail: '/images/1.jpg',
    title: 'Dance Tutorial #1',
    duration: '0:30',
    views: 1200
  },
  {
    id: 'v2',
    thumbnail: '/images/2.jpg',
    title: 'Effect Tutorial',
    duration: '0:45',
    views: 850
  },
  {
    id: 'v3',
    thumbnail: '/images/3.jpg',
    title: 'Trending Dance',
    duration: '0:60',
    views: 2300
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages);
  const [videos, setVideos] = useState<VideoCard[]>(mockVideos);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  return (
    <div className="flex h-screen">
      {/* Left Column */}
      <div className="flex h-full w-1/2 flex-col border-r border-border">
        {/* Messages container - scrollable area */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col justify-end">
            <div className="flex flex-col gap-4 p-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex justify-start`}
                >
                  <div
                    className={`max-w-full p-3 ${
                      message.sender === 'user'
                        ? 'bg-white/50 border-border border-2 w-full'
                        : 'bg-muted'
                    }`}
                  >
                    {message.sender === 'user' && message.images && message.images.length > 0 && (
                      <div className="mb-2">
                        <div className="relative h-40 w-40">
                          <Image
                            src={message.images[0] || ""}
                            alt="Message image"
                            fill
                            className="rounded-md object-cover"
                          />
                        </div>
                      </div>
                    )}
                    <p>{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Input area - fixed at bottom */}
        <div className="border-border bg-background p-4">
          <form className="duration-125 group flex max-w-full flex-col gap-2 border-2 border-border bg-[var(--bw)] p-2 transition-colors">
            {selectedImages.length > 0 && (
              <div className="flex flex-wrap gap-2 p-0">
                <div className="bg-muted flex items-center gap-0 rounded-md p-2">
                  <div className="relative h-8 w-8">
                    <Image
                      src={selectedImages[0] || ""}
                      alt="Selected image"
                      fill
                      className="border border-black object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedImages([])}
                    className="hover:bg-muted-foreground/20 ml-2 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            <Textarea
              className="ring-offset-background placeholder:text-muted-foreground flex w-full resize-none rounded-md border-0 bg-transparent px-2 py-2 text-[16px] leading-snug focus:bg-transparent focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
              rows={3}
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <div className="flex flex-wrap justify-between gap-1">
              <div className="flex flex-wrap gap-2">
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="reverse"
                      size="icon"
                      className="bg-[var(--bw)]"
                    >
                      <ImageIcon className="h-6 w-6" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-fit bg-[var(--bw)]"
                    align="start"
                    side="top"
                  >
                    <ImageSelector
                      uploadedImages={uploadedImages}
                      setUploadedImages={setUploadedImages}
                      selectedImages={selectedImages}
                      setSelectedImages={setSelectedImages}
                      onImageSelect={() => setIsPopoverOpen(false)}
                      defaultImages={images}
                    />
                  </PopoverContent>
                </Popover>
                <Select>
                  <SelectTrigger className="w-[150px] bg-bw">
                    <SelectValue placeholder="Content Style" />
                  </SelectTrigger>
                  <SelectContent className="bg-bw" side="top">
                    <SelectItem value="messy">💥 Messy</SelectItem>
                    <SelectItem value="explosive">💣 Explosive</SelectItem>
                    <SelectItem value="watery">💦 Watery</SelectItem>
                    <SelectItem value="shiny">✨ Shiny</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="reverse" size="icon">
                <ArrowUp className="h-6 w-6" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column */}
      <div className="flex h-full w-1/2 flex-col">
        {/* Content Studio header */}
        <div className="border-border p-4">
          <h2 className="text-2xl font-semibold">Content Studio</h2>
        </div>
        
        {/* Videos container - scrollable area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-4 gap-4">
            {videos.map((video) => (
              <div key={video.id} className="relative">
                <div className="relative aspect-[9/16] w-full">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    className="rounded-lg object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                    {video.duration}
                  </div>
                </div>
                <h3 className="mt-2 font-medium">{video.title}</h3>
                <p className="text-sm text-muted-foreground">{video.views} views</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
