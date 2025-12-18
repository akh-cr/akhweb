import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";
import { MapPin, ArrowRight } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export default async function CommunitiesPage() {
  const supabase = await createClient();
  const { data: page } = await supabase.from('pages').select('*').eq('slug', 'spolecenstvi').single();
  const { data: cities } = await supabase.from('cities').select('*').order('name');

  return (
    <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] bg-background">
      <Navbar />

      {/* Hero */}
      {/* Hero */}
      {/* Hero */}
      {/* Hero - Split Layout */}
      <section className="w-full pt-32 pb-16 md:pt-48 md:pb-32 bg-background border-b">
         <div className="max-w-7xl mx-auto px-5 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
             
             {/* Left Column: Content */}
             <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                 <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8 text-foreground leading-[1.1]">
                    {page?.title || "Společenství"}
                 </h1>
                 <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                    Podporujeme a sdružujeme lokální společenství absolventů a mladých pracujících. Vytváříme prostor pro sdílení, inspiraci a společný růst ve víře i v životě.
                 </p>
             </div>

             {/* Right Column: Image */}
             <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl ring-1 ring-black/10 rotate-2 hover:rotate-0 transition-all duration-700 group">
                 <img 
                    src="/images/backgrounds/spolecenstvi-new.jpg" 
                    alt="Společenství" 
                    className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700" 
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
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-16 text-foreground">Kde nás najdeš</h2>
            
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
        
        <div className="relative z-10 max-w-4xl mx-auto px-5 text-center">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 text-foreground">
                Pro vedoucí společenství
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10">
                Hledáš materiály, tipy pro vedení nebo inspiraci pro tvé společenství? <br className="hidden md:block"/>Připravili jsme pro tebe sekci plnou užitečných zdrojů.
            </p>
            
            <a href="https://docs.google.com/document/d/1p2J2KJqbFXwVzJgH9zyf7_ttx1E4CBHd/edit?usp=drive_link&ouid=103164862258109550481&rtpof=true&sd=true" target="_blank">
                <Button size="lg" className="h-14 px-10 rounded-full text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all">
                    Zobrazit materiály <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </a>
        </div>
      </section>

      {/* Gallery */}
      <section className="w-full py-20 bg-muted/30 px-5 border-t">
           <div className="max-w-6xl mx-auto text-center">
               <span className="text-primary font-bold tracking-[0.2em] uppercase mb-4 text-xs md:text-sm bg-primary/10 px-3 py-1.5 rounded-full inline-block">
                    Galerie
               </span>
               <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-12 text-foreground">Život ve společenství</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {[1, 2, 3].map((i) => (
                       <div key={i} className="aspect-[4/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group ring-1 ring-black/5">
                           <img 
                                src={`/images/communities/${i}.jpg`} 
                                alt={`Společenství ${i}`} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                           />

                       </div>
                   ))}
               </div>
           </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
