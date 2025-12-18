"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HeroVariantMinimal() {
  return (
    <section className="relative w-full py-32 lg:py-48 flex items-center justify-center bg-background overflow-hidden">
        
      {/* Abstract Background */}
      <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-5 text-center flex flex-col items-center max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 text-foreground">
          ABSOLVENTSKÉ<br/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            KŘESŤANSKÉ HNUTÍ
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground font-light mb-10 max-w-2xl mx-auto">
           Budujeme prostor pro duchovní růst a přátelství v dospělém životě.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/spolecenstvi" className="w-full sm:w-auto">
            <Button size="lg" className="w-full h-14 px-10 text-lg rounded-full bg-foreground text-background hover:bg-foreground/90">
              Přidat se
            </Button>
          </Link>
          <Link href="/akce" className="w-full sm:w-auto">
            <Button variant="ghost" size="lg" className="w-full h-14 px-10 text-lg rounded-full hover:bg-muted">
              Kalendář akcí
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
