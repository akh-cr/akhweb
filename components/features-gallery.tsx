
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, ZoomIn, Heart, Calendar, Users, Star } from "lucide-react"
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
  "/images/gallery/MB_2025_08_14.21.23.51_.jpg",
  "/images/gallery/MB_2025_08_15.19.15.59_00134.jpg",
  "/images/gallery/MB_2025_08_16.21.41.58_00312.jpg",
  "/images/gallery/MB_2025_08_17.00.14.00_.jpg",
  "/images/gallery/MB_2025_08_15.20.37.18_00142.jpg",
]

const features = [
    {
        title: "Duchovní akce",
        desc: "Chceme spolu vnitřně růst, proto pořádáme mnohé akce s duchovním přesahem.",
        icon: Heart,
        color: "bg-muted text-foreground"
    },
    {
        title: "Zábava a relax",
        desc: "Neboj, nežijeme jen modlitbou. Společně chodíme do divadla, sportovat či na pivo.",
        icon: Calendar,
        color: "bg-muted text-foreground"
    },
    {
        title: "Vytváříme prostor",
        desc: "Nabízíme pomocnou ruku všem, kteří chtějí založit absolventské společenství.",
        icon: Users,
        color: "bg-muted text-foreground"
    },
    {
        title: "Velká komunita",
        desc: "Kromě místních společenství děláme i plno akcí na celostátní úrovni.",
        icon: Star,
        color: "bg-muted text-foreground"
    }
]

export function FeaturesGallery() {
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

  return (
    <section className="w-full py-16 bg-background">
      <div className="max-w-7xl mx-auto px-5">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Křesťani a absolventi</h2>
            <p className="text-muted-foreground text-xl">
                Spojujeme lidi! Propojujeme duchovní život, zábavu a společenství.
            </p>
        </div>

        {/* Symmetrical Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            
            {features.map((feature, index) => {
                // Assign specific image to each feature (recycling first 4)
                const imageIndex = index; 
                return (
                    <div key={index} className="flex flex-col group rounded-2xl border bg-card overflow-hidden hover:border-primary/50 transition-all duration-300">
                        {/* Image Top */}
                        <div 
                            className="relative aspect-[4/3] overflow-hidden cursor-pointer"
                            onClick={() => openLightbox(imageIndex)}
                        >
                            <Image 
                                src={galleryImages[imageIndex]} 
                                alt={feature.title} 
                                fill 
                                className="object-cover transition-transform duration-700 group-hover:scale-105" 
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <ZoomIn className="text-white h-8 w-8 drop-shadow-md" />
                            </div>
                        </div>

                        {/* Content Bottom */}
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", feature.color)}>
                                    <feature.icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-lg">{feature.title}</h3>
                            </div>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                {feature.desc}
                            </p>
                        </div>
                    </div>
                )
            })}

        </div>

        {/* Remaining Gallery Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
             {galleryImages.slice(4).map((src, i) => {
                    const realIndex = 4 + i
                    return (
                        <div 
                            key={realIndex} 
                            className={cn(
                                "relative aspect-square rounded-xl overflow-hidden cursor-pointer group bg-muted hover:ring-2 hover:ring-primary/20 transition-all",
                                // Only show the second row (indices 5-9 in this slice) on desktop
                                i >= 5 && "hidden lg:block"
                            )}
                            onClick={() => openLightbox(realIndex)}
                        >
                            <Image src={src} alt="Gallery" fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes="20vw" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <ZoomIn className="text-white h-6 w-6 drop-shadow-md" />
                            </div>
                        </div>
                    )
                })}
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
