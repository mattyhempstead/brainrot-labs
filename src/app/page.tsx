"use client";

import { useState, useEffect } from "react";
import { ArrowUp, ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ImageSelector from "./_components/ImageSelector";
import Image from "next/image";
import Marquee from "@/components/ui/marquee";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useChat } from "@/app/chat/[id]/chatStore";

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  images?: string[];
}

const placeholders = [
  "Ronaldo and Speed eat a cake",
  "Young-hee climbs up a tree and falls down",
  "Taylor and Sabrina hug and then fight each other",
];

const images = ["/images/ronaldo.jpg", "/images/squidgame.jpg", "/images/taylor.jpg"];

const marqueeItems = [
  "A cake appears and the two people eat it",
  "The girl climbs up a tree and falls down",
  "The two women hug and then start boxing each other",
];

export default function HomePage() {
  const router = useRouter();
  const chatStore = useChat();
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const uuid = crypto.randomUUID();
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      content: inputValue,
      sender: 'user',
      images: selectedImages.length > 0 ? selectedImages : undefined
    };
    
    chatStore.addMessage(message);
    router.push(`/chat/${uuid}`);
  };

  const handleMarqueeClick = (text: string, index: number) => {
    console.log("Setting input to:", text);
    setInputValue(text);
    if (images[index]) {
      setSelectedImages([images[index]]);
    }
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const typingSpeed = 0.1;
    const deletingSpeed = 0.1;
    const pauseTime = 50;

    const animatePlaceholder = () => {
      const fullPlaceholder = placeholders[placeholderIndex] || "";

      if (!isDeleting) {
        if (currentPlaceholder.length < fullPlaceholder.length) {
          // Still typing
          timeout = setTimeout(() => {
            setCurrentPlaceholder(
              fullPlaceholder.slice(0, currentPlaceholder.length + 1),
            );
          }, typingSpeed);
        } else {
          timeout = setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        if (currentPlaceholder.length === 0) {
          setIsDeleting(false);
          setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
        } else {
          timeout = setTimeout(() => {
            setCurrentPlaceholder(currentPlaceholder.slice(0, -1));
          }, deletingSpeed);
        }
      }
    };

    timeout = setTimeout(animatePlaceholder, 100);
    return () => clearTimeout(timeout);
  }, [currentPlaceholder, isDeleting, placeholderIndex]);

  return (
    <div className="max-w-10xl mx-auto flex min-h-screen flex-col items-center justify-center space-y-6 p-6">
      <div className="flex h-30 w-20 items-center justify-center rounded-full">
        <Image src="/brain.png" alt="Brain icon" width={98} height={98} />
      </div>

      <h1 className="text-foreground text-4xl font-[var(--heading-font-weight)]">
        From Thought To Rot.
      </h1>

      <p className="text-foreground/80 text-center text-lg">
        The easiest way to make brain rot content that gets millions of views.
      </p>

      <div className="w-full max-w-3xl">
        <form onSubmit={handleSubmit} className="duration-125 group flex flex-col gap-2 border-2 border-border bg-[var(--bw)] p-2 transition-colors">
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
            placeholder={currentPlaceholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
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
            <Button type="submit" variant="reverse" size="icon">
              <ArrowUp className="h-6 w-6" />
            </Button>
          </div>
        </form>

        <Marquee
          items={marqueeItems}
          onItemClick={handleMarqueeClick}
          inputValue={inputValue}
          setInputValue={setInputValue}
        />
      </div>
    </div>
  );
}
