"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { CommunitiesMapSvg } from "./communities-map-svg"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"




export function CommunitiesMap({ cities }: { cities: any[] }) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-full h-full bg-muted animate-pulse rounded-xl" />
  }

  return (
    <div className="w-full max-w-4xl mx-auto aspect-[16/9] relative bg-muted/20 rounded-xl border border-border overflow-hidden my-12">
        {cities.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center z-50 text-muted-foreground bg-muted/50">
                Žádná společenství nenalezena (Chyba načítání dat?)
             </div>
        )}

        {/* Mobile Zoom Hint */}
        <div className="absolute bottom-2 right-2 z-40 bg-background/80 backdrop-blur px-2 py-1 rounded text-[10px] text-muted-foreground pointer-events-none md:hidden">
            Přiblížení roztažením prstů
        </div>
        
        {/* Render SVG with Embedded Dots and Zoom support */}
        <div className="absolute inset-0 flex items-center justify-center">
             <TransformWrapper
                initialScale={1}
                minScale={1}
                maxScale={4}
                centerOnInit
                wheel={{ disabled: true }} // Disable wheel zoom on desktop to prevent scroll hijacking, unless ctrl is pressed (optional, but good for maps)
                pinch={{ step: 10 }}
             >
                <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
                    <div className="w-full h-full p-2 md:p-8 flex items-center justify-center">
                        <CommunitiesMapSvg 
                            cities={cities} 
                            hoveredCity={hoveredCity} 
                            onHoverCity={setHoveredCity} 
                        />
                    </div>
                </TransformComponent>
             </TransformWrapper>
        </div>
        

    </div>
  )
}
