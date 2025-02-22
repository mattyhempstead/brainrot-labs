import React from "react";
import Image from "next/image";
import { Plus } from "lucide-react";

interface ImageSelectorProps {
  uploadedImages: string[];
  setUploadedImages: (images: string[]) => void;
  selectedImages: string[];
  setSelectedImages: (images: string[]) => void;
  onImageSelect: () => void;
  defaultImages: string[];
}

export default function ImageSelector({ 
  uploadedImages, 
  setUploadedImages, 
  selectedImages, 
  setSelectedImages,
  onImageSelect,
  defaultImages
}: ImageSelectorProps) {
  const handleImageClick = (image: string) => {
    if (selectedImages.includes(image)) {
      setSelectedImages([]);
    } else {
      setSelectedImages([image]);
    }
    onImageSelect();
  };

  return (
    <div className="flex gap-2 p-0">
      {[...defaultImages, ...uploadedImages].map((image, index) => (
        <button
          key={index}
          onClick={() => handleImageClick(image)}
          className={`relative h-[160px] w-[90px] overflow-hidden rounded-md border transition-colors ${
            selectedImages.includes(image)
              ? "border-foreground"
              : "border-border hover:border-foreground/50"
          }`}
        >
          <Image
            src={image}
            alt={`Template ${index + 1}`}
            fill
            className="object-cover"
          />
        </button>
      ))}
      
      {/* <label
        className="relative h-[160px] w-[90px] flex items-center justify-center rounded-md border border-border hover:border-foreground/50 transition-colors cursor-pointer"
      >
        <input 
          type="file" 
          className="hidden" 
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const imageUrl = URL.createObjectURL(file);
              setSelectedImages([imageUrl]);
              onImageSelect();
            }
          }}
        />
        <Plus className="h-6 w-6" />
      </label> */}
    </div>
  );
}
