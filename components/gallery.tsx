"use client"

import { useState } from "react"
import Image from "next/image"
import { ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { Lightbox } from "@/components/ui/lightbox"

interface GalleryProps {
  images?: string[]
  title?: string
}

export function Gallery({ images = [], title = "Galerie" }: GalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const showNext = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % images.length))
  }
  
  const showPrev = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + images.length) % images.length))
  }

  if (!images || images.length === 0) {
      return null
  }

  return (
    <section className="w-full py-16 bg-background">
      <div className="max-w-6xl mx-auto px-5">
        <h2 className="text-3xl font-bold mb-12 text-center">{title}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((src, index) => (
            <div 
              key={index} 
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl cursor-pointer group bg-muted",
              )}
              onClick={() => setLightboxIndex(index)}
            >
              <Image 
                src={src} 
                alt={`Gallery image ${index + 1}`} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                quality={60}
                priority={index < 8}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <ZoomIn className="text-white h-8 w-8 drop-shadow-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox 
            images={images}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNext={showNext}
            onPrev={showPrev}
        />
      )}
    </section>
  )
}
