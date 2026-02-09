import { EventLayoutProps } from "./types";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Gallery } from "@/components/gallery";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ViewSwitcher } from "./ViewSwitcher";
import { TextWithLinks } from "@/components/ui/text-with-links";

export function EventLayoutV3({ event }: EventLayoutProps) {
     const heroImage = event.image_url || (event.gallery_images && event.gallery_images[0]) || event.city?.image_url;

    return (
        <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] bg-zinc-50 dark:bg-zinc-950">
            <ViewSwitcher currentDesign="v3" />
            <div className="absolute inset-0 z-50 h-20">
                 <Navbar />
            </div>

            {/* Immersive Hero */}
            <div className="relative h-[80vh] w-full bg-zinc-900 text-white overflow-hidden">
                {heroImage ? (
                    <>
                        <div className="absolute inset-0 bg-black/50 z-10" />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent z-20" />
                        <Image 
                            src={heroImage} 
                            alt={event.title} 
                            fill 
                            className="object-cover opacity-80"
                            priority
                        />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-zinc-900 z-10" />
                )}
                
                <div className="relative z-30 h-full max-w-7xl mx-auto px-5 flex flex-col justify-end pb-32">
                     <div className="inline-flex items-center gap-2 mb-4">
                        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
                            {event.city?.name}
                        </span>
                     </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-none max-w-4xl tracking-tighter">
                        {event.title}
                    </h1>
                     {event.description && (
                        <TextWithLinks 
                            text={event.description} 
                            className="text-xl md:text-2xl text-zinc-300 max-w-2xl leading-relaxed" 
                        />
                    )}
                </div>
            </div>

            {/* Floating Content Card */}
            <div className="relative z-40 -mt-12 lg:-mt-32 max-w-7xl mx-auto px-5 w-full grid lg:grid-cols-[1fr_400px] gap-8 pb-32">
                
                {/* Left: Content */}
                <div className="bg-background rounded-3xl p-6 lg:p-12 shadow-2xl border">
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                        {event.content && <div dangerouslySetInnerHTML={{ __html: event.content }} />}
                    </div>

                    {event.gallery_images && event.gallery_images.length > 0 && (
                        <div className="mt-12 pt-12 border-t">
                            <Gallery images={event.gallery_images} title="Galerie" />
                        </div>
                    )}
                </div>

                {/* Right: Info Card */}
                <div className="space-y-6">
                    <div className="bg-background/80 backdrop-blur-xl border rounded-3xl p-6 lg:p-8 lg:sticky lg:top-32 shadow-xl">
                        <h3 className="text-xl font-bold mb-6">Detaily akce</h3>

                        <div className="space-y-6 mb-8">
                             <div className="flex items-start gap-4">
                                <Calendar className="h-6 w-6 text-primary shrink-0" />
                                <div>
                                    <p className="font-bold text-lg">{new Date(event.start_time).toLocaleDateString("cs-CZ")}</p>
                                    <p className="text-muted-foreground text-sm">Datum konání</p>
                                </div>
                            </div>

                             {event.location && (
                                <div className="flex items-start gap-4">
                                    <MapPin className="h-6 w-6 text-primary shrink-0" />
                                    <div>
                                        <p className="font-bold text-lg">{event.location}</p>
                                        <p className="text-muted-foreground text-sm">Místo konání</p>
                                    </div>
                                </div>
                            )}
                        </div>

                         {event.registration_link && (
                            <a href={event.registration_link} target="_blank" rel="noopener noreferrer">
                                <Button size="lg" className="w-full text-lg h-14 rounded-xl shadow-lg shadow-primary/20">
                                    Registrovat se
                                </Button>
                            </a>
                        )}

                        <div className="mt-8 pt-6 border-t">
                            <Link href="/akce" className="flex items-center text-muted-foreground hover:text-foreground transition-colors justify-center">
                                <ArrowLeft className="h-4 w-4 mr-2" /> Zpět na přehled
                            </Link>
                        </div>
                    </div>
                </div>

            </div>

            <Footer />
        </main>
    );
}
