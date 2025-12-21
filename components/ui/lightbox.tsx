"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"

interface LightboxProps {
  images: string[]
  index: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}

export function Lightbox({ images, index, onClose, onNext, onPrev }: LightboxProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Reset loaded state when index changes
  useEffect(() => {
    setIsLoaded(false)
  }, [index])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowLeft":
          onPrev()
          break
        case "ArrowRight":
          onNext()
          break
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose, onNext, onPrev])

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden"
    document.documentElement.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
      document.documentElement.style.overflow = "unset"
    }
  }, [])

  // Basic swipe logic (simplified for compatibility with zoom)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  
  const onTouchStart = (e: React.TouchEvent) => {
    // Only enable swipe if not zoomed (logic handled by user behavior usually, 
    // but we capture start here)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const endX = e.changedTouches[0].clientX
    const distance = touchStart - endX
    const minSwipeDistance = 50

    if (distance > minSwipeDistance) {
      onNext()
    } else if (distance < -minSwipeDistance) {
      onPrev()
    }
    setTouchStart(null)
  }

  // Preload adjacent images
  const prevIndex = (index - 1 + images.length) % images.length
  const nextIndex = (index + 1) % images.length

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in duration-300 touch-none"
      onClick={onClose}
    >
        {/* Preloaders (Hidden) */}
        <div className="hidden">
            <Image src={images[prevIndex]} alt="preload" width={1} height={1} priority />
            <Image src={images[nextIndex]} alt="preload" width={1} height={1} priority />
        </div>

      {/* Controls */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 right-4 text-white hover:bg-transparent md:hover:bg-white/10 active:bg-white/20 active:duration-0 focus-visible:ring-0 focus-visible:outline-none tap-transparent z-[110] rounded-full h-12 w-12" 
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute left-4 z-[110] text-white hover:bg-transparent md:hover:bg-white/10 active:bg-white/20 active:duration-0 focus-visible:ring-0 focus-visible:outline-none tap-transparent h-12 w-12 rounded-full flex" 
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>

      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute right-4 z-[110] text-white hover:bg-transparent md:hover:bg-white/10 active:bg-white/20 active:duration-0 focus-visible:ring-0 focus-visible:outline-none tap-transparent h-12 w-12 rounded-full flex" 
        onClick={(e) => { e.stopPropagation(); onNext(); }}
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      {/* Main Image Area */}
      <div 
        className="w-full h-full flex items-center justify-center p-0 md:p-10"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image area
        onTouchStart={onTouchStart} 
        onTouchEnd={onTouchEnd}
      >
        <TransformWrapper
            initialScale={1}
            minScale={1}
            maxScale={4}
            centerOnInit
            wheel={{ disabled: true }} // Disable wheel zoom to prevent conflicts
        >
            <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                <div className="relative w-full h-full max-h-[85vh] max-w-7xl flex items-center justify-center">
                    {!isLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center z-0">
                            <Loader2 className="h-10 w-10 text-white/50 animate-spin" />
                        </div>
                    )}
                    <Image 
                        src={images[index]} 
                        alt="Lightbox content" 
                        fill 
                        className={cn(
                            "object-contain transition-all duration-500",
                            isLoaded ? "opacity-100 blur-0" : "opacity-0 blur-xl"
                        )}
                        quality={100}
                        priority
                        sizes="100vw"
                        onLoad={() => setIsLoaded(true)}
                        draggable={false}
                    />
                </div>
            </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  )
}
