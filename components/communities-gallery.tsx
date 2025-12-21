"use client"

import { useState } from "react"
import Image from "next/image"
import { ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Lightbox } from "@/components/ui/lightbox"

const galleryImages = [
  "/images/communities/1.jpg",
  "/images/communities/2.jpg",
  "/images/communities/3.jpg",
]

export function CommunitiesGallery() {
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {galleryImages.map((src, index) => (
        <div 
          key={index} 
          className="aspect-[4/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group ring-1 ring-black/5 cursor-pointer relative"
          onClick={() => setLightboxIndex(index)}
        >
          <Image 
            src={src} 
            alt={`Společenství ${index + 1}`} 
            fill 
            className="object-cover group-hover:scale-110 transition-transform duration-700" 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={75}
            priority={index < 3}
          />
           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ZoomIn className="text-white h-8 w-8 drop-shadow-md" />
           </div>
        </div>
      ))}

      {lightboxIndex !== null && (
        <Lightbox 
            images={galleryImages}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNext={showNext}
            onPrev={showPrev}
        />
      )}
    </div>
  )
}
