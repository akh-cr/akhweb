"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"

import { HeroVariantDefault } from "./hero-variants/hero-variant-default"
import { HeroVariantSplit } from "./hero-variants/hero-variant-split"
import { HeroVariantMinimal } from "./hero-variants/hero-variant-minimal"
import { HeroVariantCleanSlideshow } from "./hero-variants/hero-variant-clean-slideshow"

type Variant = "default" | "split" | "minimal" | "clean"

export function HeroSection({ variant = "clean", images }: { variant?: string, images?: string[] }) {
  const renderGenericVariant = () => {
    switch (variant) {
      case "split": return <HeroVariantSplit />
      case "minimal": return <HeroVariantMinimal />
      case "clean": return <HeroVariantCleanSlideshow images={images} />
      case "default": 
      default: return <HeroVariantDefault />
    }
  }

  return (
    <>
      {renderGenericVariant()}
    </>
  )
}
