"use client"

import { useState } from "react"
import Image, { ImageProps } from "next/image"
import { cn } from "@/lib/utils"

interface AnimatedImageProps extends ImageProps {
  containerClassName?: string
}

export function AnimatedImage({ className, containerClassName, alt, fill, ...props }: AnimatedImageProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={cn("relative overflow-hidden", fill && "absolute inset-0 h-full w-full", containerClassName)}>
      <Image
        className={cn(
          "duration-700 ease-in-out",
          isLoading ? "scale-110 blur-2xl grayscale" : "scale-100 blur-0 grayscale-0",
          className
        )}
        onLoad={() => setIsLoading(false)}
        alt={alt}
        fill={fill}
        {...props}
      />
    </div>
  )
}
