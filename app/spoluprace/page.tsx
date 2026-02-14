import { Navbar } from "@/components/navbar";
import Image from "next/image";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ExternalLink, HandHeart, Heart, Link as LinkIcon, Users, FileText } from "lucide-react";
import Link from "next/link";

import { getContentBlocks, HeaderBlock, TextImageBlock, PartnersBlock } from "@/lib/content";

import { Metadata } from "next";
import { getPageSeo } from "@/lib/seo";

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('spoluprace');
  return {
    title: seo?.title || "Spolupráce | AKH ČR",
    description: seo?.description || "Zapoj se, podpoř nás nebo se inspiruj u našich partnerů. Tvoříme společenství společně.",
  };
}

export default async function SpolupracePage() {
  const contentMap = await getContentBlocks(['spoluprace.header', 'spoluprace.zapoj_se', 'spoluprace.partners', 'kontakt.details']);
  
  const header = contentMap['spoluprace.header'] as HeaderBlock['content'] || { title: 'Spolupráce', subtitle: 'Budujeme společenství společně.' };
  const zapojSe = contentMap['spoluprace.zapoj_se'] as TextImageBlock['content'] || { title: 'Zapoj se', text: 'Přidej se k nám.', items: [] };
  const partners = contentMap['spoluprace.partners'] as PartnersBlock['content'] || { links: [] };
  const contactDetails = contentMap['kontakt.details'] as any || {}; 
  const bankAccount = contactDetails?.bankAccount;

  return (
    <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)]">
      <Navbar />
      
      {/* Hero */}
      <section className="relative w-full py-24 md:py-32 flex items-center justify-center overflow-hidden text-center px-5 bg-zinc-950 text-white">
        <div className="absolute inset-0 z-0">
             <Image 
                src={header.image || "/images/backgrounds/support.jpg"} 
                alt={header.title}
                fill
                priority
                className="object-cover opacity-30" 
                sizes="100vw"
                quality={80}
             />
        </div>
        <div className="relative z-10 w-full max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">{header.title}</h1>
            <p className="text-xl md:text-2xl text-zinc-200 leading-relaxed">
                {header.subtitle}
            </p>
        </div>
      </section>
      
      {/* SECTION 1: ZAPOJ SE (Volunteering) */}
      <section id="zapoj-se" className="w-full py-20 px-5 bg-background">
        <div className="max-w-5xl mx-auto">
             <div className="flex flex-col md:flex-row gap-12 items-center">
                 <div className="flex-1">
                     <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block">Zapoj se</span>
                     <h2 className="text-3xl md:text-4xl font-bold mb-6">{zapojSe.title || "Přidej ruku k dílu"}</h2>
                     <div className="prose text-muted-foreground leading-relaxed text-lg">
                        <p className="mb-4">
                            {zapojSe.text}
                        </p>
                        {zapojSe.items && zapojSe.items.length > 0 && (
                            <ul className="space-y-2 mb-6">
                                {zapojSe.items.map((item, i) => (
                                    <li key={i} className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-primary" /> {item}</li>
                                ))}
                            </ul>
                        )}
                     </div>
                     <div className="mt-8">
                        <Button size="lg" asChild>
                            <a href={zapojSe.ctaLink || "mailto:info@akhcr.cz"}>{zapojSe.ctaText || "Napiš nám"}</a>
                        </Button>
                     </div>
                 </div>
                 <div className="flex-1 relative aspect-square md:aspect-[4/3] w-full bg-muted rounded-2xl overflow-hidden">
                     {zapojSe.image && (
                     <Image
                        src={zapojSe.image}
                        alt="Dobrovolníci"
                        fill
                        className="object-cover"
                     />
                     )}
                 </div>
             </div>
        </div>
      </section>

      {/* SECTION 2: ODKAZY (Partners) */}
      <section id="odkazy" className="w-full py-20 px-5 bg-muted/30 border-y">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
                 <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block">Síť</span>
                 <h2 className="text-3xl md:text-4xl font-bold mb-4">Spolupracujeme a doporučujeme</h2>
                 <p className="text-muted-foreground max-w-2xl mx-auto">
                    Projekty a organizace, se kterými nás pojí společné hodnoty a vize.
                 </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.links.map((link: any, index: number) => (
                    <div key={index} className="p-6 rounded-xl border bg-card hover:shadow-lg hover:border-primary/50 transition-all flex flex-col justify-between gap-4 group">
                        <div>
                            <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors flex items-center gap-2">
                                {link.title}
                                <LinkIcon className="h-4 w-4 opacity-50" />
                            </h3>
                            {link.description && (
                                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                    {link.description}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2 mt-2">
                             <a href={link.url} target="_blank" className="text-sm text-muted-foreground hover:text-foreground hover:underline truncate flex items-center gap-1">
                                {link.url.replace('https://', '').replace('www.', '').replace(/\/$/, '')} <ExternalLink className="h-3 w-3" />
                             </a>
                             {link.secondary && (
                                <a href={link.secondary.url} target="_blank" className="text-sm text-muted-foreground hover:text-foreground hover:underline truncate flex items-center gap-1">
                                    {link.secondary.url.replace('https://', '').replace('www.', '').replace(/\/$/, '')} <ExternalLink className="h-3 w-3" />
                                </a>
                             )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* SECTION 3: PODPORA (Financial) */}
      <section id="podpora" className="w-full py-20 px-5 bg-background">
        <div className="max-w-4xl mx-auto text-center">
            <span className="text-primary font-bold tracking-widest uppercase text-sm mb-2 block">Dary</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Finanční podpora</h2>
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                Vaše dary nám umožňují organizovat akce, podporovat vznik nových společenství a udržovat chod hnutí. Děkujeme za každou korunu.
            </p>

            <div className="bg-card border rounded-2xl p-8 shadow-sm max-w-2xl mx-auto relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="text-left">
                        <p className="text-sm uppercase tracking-wide text-muted-foreground font-medium mb-1">Číslo účtu</p>
                        <p className="text-2xl font-mono font-bold text-foreground mb-4 select-all">
                            {bankAccount}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Variabilní symbol: <span className="font-mono text-foreground font-bold">777</span>
                        </p>
                    </div>
                    <div className="flex flex-col items-center gap-2 bg-white p-4 rounded-xl border">
                        <div className="relative w-32 h-32">
                             <Image 
                                src="/images/qr-platba.png" 
                                alt="QR Platba" 
                                fill
                                className="object-contain" 
                             />
                        </div>
                        <p className="text-xs text-muted-foreground">Rychlá platba QR kódem</p>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                <a 
                    href="https://forms.gle/r7pDqbaC9xuV15nt5" 
                    target="_blank" 
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors hover:underline underline-offset-4"
                >
                    <FileText className="h-4 w-4" />
                    Žádost o vystavení potvrzení o daru
                </a>
            </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
