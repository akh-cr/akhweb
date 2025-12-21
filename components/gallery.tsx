"use client"

import { useState } from "react"
import Image from "next/image"
import { ZoomIn } from "lucide-react"
import { cn } from "@/lib/utils"
import { Lightbox } from "@/components/ui/lightbox"

const galleryImages = [
  "/images/gallery/MB_2025_08_14.11.28.15_09834.jpg",
  "/images/gallery/MB_2025_08_14.11.40.58_09844.jpg",
  "/images/gallery/MB_2025_08_14.17.15.34_09845.jpg",
  "/images/gallery/MB_2025_08_14.21.08.35_09887.jpg",
  "/images/gallery/MB_2025_08_14.21.23.40_09896.jpg",
  "/images/gallery/MB_2025_08_15.11.00.24_09923.jpg",
  "/images/gallery/MB_2025_08_15.18.44.36_00004.jpg",
  "/images/gallery/MB_2025_08_15.18.44.48_00011.jpg",
  "/images/gallery/MB_2025_08_15.18.49.03_00070.jpg",
  "/images/gallery/MB_2025_08_16.18.58.47_00238.jpg",
  "/images/gallery/MB_2025_08_16.19.01.04_00246.jpg",
  "/images/gallery/MB_2025_08_16.21.32.54_00274.jpg",
]

export function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const showNext = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % galleryImages.length))
  }
  
  const showPrev = () => {
    if (lightboxIndex === null) return
    setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + galleryImages.length) % galleryImages.length))
  }

  return (
    <section className="w-full py-16 bg-background">
      <div className="max-w-6xl mx-auto px-5">
        <h2 className="text-3xl font-bold mb-12 text-center">Galerie ze života AKH</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map((src, index) => (
            <div 
              key={index} 
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl cursor-pointer group bg-muted",
                index >= 6 && "hidden md:block"
              )}
              onClick={() => setLightboxIndex(index)}
            >
              <Image 
                src={src} 
                alt={`Gallery image ${index + 1}`} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                quality={40}
                priority={index < 4}
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
            images={galleryImages}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNext={showNext}
            onPrev={showPrev}
        />
      )}
    </section>
  )
}
