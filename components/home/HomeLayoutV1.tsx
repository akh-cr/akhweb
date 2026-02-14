import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { FeedSection } from "@/components/feed-section";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { HomeLayoutProps } from "./types";
import dynamic from "next/dynamic";

const Gallery = dynamic(() => import("@/components/gallery").then(mod => mod.Gallery), {
  loading: () => <div className="w-full h-96 bg-muted/20 animate-pulse" />
});

const VideoPlayer = dynamic(() => import("@/components/video-player").then(mod => mod.VideoPlayer), {
  loading: () => <div className="w-full h-full bg-zinc-900 animate-pulse rounded-2xl" />
});

export function HomeLayoutV1({ feedItems, design = "clean", content }: HomeLayoutProps & { design?: string }) {
  const heroImages = content?.['home.hero']?.images || [];

  const galleryImages = content?.['home.gallery']?.images || [];

  const videoData = content?.['home.video'];

  const aboutData = content?.['home.about'];

  return (
    <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)]">

      <Navbar />
      
      <HeroSection variant={design} images={heroImages} />

      {/* Feed Section - Replaces FeaturesGallery */}
      <FeedSection items={feedItems} />

      {/* Gallery Section */}
      {galleryImages && galleryImages.length > 0 && (
      <Gallery 
        title="Galerie ze života AKH"
        images={galleryImages}
       />
      )}
      {/* Video Section */}
      {videoData && (
      <section className="w-full py-24 bg-black text-white px-5">
        <div className="max-w-4xl mx-auto text-center">
             <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">{videoData.title}</h2>
             <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-zinc-900">
                <VideoPlayer videoId={videoData.videoId} />
             </div>
             <p className="mt-8 text-zinc-400 max-w-2xl mx-auto">
                {videoData.description}
             </p>
        </div>
      </section>
      )}

      {/* Quote Section */}
      <section className="w-full py-12 bg-primary/5 px-5">
        <div className="max-w-4xl mx-auto text-center">
             <div className="mb-6 flex justify-center text-primary/20">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H15.017C14.4647 8 14.017 8.44772 14.017 9V11C14.017 11.5523 13.5693 12 13.017 12H12.017V5H22.017V15C22.017 18.3137 19.3307 21 16.017 21H14.017ZM5.01697 21L5.01697 18C5.01697 16.8954 5.9124 16 7.01697 16H10.017C10.5693 16 11.017 15.5523 11.017 15V9C11.017 8.44772 10.5693 8 10.017 8H6.01697C5.46468 8 5.01697 8.44772 5.01697 9V11C5.01697 11.5523 4.56925 12 4.01697 12H3.01697V5H13.017V15C13.017 18.3137 10.3307 21 7.01697 21H5.01697Z" />
                </svg>
             </div>
             <blockquote className="text-lg md:text-2xl font-serif font-medium leading-relaxed mb-6 italic">
                "Tak jako tělo je jedno, ale má mnoho údů, a jako všecky údy těla jsou jedno tělo, ač je jich mnoho, tak je to i s Kristem."
             </blockquote>
             <cite className="not-italic text-base font-semibold text-muted-foreground block">
                — 1. Korintským 12, 12-14
             </cite>
        </div>
      </section>

      {/* Why Absolventi - Split Section */}
      {aboutData && (aboutData.title || aboutData.text) && (
      <section className="w-full py-24 bg-zinc-900 text-white px-5 overflow-hidden">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
             <div className="order-2 md:order-1">
                 {aboutData.title && <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">{aboutData.title}</h2>}
                 {aboutData.text && (
                 <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                    {aboutData.text}
                 </p>
                 )}
                 {aboutData.items && aboutData.items.length > 0 && (
                 <ul className="space-y-4 mb-8">
                    {aboutData.items.map((item: string, i: number) => (
                        <li key={i} className="flex items-center gap-3 text-zinc-300">
                            <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                <Check className="h-3 w-3 text-white" />
                            </div>
                            {item}
                        </li>
                    ))}
                 </ul>
                 )}
                 {aboutData.ctaLink && aboutData.ctaText && (
                 <Link href={aboutData.ctaLink}>
                    <Button variant="secondary" className="rounded-full px-8">
                        {aboutData.ctaText} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                 </Link>
                 )}
             </div>
             {aboutData.image && (
             <div className="order-1 md:order-2 relative">
                 <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-2xl blur-3xl"></div>
                 <div className="relative h-[400px] w-full bg-zinc-800 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center">
                     <Image 
                        src={aboutData.image} 
                        alt={aboutData.title || "Foto"} 
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        quality={80}
                     />
                 </div>
             </div>
             )}
          </div>
      </section>
      )}

      <Footer />
    </main>
  );
}
