import React from "react";
import Image from "next/image";

const images = [
  "/images/1.jpg",
  "/images/2.jpg",
  "/images/3.jpg",
];

export default function ImageSelector() {
  return (
    <div className="flex gap-2 p-0">
      {images.map((image, index) => (
        <button
          key={index}
          className="relative h-[160px] w-[90px] overflow-hidden rounded-md border border-border hover:border-foreground/50 transition-colors"
        >
          <Image
            src={image}
            alt={`Template ${index + 1}`}
            fill
            className="object-cover"
          />
        </button>
      ))}
    </div>
  );
}
