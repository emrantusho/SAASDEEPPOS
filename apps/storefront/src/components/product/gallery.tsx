"use client";

import { useState } from "react";

export function ProductGallery({ images, title }: { images: Array<{ url: string; altText?: string }>; title: string }) {
  const [selected, setSelected] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square rounded-xl bg-muted flex items-center justify-center">
        <span className="text-muted-foreground text-sm">No Image Available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-square rounded-xl bg-muted overflow-hidden">
        <img
          src={images[selected]?.url}
          alt={images[selected]?.altText || title}
          className="h-full w-full object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                i === selected ? "border-primary" : "border-transparent"
              }`}
            >
              <img src={img.url} alt={img.altText || `${title} ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
