"use client";

import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react"

// Move placeholders outside component
const placeholders = [
  "Cristiano Ronaldo and Speed eat a cake",
  "Taylor Swift and Sabrina hug and then fight each other",
  "Young-hee climbs up a tree and falls down",
];

export default function Page() {
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
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
            setCurrentPlaceholder(fullPlaceholder.slice(0, currentPlaceholder.length + 1));
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
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6 p-6 max-w-10xl mx-auto">
      <div className="w-20 h-20 rounded-full bg-[var(--main)] flex items-center justify-center shadow-[var(--shadow)]">
        {/* You can add an icon here if needed */}
      </div>

      <h1 className="text-4xl font-[var(--heading-font-weight)] text-foreground">
        From Thought To Rot.
      </h1>

      <p className="text-lg text-center text-foreground/80">
        The easiest way to make brain rot content that gets millions of views.
      </p>

      <div className="w-full max-w-3xl">
        <form className="duration-125 group flex flex-col gap-2 border-2 border-border p-2 transition-colors bg-[var(--bw)]">
          <Textarea 
            className="flex w-full rounded-md px-2 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 resize-none text-[16px] leading-snug bg-transparent focus:bg-transparent border-0"
            rows={3}
            placeholder={currentPlaceholder}
          />
          <div className="flex gap-1 flex-wrap justify-between">
            <div ></div>
            <Button variant="reverse" size="icon">
              <ArrowUp className="h-6 w-6" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
