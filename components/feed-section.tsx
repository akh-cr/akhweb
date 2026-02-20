"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getOrganizerTagPresentation } from "@/lib/event-organizer-colors"

interface FeedItem {
  id: string
  title: string
  slug?: string
  date: string
  type: 'event' | 'post' | 'community'
  excerpt?: string
  location?: string       // Full location string (e.g. "Klášter Emauzy, Praha")
  city?: string           // City name from relation (e.g. "Praha")
  image_url?: string | null
  gallery_images?: string[] | null
  organizer_name?: string | null
  organizer_color_hex?: string | null
}

export function FeedSection({
  items,
  showHeader = true,
  akhOrganizerColorHex,
}: {
  items: FeedItem[]
  showHeader?: boolean
  akhOrganizerColorHex?: string | null
}) {
  // Filter for events only if mixed content is passed, or just map them.
  // The current Home page passes only 'event' items with the new structure.
  
  return (
    <section className="w-full py-16 px-5 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {showHeader && (
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Aktuality a akce</h2>
                <p className="text-muted-foreground">Novinky ze života hnutí a přehled nejbližších setkání</p>
            </div>
            <div className="flex gap-2">
                <Link href="/blog">
                    <Button variant="default" size="lg" className="rounded-full px-8 font-semibold shadow-sm hover:shadow-md transition-all">
                        Další aktuality <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </div>
        </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const isEvent = item.type === "event"
            const isAkhEvent = isEvent && !item.organizer_name
            const organizerLabel = isEvent ? (item.organizer_name || "AKH") : null
            const organizerTag = isEvent
              ? getOrganizerTagPresentation(item.organizer_color_hex, isAkhEvent, akhOrganizerColorHex)
              : null

            return (
            <Link 
                key={`${item.type}-${item.id}`} 
                href={
                    item.type === 'post' ? `/blog/${item.slug || '#'}` : 
                    item.type === 'community' ? `/${item.slug || '#'}` :
                    `/akce/${item.slug || '#'}`
                }
                className={`flex flex-col h-full bg-card rounded-xl border overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all group ${!item.slug ? "pointer-events-none opacity-80" : ""}`}
            >
                {/* Image Caption/Cover */}
                {item.image_url ? (
                    <div className="relative h-48 w-full overflow-hidden">
                            <Image 
                            src={item.image_url} 
                            alt={item.title} 
                            fill 
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                    </div>
                ) : (
                    <div className="h-48 w-full bg-muted/50 flex items-center justify-center border-b">
                        <MapPin className="h-10 w-10 text-muted-foreground/20" />
                    </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                            {new Date(item.date).toLocaleDateString('cs-CZ')}
                        </span>
                        {isEvent && organizerLabel && (
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${organizerTag?.className || ""}`}
                            style={organizerTag?.style}
                          >
                            {organizerLabel}
                          </span>
                        )}
                    </div>

                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                    </h3>

                    {/* Venue Line: Always show full location if available, with MapPin */}
                    {item.location && (
                        <div className="flex items-center text-xs text-muted-foreground mb-2">
                            <MapPin className="h-3 w-3 mr-1 shrink-0" />
                            <span className="truncate">{item.location}</span>
                        </div>
                    )}

                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                        {item.excerpt}
                    </p>

                    <div className="flex items-center text-primary font-medium text-sm mt-auto group-hover:underline underline-offset-4 decoration-primary/30">
                        {item.gallery_images && item.gallery_images.length > 0 ? "Prohlédnout fotky" : "Zobrazit podrobnosti"} <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </div>
                </div>
            </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
