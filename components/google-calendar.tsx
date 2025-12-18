"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function GoogleCalendar() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-full h-full bg-muted animate-pulse" />
  }

  const isDark = resolvedTheme === "dark"

  return (
    <div className={cn(
      "w-full h-full rounded-xl overflow-hidden bg-white",
      isDark && "bg-zinc-900" 
    )}>
      <iframe 
        src="https://calendar.google.com/calendar/embed?src=c_64c2fa04923e833c63e15e926d92ae4cf4db6a29c36b482446308b5fd65ab728%40group.calendar.google.com&ctz=Europe%2FPrague&hl=cs&showTitle=0&showPrint=0&showTabs=0&showCalendars=0&showTz=0" 
        style={{
            border: 0,
            filter: isDark ? "invert(1) hue-rotate(180deg)" : "none"
        }} 
        className="w-full h-full"
        frameBorder="0" 
        scrolling="no"
      >
      </iframe>
    </div>
  )
}
