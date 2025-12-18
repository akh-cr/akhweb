"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"

import { HeroVariantDefault } from "./hero-variants/hero-variant-default"
import { HeroVariantSplit } from "./hero-variants/hero-variant-split"
import { HeroVariantMinimal } from "./hero-variants/hero-variant-minimal"
import { HeroVariantCleanSlideshow } from "./hero-variants/hero-variant-clean-slideshow"

type Variant = "default" | "split" | "minimal" | "clean"

export function HeroSection() {
  const [variant, setVariant] = useState<Variant>("clean")
  const [isOpen, setIsOpen] = useState(false)

  const renderGenericVariant = () => {
    switch (variant) {
      case "split": return <HeroVariantSplit />
      case "minimal": return <HeroVariantMinimal />
      case "clean": return <HeroVariantCleanSlideshow />
      default: return <HeroVariantDefault />
    }
  }

  return (
    <>
      {renderGenericVariant()}

      {/* Debug Switcher UI */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-2">
        {isOpen && (
            <div className="bg-background border rounded-lg shadow-xl p-3 flex flex-col gap-2 animate-in slide-in-from-bottom-5">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Hero Variant</p>
                <div className="flex gap-2 flex-wrap max-w-[200px] justify-end">
                    <Button 
                        size="sm" 
                        variant={variant === "default" ? "default" : "outline"}
                        onClick={() => setVariant("default")}
                    >
                        Default
                    </Button>
                    <Button 
                        size="sm" 
                        variant={variant === "clean" ? "default" : "outline"}
                        onClick={() => setVariant("clean")}
                    >
                        Clean
                    </Button>
                    <Button 
                        size="sm" 
                        variant={variant === "split" ? "default" : "outline"}
                        onClick={() => setVariant("split")}
                    >
                        Split
                    </Button>
                    <Button 
                        size="sm" 
                        variant={variant === "minimal" ? "default" : "outline"}
                        onClick={() => setVariant("minimal")}
                    >
                        Minimal
                    </Button>
                </div>
            </div>
        )}
        <Button 
            className="rounded-full shadow-lg h-12 w-12" 
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
        >
            <RefreshCcw className="h-5 w-5" />
        </Button>
      </div>
    </>
  )
}
