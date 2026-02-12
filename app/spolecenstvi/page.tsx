import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";
import { MapPin, ArrowRight, FileText, ExternalLink, Home, Lightbulb, Calendar, Link as LinkIcon, Download, Euro, User } from "lucide-react";


import { AnimatedImage } from "@/components/ui/animated-image";
import dynamic from 'next/dynamic';

const CommunitiesMap = dynamic(() => import('@/components/communities-map').then(mod => mod.CommunitiesMap), {
  loading: () => <div className="w-full h-[400px] bg-muted animate-pulse rounded-2xl" />
});

import { createClient } from "@/lib/supabase/server";
import { getContentBlocks, HeaderBlock } from "@/lib/content";

import { Metadata } from "next";
import { getPageSeo } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('spolecenstvi');
  return {
    title: seo?.title || "Společenství",
    description: seo?.description || "Mapa a seznam společenství absolventů a mladých pracujících po celé ČR.",
  };
}


const ICON_MAP: Record<string, any> = {
    FileText,
    Home,
    Lightbulb,
    MapPin,
    Calendar,
    Link: LinkIcon,
    Download,
    Euro,
    User
};

function MaterialsSection({ block, defaults }: { 
    block?: { title: string; description?: string; items: Array<{ title: string; url: string; description?: string; icon?: string }> },
    defaults: { title: string; description: string; items: Array<{ title: string; url: string; description: string; icon?: string }> }
}) {
    const content = block || defaults;
    const items = content.items || [];
    
    if (!block && items.length === 0) return null; 

    return (
        <div className="relative z-10 max-w-6xl mx-auto px-5">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 text-foreground">
                    {content.title || defaults.title}
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                    {content.description || defaults.description}
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {items.map((item, i) => {
                    const IconComponent = (item.icon && ICON_MAP[item.icon]) ? ICON_MAP[item.icon] : FileText;
                    
                    return (
                        <a 
                            key={i} 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group"
                        >
                            <div className="h-full bg-background border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg flex flex-col items-start text-left">
                                <div className="w-12 h-12 rounded-xl bg-muted text-muted-foreground flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <IconComponent className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                                <p className="text-muted-foreground mb-4 flex-grow">
                                    {item.description}
                                </p>
                                <div className="flex items-center text-sm font-medium text-primary mt-auto">
                                    Otevřít <ExternalLink className="ml-2 w-4 h-4" />
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}

export default async function CommunitiesPage() {
  const supabase = await createClient();
  
  // Parallel fetching
  const [
    { data: cities },
    contentMap
  ] = await Promise.all([
    supabase.from('cities').select('*').eq('is_hidden', false).order('name'),
    getContentBlocks(['spolecenstvi.header', 'spolecenstvi.materials'])
  ]);

  const header = (contentMap['spolecenstvi.header'] || {
    title: "Společenství",
    subtitle: "Podporujeme a sdružujeme lokální společenství absolventů a mladých pracujících. Vytváříme prostor pro sdílení, inspiraci a společný růst ve víře i v životě.",
    image: "/images/backgrounds/spolecenstvi-new.jpg"
  }) as HeaderBlock['content'];

  return (
    <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] bg-background">
      <Navbar />

      {/* Hero */}
      <section className="w-full pt-32 pb-16 md:pt-48 md:pb-32 bg-background border-b">
         <div className="max-w-7xl mx-auto px-5 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
             
             {/* Left Column: Content */}
             <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                 <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8 text-foreground leading-[1.1]">
                    {header.title}
                 </h1>
                 <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                    {header.subtitle}
                 </p>
             </div>

             {/* Right Column: Image */}
             <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/10 rotate-2 hover:rotate-0 transition-all duration-700 group">
                 <AnimatedImage 
                    src={header.image || "/images/backgrounds/spolecenstvi-new.jpg"} 
                    alt={header.title}
                    fill
                    priority
                    className="object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    quality={80} 
                 />
                 <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
             </div>
         </div>
      </section>

      {/* Cities Grid */}
      <section className="w-full py-24 bg-background px-5">
        <div className="max-w-6xl mx-auto text-center">
            <span className="text-primary font-bold tracking-[0.2em] uppercase mb-4 text-xs md:text-sm bg-primary/10 px-3 py-1.5 rounded-full inline-block">
                Regiony
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-8 text-foreground">Kde nás najdeš</h2>

            {/* Interactive Map */}
            {cities && <CommunitiesMap cities={cities} />}

            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cities?.map((city) => (
                    <Link key={city.slug} href={`/spolecenstvi/${city.slug}`} className="group relative block h-full">
                        <div className="h-full bg-card rounded-2xl p-8 border transition-all duration-300 group-hover:border-primary/50 flex flex-col items-center justify-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors text-primary">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors text-center">
                                {city.name}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
      </section>

      {/* Useful Info Link - Full Width Design */}
      <section className="w-full py-32 bg-zinc-50 dark:bg-zinc-900/50 border-y relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        <MaterialsSection 
            block={contentMap['spolecenstvi.materials'] as any} 
            defaults={{
                title: "Pro vedoucí společenství",
                description: "Hledáš materiály, tipy pro vedení nebo inspiraci pro tvé společenství? Připravili jsme pro tebe sekci plnou užitečných zdrojů.",
                items: [
                    {
                        title: "Databáze ubytování",
                        url: "https://docs.google.com/spreadsheets/d/10v4XYUtua2s5mbCZYWK1jJZWRBxAeWNz_PQCv1oRzUE/edit?usp=sharing",
                        description: "Přehled ubytovacích možností pro víkendovky a akce společenství.",
                        icon: "Home"
                    },
                    {
                        title: "Inspiromat pro skupinky",
                        url: "https://docs.google.com/document/d/1ZyCQmEj6_oeI9ZrkTTHfXKGOrK6iuitYPPyU0oIuSAI/edit?usp=sharing",
                        description: "Tipy a podklady pro vedení modlitebních a sdílecích skupinek.",
                        icon: "Lightbulb"
                    },
                    {
                        title: "Materiály pro vedoucí",
                        url: "https://docs.google.com/document/d/1p2J2KJqbFXwVzJgH9zyf7_ttx1E4CBHd/edit?usp=drive_link&ouid=103164862258109550481&rtpof=true&sd=true",
                        description: "Kompletní sada dokumentů, formulářů a návodů pro vedení.",
                        icon: "FileText"
                    }
                ]
            }}
        />
      </section>



      {/* Footer */}
      <Footer />
    </main>
  );
}
