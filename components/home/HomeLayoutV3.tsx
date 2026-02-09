import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FeedSection } from "@/components/feed-section";
import { ViewSwitcher } from "@/components/events/ViewSwitcher";
import { HomeLayoutProps } from "./types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlayCircle, ChevronDown } from "lucide-react";
import { VideoPlayer } from "@/components/video-player";

export function HomeLayoutV3({ feedItems }: HomeLayoutProps) {
  return (
    <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] bg-black text-white">
      <ViewSwitcher currentDesign="v3" />
      
      <div className="absolute inset-0 z-50 h-20 pointer-events-none">
           <div className="pointer-events-auto">
                <Navbar />
           </div>
      </div>

      {/* Cinematic Hero - Fullscreen Video */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
               {/* We would ideally use a background video here, but for now we'll imply it with a dark aesthetic and maybe the player */}
               <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black z-10" />
                <div className="absolute inset-0 bg-zinc-900 opacity-50" />
               {/* Simulate video bg */}
               <img src="/images/gallery/MB_2025_08_14.21.08.35_09887.jpg" className="w-full h-full object-cover opacity-40 grayscale" />
          </div>

          <div className="relative z-20 text-center max-w-5xl px-5 space-y-8 pt-20">
              <h1 className="text-6xl md:text-9xl font-black tracking-tighter mix-blend-overlay text-white opacity-90">
                  AKH ČR
              </h1>
              <p className="text-2xl md:text-3xl font-light text-zinc-300 max-w-2xl mx-auto leading-relaxed">
                  Žijeme víru v každodenním životě. Spojujeme absolventy, tvoříme společenství.
              </p>
              
              <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
                  <Link href="/o-nas">
                    <Button size="lg" className="rounded-full h-14 px-10 text-lg bg-white text-black hover:bg-zinc-200 border-none transition-transform hover:scale-105">
                        <PlayCircle className="mr-2 h-5 w-5" /> Přehrát příběh
                    </Button>
                  </Link>
                  <Link href="/spolecenstvi">
                    <Button size="lg" variant="outline" className="rounded-full h-14 px-10 text-lg border-white/20 hover:bg-white/10 text-white backdrop-blur-sm transition-transform hover:scale-105">
                        Najít společenství
                    </Button>
                  </Link>
              </div>
          </div>

          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
              <ChevronDown className="h-10 w-10 text-white/50" />
          </div>
      </section>

      {/* Dark Content Section */}
      <section className="bg-black py-24 relative z-10">
          <div className="max-w-7xl mx-auto px-5">
              <div className="flex items-end justify-between mb-12 border-b border-white/10 pb-8">
                  <h2 className="text-4xl font-bold">Kalendář akcí</h2>
                  <Link href="/akce" className="text-zinc-400 hover:text-white transition-colors">Všechny akce &rarr;</Link>
              </div>
              
              {/* Force FeedSection to look 'dark mode' compliant if it isn't already */}
              <div className="dark">
                  <FeedSection items={feedItems} showHeader={false} />
              </div>
          </div>
      </section>

      <Footer />
    </main>
  );
}
