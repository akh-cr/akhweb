import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

export default function PodporaPage() {
  return (
    <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)]">
      <Navbar />
      
      {/* Header */}
      {/* Hero */}
      <section className="relative w-full py-24 md:py-32 flex items-center justify-center overflow-hidden text-center px-5">
        <div className="absolute inset-0 z-0">
            <img src="/images/backgrounds/support.jpg" alt="Support Background" className="w-full h-full object-cover brightness-[0.3]" />
        </div>
        <div className="relative z-10 w-full max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tight">Podpořte nás</h1>
            <p className="text-xl md:text-2xl text-zinc-200 leading-relaxed">
            Vaše podpora nám pomáhá propojovat mladé křesťany a tvořit společenství, které má smysl.
            </p>
        </div>
      </section>
      
      <div className="flex-1 w-full max-w-5xl mx-auto px-5 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Spiritual Support */}
        <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-bold">Duchovní podpora</h2>
            <div className="prose text-muted-foreground leading-relaxed">
                <p>
                    Jsme vděční za každou modlitbu a duchovní blízkost. Prosíme, myslete na naše společenství, na organizátory akcí i na všechny, kdo hledají své místo v církvi i ve světě.
                </p>
                <p>
                    Můžete se také zapojit jako dobrovolníci při organizaci akcí nebo ve vedení místních buněk AKH.
                </p>
            </div>
             <Button variant="outline" className="w-fit mt-2" asChild>
                <a href="mailto:info@akhcr.cz">Napsat nám</a>
            </Button>
        </div>

        {/* Financial Support */}
        <div className="flex flex-col gap-6 p-8 rounded-2xl bg-muted/30 border">
            <h2 className="text-3xl font-bold">Finanční podpora</h2>
            <p className="text-muted-foreground">
                Finanční dary využíváme na organizaci celostátních setkání, podporu vzniku nových společenství a provoz webu.
            </p>
            
            <div className="mt-4 p-6 bg-background rounded-xl border shadow-sm">
                <p className="text-sm uppercase tracking-wide text-muted-foreground font-medium mb-2">Číslo účtu</p>
                <p className="text-2xl md:text-3xl font-mono font-bold text-foreground">
                    2002808176/2010
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                    Variabilní symbol: <span className="font-mono text-foreground">777</span>
                </p>
            </div>

            <div className="flex items-center gap-4 mt-2">
                <div className="h-32 w-32 bg-white p-2 rounded-lg border flex items-center justify-center relative overflow-hidden">
                    <img src="/images/qr-platba.png" alt="QR Platba" className="w-full h-full object-contain" />
                </div>
                <p className="text-sm text-muted-foreground flex-1">
                    Pro rychlou podporu můžete využít tento QR kód.
                </p>
            </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
