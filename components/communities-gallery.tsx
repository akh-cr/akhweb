"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const galleryImages = [
  "/images/communities/1.jpg",
  "/images/communities/2.jpg",
  "/images/communities/3.jpg",
]

export function CommunitiesGallery() {
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      
      switch (e.key) {
        case "Escape":
          closeLightbox()
          break
        case "ArrowLeft":
          setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + galleryImages.length) % galleryImages.length))
          break
        case "ArrowRight":
          setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % galleryImages.length))
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightboxIndex])

  // Prevent scrolling when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = "hidden"
      document.documentElement.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
      document.documentElement.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
      document.documentElement.style.overflow = "unset"
    }
  }, [lightboxIndex])

  const [touchStart, setTouchStart] = useState<number | null>(null)

  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    
    const endX = e.changedTouches[0].clientX
    const distance = touchStart - endX
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      showNext()
    }
    if (isRightSwipe) {
      showPrev()
    }
    setTouchStart(null)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {galleryImages.map((src, index) => (
        <div 
          key={index} 
          className="aspect-[4/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group ring-1 ring-black/5 cursor-pointer relative"
          onClick={() => openLightbox(index)}
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

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-in fade-in duration-300 touch-none"
          onClick={closeLightbox}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{ touchAction: 'none' }}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 text-white transition-colors duration-500 hover:bg-transparent md:hover:bg-white/10 active:bg-white/20 active:duration-0 focus-visible:ring-0 focus-visible:outline-none tap-transparent h-12 w-12 rounded-full z-50" 
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-4 text-white transition-colors duration-500 hover:bg-transparent md:hover:bg-white/10 active:bg-white/20 active:duration-0 focus-visible:ring-0 focus-visible:outline-none tap-transparent h-12 w-12 rounded-full z-50 flex" 
            onClick={(e) => {
              e.stopPropagation()
              showPrev()
            }}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <div className="relative w-full h-full p-4 md:p-10 flex items-center justify-center">
             <div className="relative w-full h-full max-h-[85vh] max-w-7xl">
                <Image 
                    src={galleryImages[lightboxIndex]} 
                    alt="Lightbox content" 
                    fill 
                    className="object-contain"
                    quality={100}
                    priority
                    sizes="100vw"
                />
             </div>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 text-white transition-colors duration-500 hover:bg-transparent md:hover:bg-white/10 active:bg-white/20 active:duration-0 focus-visible:ring-0 focus-visible:outline-none tap-transparent h-12 w-12 rounded-full z-50 flex" 
            onClick={(e) => {
                e.stopPropagation()
                showNext()
            }}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>
      )}
    </div>
  )
}
