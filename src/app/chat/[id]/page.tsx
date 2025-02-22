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
import { RightColumnSection } from "./RightColumnSection";

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

const images = ["/images/ronaldo.jpg", "/images/squidgame.jpg", "/images/taylor.jpg"];

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
    images: ['/images/ronaldo.jpg']
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
    thumbnail: '/images/ronaldo.jpg',
    title: 'Dance Tutorial #1',
    duration: '0:30',
    views: 1200
  },
  {
    id: 'v2',
    thumbnail: '/images/squidgame.jpg',
    title: 'Effect Tutorial',
    duration: '0:45',
    views: 850
  },
  {
    id: 'v3',
    thumbnail: '/images/taylor.jpg',
    title: 'Trending Dance',
    duration: '0:60',
    views: 2300
  },
];

const mockAssistantResponses = [
  "Of course! What kind of content are you looking to create?",
  "That sounds interesting! Would you like to see some examples of similar content?",
  "I can help with that! Here are some trending effects that might work well:",
];

export default function ChatPage() {
  const { messages, message, setMessage, addMessage } = useChat();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  // Add a ref to track initial mount
  const isInitialMount = useRef(true);

  useEffect(() => {
    const handleInitialMessage = async () => {
      // Only run on initial mount and reset the flag
      if (!isInitialMount.current) return;
      isInitialMount.current = false;

      const lastMessage = messages.at(-1);
      if (messages.length > 0 && lastMessage?.sender === 'user') {
        setIsLoading(true);
        try {
          const messageContent = lastMessage.images?.length ? [
            { 
              type: 'text', 
              text: lastMessage.content + (lastMessage.images[0] ? "\n\nimageUrl:" + lastMessage.images[0] : "") 
            }
          ] : lastMessage.content;

          const response = await fetch('/api/brainrot/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [...messages.slice(0, -1), { role: 'user', content: messageContent }],
            })
          });

          if (!response.ok) throw new Error('Failed to fetch response');

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let streamContent = "";

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split("\n").filter(line => line.trim());
              
              for (const line of lines) {
                if (line.startsWith("0:")) {
                  const content = line.slice(2).trim();
                  try {
                    streamContent += JSON.parse(content);
                  } catch {
                    streamContent += content;
                  }
                  setStreamingContent(streamContent);
                }
              }
            }

            const assistantMessage: ChatMessage = {
              id: crypto.randomUUID(),
              content: streamContent,
              sender: 'assistant' as const
            };
            addMessage(assistantMessage);
            setStreamingContent("");
          }
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    void handleInitialMessage();
  }, []); // Empty dependency array since we only want this to run once on mount

  // Updated handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: inputValue,
      sender: 'user',
      images: selectedImages.length > 0 ? selectedImages : undefined
    };
    
    addMessage(userMessage);
    setInputValue("");
    setSelectedImages([]);
    setIsLoading(true);

    try {
      const messageContent = selectedImages.length > 0 ? [
        { type: 'text', text: inputValue + (selectedImages[0] ? "\n\nimageUrl:" + selectedImages[0] : "") },
      ] : inputValue;

      const response = await fetch('/api/brainrot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: messageContent }],
          systemMessage: "You are an AI assistant that helps users come up with viral content prompts and generate videos. After generating a video, always provide a message back to the user confirming the video has started generating",
        })
      });

      if (!response.ok) throw new Error('Failed to fetch response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let streamContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter(line => line.trim());
          
          for (const line of lines) {
            if (line.startsWith("0:")) {
              // Extract content after "0:"
              const content = line.slice(2).trim();
              try {
                streamContent += JSON.parse(content);
              } catch {
                streamContent += content;
              }
              setStreamingContent(streamContent);
            }
            // Skip other message types (f:, e:, d:)
          }
        }

        // Add final assistant message
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          content: streamContent,
          sender: 'assistant' as const
        };
        addMessage(assistantMessage);
        setStreamingContent("");
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Column */}
      <div className="flex h-full w-1/2 flex-col border-r-2 border-border">
        {/* Messages container - scrollable area */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex min-h-full flex-col justify-start">
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
                        <div className="relative h-20 w-20">
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
              {streamingContent && (
                <div className="flex justify-start">
                  <div className="bg-muted max-w-full p-3">
                    <p>{streamingContent}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input area - fixed at bottom */}
        <div className="border-border bg-background p-4">
          <form onSubmit={handleSubmit} className="duration-125 group flex max-w-full flex-col gap-2 border-2 border-border bg-[var(--bw)] p-2 transition-colors">
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
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void handleSubmit(e);
                }
              }}
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
      <RightColumnSection />
    </div>
  );
}
