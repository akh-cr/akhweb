import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default function UsefulLinksPage() {
  const links = [
    { title: "Absolventský Velehrad", url: "https://absolventskyvelehrad.cz/" },
    { title: "Post-mládež", url: "https://www.post-mladez.cz/" },
    { title: "Univerzitní křesťanské hnutí", url: "https://www.ukh.cz/" },
    { title: "VKH ČR", url: "https://vkhcr.cz/" },
    { title: "HELPNI", url: "https://helpni.cz/" },
    { title: "Boží rande", url: "https://www.bozirande.cz/" },
    { title: "Schola AV21", url: "https://www.facebook.com/scholaav21/" },
    { 
        title: "Festapp", 
        url: "https://festapp.net/",
        secondary: { title: "vstupenky.online", url: "https://vstupenky.online" }
    },
    { title: "Kamedit", url: "https://kamedit.com/" },
    { title: "Credo Nadace", url: "https://www.credonadace.cz/" }
  ];

  return (
    <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] bg-secondary/30">
      <Navbar />

      {/* Hero */}
      <section className="relative w-full py-24 md:py-32 flex items-center justify-center overflow-hidden text-center px-5 border-b">
        <div className="absolute inset-0 z-0">
            <img src="/images/backgrounds/links-new.jpg" alt="Links Background" className="w-full h-full object-cover brightness-[0.3]" />
        </div>
        <div className="relative z-10 w-full max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tight">Užitečné odkazy</h1>
            <div className="text-xl md:text-2xl text-zinc-200 leading-relaxed">
                Doporučujeme následující projekty a služby, které stojí za to sledovat.
            </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 w-full max-w-5xl mx-auto px-5 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {links.map((link: any, index) => (
              <div key={index} className="p-6 rounded-2xl border bg-card hover:shadow-lg hover:border-primary/50 transition-all flex flex-col justify-between gap-4 group">
                  <div>
                      <h2 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                        {link.title} 
                        {link.secondary && <span className="text-muted-foreground font-normal"> & {link.secondary.title}</span>}
                      </h2>
                      <div className="flex flex-col gap-1">
                          <a href={link.url} target="_blank" className="text-muted-foreground text-sm hover:underline hover:text-foreground transition-colors truncate block">{link.url}</a>
                          {link.secondary && (
                              <a href={link.secondary.url} target="_blank" className="text-muted-foreground text-sm hover:underline hover:text-foreground transition-colors truncate block">{link.secondary.url}</a>
                          )}
                      </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                      <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                          <Link href={link.url} target="_blank" className="gap-2">
                              Otevřít <ExternalLink className="h-3 w-3" />
                          </Link>
                      </Button>
                      {link.secondary && (
                          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                              <Link href={link.secondary.url} target="_blank" className="gap-2">
                                  {link.secondary.title} <ExternalLink className="h-3 w-3" />
                              </Link>
                          </Button>
                      )}
                  </div>
              </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
