"use client"

import Link from "next/link"
import { ArrowRight, Calendar, Newspaper } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FeedItem {
  id: string
  title: string
  slug?: string
  date: string
  type: 'event' | 'post'
  excerpt?: string
  location?: string
}

export function FeedSection({ items }: { items: FeedItem[] }) {
  return (
    <section className="w-full py-16 px-5 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Co se děje</h2>
                <p className="text-muted-foreground">Nejnovější články a nejbližší akce</p>
            </div>
            <div className="flex gap-2">
                <Link href="/akce">
                    <Button variant="outline" size="sm">Kalendář akcí</Button>
                </Link>
                <Link href="/blog">
                    <Button variant="outline" size="sm">Všechny články</Button>
                </Link>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Link 
                key={`${item.type}-${item.id}`} 
                href={item.type === 'event' ? `/akce/${item.slug}` : `/blog/${item.slug}`}
                className="group flex flex-col h-full bg-card rounded-xl border overflow-hidden hover:border-primary/50 transition-all hover:shadow-md"
            >
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-3 text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                    {item.type === 'event' ? (
                        <span className="flex items-center gap-1 text-primary"><Calendar className="h-3 w-3" /> Akce</span>
                    ) : (
                        <span className="flex items-center gap-1 text-blue-500"><Newspaper className="h-3 w-3" /> Článek</span>
                    )}
                    <span>•</span>
                    <span>{new Date(item.date).toLocaleDateString('cs-CZ')}</span>
                </div>
                
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                </h3>
                
                {item.location && (
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                        At: {item.location}
                    </p>
                )}

                <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
                    {item.excerpt}
                </p>

                <div className="flex items-center text-primary font-medium text-sm mt-auto group-hover:underline underline-offset-4 decoration-primary/30">
                    Číst více <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
