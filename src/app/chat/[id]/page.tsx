"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ImageSelector from "../../_components/ImageSelector";
import { useChat } from "./chatStore";
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

export default function ChatPage() {
  const { messages, message, setMessage, addMessage } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  // Add a ref to track initial mount
  const isInitialMount = useRef(true);

  useEffect(() => {
    const handleInitialMessage = async () => {
      if (!isInitialMount.current) return;
      isInitialMount.current = false;

      const lastMessage = messages.at(-1);
      if (messages.length > 0 && lastMessage?.sender === 'user') {
        setIsLoading(true);
        try {
          const messageContent = lastMessage.images?.length 
            ? `${lastMessage.content}\n\nimageUrl:${lastMessage.images[0]}`
            : lastMessage.content;

          const response = await fetch('/api/brainrot/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [...messages.slice(0, -1).map(msg => ({
                role: msg.sender,
                content: msg.content
              })), { role: 'user', content: messageContent }],
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
                } else if (line.startsWith("9:")) {
                  // Handle tool calls
                  try {
                    const toolCall = JSON.parse(line.slice(2));
                    if (toolCall.toolName === "generateVideo") {
                      streamContent += "\n\nStarting to generate your video... This may take a few moments.";
                      setStreamingContent(streamContent);
                    }
                  } catch (error) {
                    console.error('Error parsing tool call:', error);
                  }
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
  const handleSubmit = async (e: React.FormEvent, inputValue: string, selectedImages: string[]) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      content: inputValue,
      sender: 'user',
      images: selectedImages.length > 0 ? selectedImages : undefined
    };
    
    addMessage(userMessage);
    setIsLoading(true);

    try {
      // Convert chat messages to the format expected by the API
      const apiMessages = messages.concat(userMessage).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.sender === 'user' && msg.images?.length 
          ? { type: 'text', text: msg.content + (msg.images[0] ? "\n\nimageUrl:" + msg.images[0] : "") }
          : msg.content
      }));

      const response = await fetch('/api/brainrot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          systemMessage: "You are an AI assistant that helps users come up with viral content prompts and generate videos. If imageURL is provided, don't change the prompt, input exactly as is. After generating a video, always provide a message back to the user confirming the video has started generating",
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
            } else if (line.startsWith("9:")) {
              // Handle tool calls
              try {
                const toolCall = JSON.parse(line.slice(2));
                if (toolCall.toolName === "generateVideo") {
                  streamContent += "\n\nStarting to generate your video... This may take a few moments.";
                  setStreamingContent(streamContent);
                }
              } catch (error) {
                console.error('Error parsing tool call:', error);
              }
            }
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
              {messages.length === 0 ? (
                <div className="flex h-[calc(100vh-200px)] items-center justify-center text-muted-foreground p-4 text-center">
                  <div className="max-w-xl text-3xl">
                    Start a conversation by typing a message below. You can also add images to enhance your prompts!
                  </div>
                </div>
              ) : (
                messages.map((message) => (
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
                ))
              )}
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

        <ChatInputArea onSubmit={handleSubmit} />
      </div>

      {/* Right Column */}
      <RightColumnSection />
    </div>
  );
}

const ChatInputArea = ({
  onSubmit
}: {
  onSubmit: (e: React.FormEvent, inputValue: string, selectedImages: string[]) => void;
}) => {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    console.log(selectedStyle);
    const finalMessage = selectedStyle 
      ? `${inputValue}. Very ${selectedStyle}.`
      : inputValue;
    onSubmit(e, finalMessage, selectedImages);
    setInputValue("");
    setSelectedImages([]);
  };

  return (
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
            <Select onValueChange={setSelectedStyle}>
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
  );
};
