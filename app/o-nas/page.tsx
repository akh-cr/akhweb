import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/server";
import { getContentBlocks, HeaderBlock, RichTextBlock } from "@/lib/content";
import Link from "next/link";
import { AnimatedImage } from "@/components/ui/animated-image";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Footer } from "@/components/footer";
import { TeamSection } from "@/components/team-section";

import { Metadata } from "next";
import { getPageSeo } from "@/lib/seo";

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('o-nas');
  return {
    title: seo?.title || "O nás",
    description: seo?.description || "Zjistěte více o Absolventském křesťanském hnutí, naší vizi a lidech, kteří za ním stojí.",
  };
}

export default async function AboutPage() {
  const contentMap = await getContentBlocks(['o-nas.header', 'o-nas.content']);
  
  const header = contentMap['o-nas.header'] as HeaderBlock['content'] | undefined;
  const content = contentMap['o-nas.content'] as RichTextBlock['content'] | undefined;

  return (
    <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] bg-secondary/30">
      <Navbar />

      {/* Hero */}
      <section className="relative w-full py-24 md:py-32 flex items-center justify-center overflow-hidden text-center px-5">
         <div className="absolute inset-0 z-0">
             <AnimatedImage 
                 src={header?.image || "/images/backgrounds/onas-new.jpg"} 
                 alt={header?.title || "O nás"}
                 fill
                 priority
                 className="object-cover brightness-[0.3]" 
                 sizes="100vw"
                 quality={80}
             />
             <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
         </div>

         <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
             <span className="text-primary font-bold tracking-[0.2em] uppercase mb-4 text-sm md:text-base bg-primary/10 px-4 py-2 rounded-full backdrop-blur-sm border border-primary/20">
                O nás
             </span>
             <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-8 text-white drop-shadow-xl max-w-3xl leading-tight">
                {header?.title || "O nás"}
             </h1>
             <div className="text-base md:text-xl text-zinc-200 leading-relaxed rich-text max-w-3xl bg-black/40 p-8 rounded-3xl backdrop-blur-md border border-white/10 text-justify" dangerouslySetInnerHTML={{ __html: content?.content || "" }} />
         </div>
      </section>

      <TeamSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
