import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Footer } from "@/components/footer";
import { TeamSection } from "@/components/team-section";

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: page } = await supabase.from('pages').select('*').eq('slug', 'o-nas').single();

  return (
    <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] bg-secondary/30">
      <Navbar />

      <section className="relative w-full py-24 md:py-32 flex items-center justify-center overflow-hidden text-center px-5 border-b">
         <div className="absolute inset-0 z-0">
             <img src="/images/backgrounds/o-nas-v4.jpg" alt="About Background" className="w-full h-full object-cover brightness-[0.25]" />
             <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
         </div>

         <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
             <span className="text-primary font-bold tracking-[0.2em] uppercase mb-4 text-sm md:text-base bg-primary/10 px-4 py-2 rounded-full backdrop-blur-sm border border-primary/20">
                O nás
             </span>
             <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-8 text-white drop-shadow-xl max-w-3xl leading-tight">
                O Absolventském křesťanském hnutí
             </h1>
             <div className="text-base md:text-xl text-zinc-200 leading-relaxed rich-text max-w-3xl bg-black/40 p-8 rounded-3xl backdrop-blur-md border border-white/10 text-justify">
                <p className="mb-4">
                    Jsme společenství, které spojuje mladé absolventy v jejich víře a životě. Naším cílem je vytvářet prostor pro setkávání, sdílení a duchovní růst i po ukončení vysokoškolských studií.
                </p>
                <p className="mb-4">
                    Absolventské křesťanské hnutí (AKH) navazuje na tradici vysokoškolských katolických hnutí. Nabízíme přechodový můstek mezi studentským životem a plným zapojením do profesního a farního života. Organizujeme pravidelná setkání v regionech, celostátní akce, duchovní obnovy a vzdělávací programy.
                </p>
                <p>
                    Věříme, že víra se má žít ve všech oblastech života – v práci, v rodině i ve společnosti. Chceme se navzájem povzbuzovat k tomu, abychom byli solí země a světlem světa v prostředí, ve kterém žijeme a pracujeme.
                </p>
             </div>
         </div>
      </section>

      <TeamSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
