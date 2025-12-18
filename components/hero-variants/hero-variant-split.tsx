"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroVariantSplit() {
  return (
    <section className="relative w-full py-20 lg:py-32 bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      
      <div className="container relative z-10 mx-auto px-5">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Content */}
            <div className="flex flex-col gap-6 text-left">
                 <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 w-fit text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                    Pro absolventy a mladé profesionály
                 </div>
                 <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
                    Víra. Společenství.<br/> 
                    <span className="text-primary">Životní růst.</span>
                 </h1>
                 <p className="text-lg text-muted-foreground/90 max-w-xl leading-relaxed">
                    Jsme síť společenství pro ty, kteří už dostudovali, ale nechtějí kráčet životem ani vírou sami. Přidej se k nám.
                 </p>
                 <div className="flex flex-wrap gap-4 mt-2">
                    <Link href="/spolecenstvi">
                        <Button size="lg" className="h-12 px-8 rounded-full text-lg shadow-sm">
                            Najít společenství
                        </Button>
                    </Link>
                    <Link href="/o-nas">
                        <Button variant="outline" size="lg" className="h-12 px-8 rounded-full text-lg">
                            Více o nás
                        </Button>
                    </Link>
                 </div>
                 

            </div>

            {/* Right Column: Image */}
            <div className="relative aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden shadow-2xl border border-border/50 bg-zinc-100">
                <img 
                    src="/images/gallery/MB_2025_08_14.21.08.35_09887.jpg" 
                    alt="AKH Společenství" 
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                />
            </div>
        </div>
      </div>
    </section>
  )
}
