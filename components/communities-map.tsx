"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { CommunitiesMapSvg } from "./communities-map-svg"




export function CommunitiesMap({ cities }: { cities: any[] }) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null)

  return (
    <div className="w-full max-w-4xl mx-auto aspect-[16/9] relative bg-muted/20 rounded-xl border border-border overflow-hidden my-12">
        {cities.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center z-50 text-muted-foreground bg-muted/50">
                Žádná společenství nenalezena (Data load error?)
             </div>
        )}
        
        {/* Render SVG with Embedded Dots */}
        <div className="absolute inset-4 p-2 md:p-8 flex items-center justify-center">
            <CommunitiesMapSvg 
                cities={cities} 
                hoveredCity={hoveredCity} 
                onHoverCity={setHoveredCity} 
            />
        </div>
        

    </div>
  )
}
