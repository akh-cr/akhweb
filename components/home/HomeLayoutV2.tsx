import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FeedSection } from "@/components/feed-section";
import { ViewSwitcher } from "@/components/events/ViewSwitcher";
import { HomeLayoutProps } from "./types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";

export function HomeLayoutV2({ feedItems }: HomeLayoutProps) {
  return (
    <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] bg-zinc-50 dark:bg-zinc-950">
      <ViewSwitcher currentDesign="v2" />
      <Navbar />
      
      {/* Magazine Hero */}
      <section className="pt-32 pb-12 px-5 text-center">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">KALENDÁŘ</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Přehled nejbližších akcí a setkání Absolventského křesťanského hnutí
          </p>
      </section>

      {/* Featured Article (First item) */}
      {feedItems.length > 0 && (
          <section className="w-full max-w-6xl mx-auto px-5 mb-16">
              <Link href={feedItems[0].type === 'event' ? `/akce/${feedItems[0].slug}` : `/blog/${feedItems[0].slug}`} className="group block relative aspect-[2/1] rounded-3xl overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                    {/* Placeholder image logic since we don't have images in feedItems yet - using generic pattern */}
                    <div className="absolute inset-0 bg-zinc-800 z-0 group-hover:scale-105 transition-transform duration-700" />
                    
                    <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 w-full max-w-4xl">
                        <span className="inline-block bg-primary px-3 py-1 rounded-full text-xs font-bold text-primary-foreground mb-4 uppercase tracking-wider">
                            Nejnovější
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight group-hover:underline decoration-white/30 underline-offset-8">
                            {feedItems[0].title}
                        </h2>
                        <p className="text-zinc-200 text-lg line-clamp-2 md:line-clamp-none max-w-2xl">
                            {feedItems[0].excerpt}
                        </p>
                    </div>
              </Link>
          </section>
      )}

      {/* Feed Section - Grid */}
      <FeedSection items={feedItems.slice(1)} showHeader={false} />

      <section className="py-24 text-center">
        <Link href="/blog">
            <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg border-2">
                Načíst další články <ArrowRight className="ml-2" />
            </Button>
        </Link>
      </section>

      <Footer />
    </main>
  );
}
