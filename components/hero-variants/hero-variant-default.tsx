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

export function HeroVariantDefault() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative w-full h-[600px] md:h-[700px] flex items-center justify-center bg-zinc-900 text-white overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        {backgroundImages.map((img, index) => (
          <div
            key={img}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url('${img}')`,
              opacity: index === currentImageIndex ? 0.4 : 0,
            }}
          />
        ))}
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-black/80 z-10" />
      </div>

      <div className="relative z-20 max-w-5xl mx-auto px-5 text-center flex flex-col items-center gap-6 md:gap-8">
        <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-white/90 text-sm font-medium tracking-wide uppercase backdrop-blur-sm border border-white/10 animate-fade-in">
          Křesťani a absolventi
        </span>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter leading-[1] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-sm uppercase max-w-4xl">
          Absolventské<br className="block" /> křesťanské hnutí
        </h1>
        
        <p className="text-lg md:text-2xl text-white/80 max-w-2xl leading-relaxed font-light">
          Spojujeme lidi, kteří chtějí růst ve víře i v životě. <br className="hidden md:block" />
          Přidej se k síti absolventských společenství po celé ČR.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Link href="/spolecenstvi">
            <Button size="lg" className="h-12 px-8 text-lg rounded-full bg-white text-black hover:bg-white/90 transition-all">
              Najít společenství
            </Button>
          </Link>
          <Link href="/o-nas">
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full border-white/30 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm">
              Zjistit více
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
