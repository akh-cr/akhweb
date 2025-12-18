"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const backgroundImages = [
  "/images/gallery/MB_2025_08_14.11.28.15_09834.jpg",
  "/images/gallery/MB_2025_08_14.21.08.35_09887.jpg",
  "/images/gallery/MB_2025_08_15.18.44.48_00011.jpg",
  "/images/gallery/MB_2025_08_16.18.58.47_00238.jpg",
]

export function HeroVariantCleanSlideshow() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center bg-black text-white overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        {backgroundImages.map((img, index) => (
          <div
            key={img}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url('${img}')`,
              opacity: index === currentImageIndex ? 0.6 : 0, // Slightly higher opacity than default for better photo visibility
            }}
          />
        ))}
        {/* Minimal Dark Overlay - Plain Black fade instead of color gradients */}
        <div className="absolute inset-0 bg-black/40 z-10" />
        {/* Subtle Gradient from bottom to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-10" />
      </div>

      <div className="relative z-20 container mx-auto px-5 text-center flex flex-col items-center gap-8">
        {/* Minimal Typography - No badges, just bold statement */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white drop-shadow-lg leading-tight md:leading-snug">
          ABSOLVENTSKÉ<br />
          <span className="text-white/90">KŘESŤANSKÉ HNUTÍ</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/95 max-w-2xl font-light tracking-wide leading-relaxed drop-shadow-md">
          Spojujeme lidi, kteří chtějí růst ve víře i v životě. <br className="hidden md:block" />
          Přidej se k síti absolventských společenství po celé ČR.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Link href="/spolecenstvi">
            <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-white text-black hover:bg-white/90 transition-all font-bold border-2 border-white">
              Najít společenství
            </Button>
          </Link>
          <Link href="/akce">
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-full border-2 border-white text-white bg-black/20 hover:bg-white hover:text-black transition-all font-bold">
              Kalendář akcí
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
