import { AnimatedImage } from "@/components/ui/animated-image";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { FileText, Mail, Instagram, Facebook } from "lucide-react";
import Image from "next/image";
import { getContentBlocks, HeaderBlock } from "@/lib/content";
import { Metadata } from "next";
import { getPageSeo } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('kontakt');
  return {
    title: seo?.title || "Kontakt",
    description: seo?.description || "Kontaktní informace a spojení na náš tým.",
  };
}

// Define interface for details if not imported
interface ContactDetails {
    address: string[];
    email: string;
    bankAccount: string;
    socials: {
        facebook?: string;
        instagram?: string;
    };
    people: Array<{
        role: string;
        name: string;
        image: string; // emoji or char
        phone?: string;
    }>;
}

export default async function ContactPage() {
    // Parallel fetching
    const contentMap = await getContentBlocks(['kontakt.header', 'kontakt.details']);

    const header = (contentMap['kontakt.header'] || {
        title: "Kontakt",
        subtitle: "Jsme tu pro tebe. Ozvi se nám.",
        image: "/images/backgrounds/contact.jpg"
    }) as HeaderBlock['content'];

    // Default details as fallback
    const defaultDetails: ContactDetails = {
        address: ["Velehrad 1", "687 06 Velehrad"],
        email: "info@absolventskyvelehrad.cz",
        bankAccount: "2100435942/2010",
        socials: {
            facebook: "https://www.facebook.com/absolventskyvelehrad",
            instagram: "https://www.instagram.com/absolventsky_velehrad/"
        },
        people: [
             { role: "Hlavní koordinátor", name: "Jan Novák", image: "JN", phone: "+420 123 456 789" }
        ]
    };

    const details = (contentMap['kontakt.details'] || defaultDetails) as ContactDetails;

    return (
    <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative w-full py-24 md:py-32 flex items-center justify-center overflow-hidden text-center px-5 border-b">
        <div className="absolute inset-0 z-0">
             <AnimatedImage 
                src={header.image || "/images/backgrounds/contact.jpg"} 
                alt={header.title}
                fill
                priority
                className="object-cover brightness-[0.3]" 
                sizes="100vw"
                quality={80}
             />
        </div>
        <div className="relative z-10 w-full max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tight">{header.title}</h1>
            <div className="text-xl md:text-2xl text-zinc-200 leading-relaxed rich-text" dangerouslySetInnerHTML={{ __html: header.subtitle || "" }} />
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
                {details.address.map((line, i) => (
                    <p key={i} className={i === 0 ? "font-medium text-foreground" : i === details.address.length - 1 ? "mt-4" : ""}>
                        {i === details.address.length - 1 ? <span className="font-semibold text-foreground">{line}</span> : line}
                    </p>
                ))}
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
                     <a href={`mailto:${details.email}`} className="text-xl font-bold hover:text-primary transition">{details.email}</a>
                </div>
                <div>
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">Bankovní účet</p>
                    <p className="text-2xl font-mono text-foreground font-medium">{details.bankAccount}</p>
                </div>
                </div>

                <div className="pt-6 border-t mt-auto flex items-center gap-4">
                     <div className="h-24 w-24 bg-white p-2 rounded-lg border flex items-center justify-center shrink-0 relative overflow-hidden">
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
                {details.socials.facebook && (
                    <a href={details.socials.facebook} target="_blank">
                        <Button variant="ghost" className="h-24 w-24 rounded-2xl p-0 hover:bg-muted text-foreground border-2 border-muted hover:border-primary/50 transition-all flex items-center justify-center [&_svg]:size-auto">
                            <Facebook className="h-20 w-20" />
                        </Button>
                    </a>
                )}
                {details.socials.instagram && (
                    <a href={details.socials.instagram} target="_blank">
                        <Button variant="ghost" className="h-24 w-24 rounded-2xl p-0 hover:bg-muted text-foreground border-2 border-muted hover:border-primary/50 transition-all flex items-center justify-center [&_svg]:size-auto">
                            <Instagram className="h-20 w-20" />
                        </Button>
                    </a>
                )}
            </div>

                <div className="pt-6 border-t mt-auto space-y-4">
                    {details.people.map((person, i) => (
                        <div key={i}>
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">{person.role}</p>
                            <div className="flex items-center gap-3">
                                {person.image?.startsWith('http') || person.image?.startsWith('/') ? (
                                    <div className="h-10 w-10 rounded-full overflow-hidden relative border shadow-sm shrink-0">
                                         <Image 
                                            src={person.image} 
                                            alt={person.name} 
                                            fill 
                                            className="object-cover"
                                            sizes="40px"
                                         />
                                    </div>
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center font-bold text-secondary-foreground shrink-0 text-sm">
                                        {person.image || person.name.substring(0,2).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold">{person.name}</p>
                                    {person.phone && (
                                        <a href={`tel:${person.phone.split(' ').join('')}`} className="text-sm text-muted-foreground hover:text-primary transition">{person.phone}</a>
                                    )}
                                </div>
                            </div>
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
