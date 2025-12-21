import Link from "next/link";
import Image from "next/image";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";
import { Mail, Facebook, Instagram, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: page } = await supabase.from('pages').select('*').eq('slug', 'kontakt').single();

  return (
    <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] bg-secondary/30">
      <Navbar />

      {/* Header */}
      {/* Hero */}
      <section className="relative w-full py-24 md:py-32 flex items-center justify-center overflow-hidden text-center px-5">
        <div className="absolute inset-0 z-0">
             <Image 
                src="/images/backgrounds/contact.jpg" 
                alt="Contact Background" 
                fill
                priority
                className="object-cover brightness-[0.3]" 
                sizes="100vw"
                quality={80}
             />
        </div>
        <div className="relative z-10 w-full max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tight">{page?.title || "Kontakt"}</h1>
            <div className="text-xl md:text-2xl text-zinc-200 leading-relaxed rich-text" dangerouslySetInnerHTML={{ __html: page?.content || "Jsme tu pro vás. Napište nám, zavolejte nebo se stavte na některé z našich akcí." }} />
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 w-full max-w-6xl mx-auto px-5 py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Adresa */}
        <div className="bg-card p-8 rounded-2xl border shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-foreground mb-6">
                <FileText className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Adresa sídla</h2>
            <div className="space-y-1 text-muted-foreground flex-1">
                <p className="font-medium text-foreground">Absolventské křesťanské hnutí, z. s.</p>
                <p>Ječná 505/2, Nové Město</p>
                <p>120 00 Praha 2</p>
                <p className="mt-4"><span className="font-semibold text-foreground">IČO:</span> 21202125</p>
            </div>
             <div className="mt-8 pt-6 border-t">
                 <h3 className="font-bold mb-2">Oficiální dokumenty</h3>
                 <a href="/ke-stazeni" className="text-primary hover:underline font-medium">
                    Přejít do sekce Ke stažení &rarr;
                 </a>
            </div>
        </div>

        {/* Bankovní spojení & Email */}
        <div className="bg-card p-8 rounded-2xl border shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
             <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-foreground mb-6">
                <Mail className="h-6 w-6" />
            </div>
             <h2 className="text-2xl font-bold mb-4">Spojte se s námi</h2>
             
             <div className="space-y-6 flex-1">
                <div>
                     <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Email</p>
                     <a href="mailto:info@akhcr.cz" className="text-xl font-bold hover:text-primary transition">info@akhcr.cz</a>
                </div>
                <div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Bankovní účet</p>
                    <p className="text-2xl font-mono text-foreground font-medium">2002808176/2010</p>
                </div>
                </div>

                <div className="pt-6 border-t mt-auto flex items-center gap-4">
                     <div className="h-24 w-24 bg-white p-2 rounded-lg border flex items-center justify-center shrink-0">
                        <Image 
                            src="/images/qr-platba.png" 
                            alt="QR Platba" 
                            fill
                            className="object-contain p-2" 
                            sizes="100px"
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Přispět můžete jednoduše naskenováním QR kódu.
                    </p>
                </div>
        </div>

        {/* Socials & People */}
        <div className="bg-card p-8 rounded-2xl border shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-900 delay-200">
             <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center text-foreground mb-6">
                <Instagram className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Sociální sítě</h2>
            <p className="text-muted-foreground mb-6">Sledujte nás na sociálních sítích a buďte v obraze.</p>
            
            <div className="flex gap-6 mb-8">
                <a href="https://www.facebook.com/akhcr.cz/" target="_blank">
                    <Button variant="ghost" className="h-24 w-24 rounded-2xl p-0 hover:bg-muted text-foreground border-2 border-muted hover:border-primary/50 transition-all flex items-center justify-center [&_svg]:size-auto">
                        <Facebook className="h-20 w-20" />
                    </Button>
                </a>
                <a href="https://instagram.com/akh_cr" target="_blank">
                    <Button variant="ghost" className="h-24 w-24 rounded-2xl p-0 hover:bg-muted text-foreground border-2 border-muted hover:border-primary/50 transition-all flex items-center justify-center [&_svg]:size-auto">
                        <Instagram className="h-20 w-20" />
                    </Button>
                </a>
            </div>

                <div className="pt-6 border-t mt-auto space-y-4">
                    <div>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Předseda spolku</p>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-secondary-foreground">VK</div>
                            <div>
                                <p className="font-bold">Vojtěch Kaska</p>
                                <a href="tel:+420720339904" className="text-sm text-muted-foreground hover:text-primary transition">+420 720 339 904</a>
                            </div>
                        </div>
                    </div>
                     <div>
                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Předsedkyně spolku</p>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-secondary-foreground">JC</div>
                            <div>
                                <p className="font-bold">Jana Capůrková</p>
                                {/* <a href="tel:..." className="text-sm text-muted-foreground hover:text-primary transition">...</a> */}
                            </div>
                        </div>
                    </div>
                </div>
        </div>

      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
