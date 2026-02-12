"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection({ variant = "clean", images }: { variant?: string, images?: string[] }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const safeImages = images || []

  useEffect(() => {
    if (safeImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prevIndex => (prevIndex + 1) % safeImages.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [safeImages])

  if (safeImages.length === 0) {
    return null
  }

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        {safeImages.map((img, index) => (
          <div
            key={img}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImageIndex ? "opacity-75" : "opacity-0"
            }`}
          >
             <Image
                src={img}
                alt="Slideshow Background"
                fill
                priority={index === 0}
                className="object-cover object-center"
                sizes="100vw"
                quality={85}
             />
          </div>
        ))}
        {/* Minimal Dark Overlay - Balanced for readability */}
        <div className="absolute inset-0 bg-black/20 z-10" />
        {/* Subtle Gradient from bottom to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 z-10" />
      </div>

      <div className="relative z-20 container mx-auto px-5 text-center flex flex-col items-center gap-8">
        {/* Minimal Typography - No badges, just bold statement */}
        <h1 className="text-3xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white drop-shadow-lg leading-tight md:leading-snug">
          ABSOLVENTSKÉ<br />
          <span className="text-white/90">KŘESŤANSKÉ HNUTÍ</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white max-w-2xl font-normal tracking-wide leading-relaxed drop-shadow-xl">
          Spojujeme lidi, kteří chtějí růst ve víře i v životě. <br className="hidden md:block" />
          Přidej se k síti absolventských společenství po celé ČR.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link href="/spolecenstvi">
                <Button size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm rounded-full px-8 text-lg h-14">
                  Najít společenství <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
        </div>
      </div>
    </section>
  )
}
