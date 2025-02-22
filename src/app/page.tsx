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

const placeholders = [
  "Cristiano Ronaldo and Speed eat a cake",
  "Taylor Swift and Sabrina hug and then fight each other",
  "Young-hee climbs up a tree and falls down",
];

export default function Page() {
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

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
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--main)] shadow-[var(--shadow)]">
        {/* You can add an icon here if needed */}
      </div>

      <h1 className="text-foreground text-4xl font-[var(--heading-font-weight)]">
        From Thought To Rot.
      </h1>

      <p className="text-foreground/80 text-center text-lg">
        The easiest way to make brain rot content that gets millions of views.
      </p>

      <div className="w-full max-w-3xl">
        <form className="duration-125 group flex flex-col gap-2 border-2 border-border bg-[var(--bw)] p-2 transition-colors">
          {selectedImages.length > 0 && (
            <div className="flex flex-wrap gap-2 p-0">
              {selectedImages.map((image, index) => (
                <div
                  key={index}
                  className="flex items-center gap-0 rounded-md bg-muted p-2"
                >
                  <div className="relative h-8 w-8">
                    <Image
                      src={image}
                      alt={`Selected image ${index + 1}`}
                      fill
                      className="object-cover border border-black"
                    />
                  </div>
                  <button 
                    type="button"
                    onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== index))}
                    className="ml-2 rounded-full hover:bg-muted-foreground/20"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Textarea
            className="ring-offset-background placeholder:text-muted-foreground flex w-full resize-none rounded-md border-0 bg-transparent px-2 py-2 text-[16px] leading-snug focus:bg-transparent focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
            rows={3}
            placeholder={currentPlaceholder}
          />
          <div className="flex flex-wrap justify-between gap-1">
            <Popover>
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
                className="bg-[var(--bw)] w-fit"
                align="start"
                side="top"
              >
                <ImageSelector 
                  uploadedImages={uploadedImages}
                  setUploadedImages={setUploadedImages}
                  selectedImages={selectedImages}
                  setSelectedImages={setSelectedImages}
                />
              </PopoverContent>
            </Popover>
            <Button variant="reverse" size="icon">
              <ArrowUp className="h-6 w-6" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
