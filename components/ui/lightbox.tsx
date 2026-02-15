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
  const [scale, setScale] = useState(1)
  
  // Reset loaded state when index changes
  useEffect(() => {
    setIsLoaded(false)
    setScale(1) // Verify reset logic
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
    // Only capture touch start if we are not zoomed in
    if (scale > 1.1) return
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    if (scale > 1.1) return // Don't swipe nav if zoomed

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

  // Prefetch ahead: once current image loads, progressively prefetch upcoming images
  const [prefetched, setPrefetched] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!isLoaded) return

    // Prefetch 1 back + 3 forward from current index
    const offsets = [-1, 1, 2, 3]
    let cancelled = false

    const prefetchSequentially = async () => {
      for (const offset of offsets) {
        if (cancelled) break
        const i = ((index + offset) % images.length + images.length) % images.length
        const src = images[i]
        if (prefetched.has(src)) continue

        // Build the Next.js optimized URL to warm the cache
        const url = `/_next/image?url=${encodeURIComponent(src)}&w=3840&q=100`
        try {
          await new Promise<void>((resolve) => {
            const img = new window.Image()
            img.onload = () => resolve()
            img.onerror = () => resolve()
            img.src = url
          })
          if (!cancelled) {
            setPrefetched(prev => new Set(prev).add(src))
          }
        } catch { /* ignore */ }
      }
    }

    prefetchSequentially()
    return () => { cancelled = true }
  }, [isLoaded, index, images, prefetched])

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in duration-300 touch-none"
      onClick={onClose}
    >

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
            key={index}
            initialScale={1}
            minScale={1}
            maxScale={4}
            centerOnInit
            wheel={{ disabled: true }} // Disable wheel zoom to prevent conflicts
            onTransformed={(e) => setScale(e.state.scale)}
            panning={{ disabled: scale < 1.1 }}
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
