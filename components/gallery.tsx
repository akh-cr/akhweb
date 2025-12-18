"use client"

import { useState } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  
  const showNext = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (lightboxIndex === null) return
    setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % galleryImages.length))
  }
  
  const showPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation()
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
              className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group bg-muted"
              onClick={() => openLightbox(index)}
            >
              <Image 
                src={src} 
                alt={`Gallery image ${index + 1}`} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <ZoomIn className="text-white h-8 w-8 drop-shadow-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-in fade-in duration-300"
          onClick={closeLightbox}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 text-white hover:bg-white/10 h-12 w-12 rounded-full z-50" 
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-4 text-white hover:bg-white/10 h-12 w-12 rounded-full z-50 hidden md:flex" 
            onClick={showPrev}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <div className="relative w-full h-full p-4 md:p-10 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
             <div className="relative w-full h-full max-h-[85vh] max-w-7xl">
                <Image 
                    src={galleryImages[lightboxIndex]} 
                    alt="Lightbox content" 
                    fill 
                    className="object-contain"
                    quality={100}
                    priority
                />
             </div>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 text-white hover:bg-white/10 h-12 w-12 rounded-full z-50 hidden md:flex" 
            onClick={showNext}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>
      )}
    </section>
  )
}
