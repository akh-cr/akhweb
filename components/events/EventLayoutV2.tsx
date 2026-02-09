import { EventLayoutProps } from "./types";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Gallery } from "@/components/gallery";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ViewSwitcher } from "./ViewSwitcher";
import { TextWithLinks } from "@/components/ui/text-with-links";

export function EventLayoutV2({ event }: EventLayoutProps) {
    const heroImage = event.image_url || (event.gallery_images && event.gallery_images[0]) || event.city?.image_url;

    return (
        <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] bg-muted/10">
            <ViewSwitcher currentDesign="v2" />
            <Navbar />

            <div className="max-w-7xl mx-auto w-full px-5 py-12 md:py-20 grid md:grid-cols-[1fr_350px] gap-12 items-start">
                
                {/* Main Content Column */}
                <div className="space-y-8">
                     <Link href="/akce" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Zpět na akce
                    </Link>

                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">{event.title}</h1>
                         {event.description && <TextWithLinks text={event.description} className="text-xl text-muted-foreground" />}
                    </div>
                    
                    {heroImage ? (
                        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-sm">
                             <Image 
                                src={heroImage} 
                                alt={event.title} 
                                fill 
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-sm bg-gradient-to-br from-muted to-muted/50 border flex items-center justify-center">
                            <div className="text-muted-foreground/20 font-bold text-4xl select-none">AKH</div>
                        </div>
                    )}

                    <div className="prose prose-lg dark:prose-invert max-w-none bg-background p-8 rounded-2xl border shadow-sm">
                        {event.content && <div dangerouslySetInnerHTML={{ __html: event.content }} />}
                    </div>

                     {event.gallery_images && event.gallery_images.length > 0 && (
                        <div className="pt-8">
                            <Gallery images={event.gallery_images} title="Fotogalerie" />
                        </div>
                    )}
                </div>

                {/* Sticky Sidebar */}
                <div className="md:sticky md:top-24 space-y-6">
                    <div className="bg-background rounded-2xl border shadow-sm p-6 space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold border-b pb-2">Informace</h3>
                            
                            <div className="flex gap-4">
                                <div className="bg-primary/10 p-2 rounded-lg h-fit">
                                    <Calendar className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-muted-foreground">Kdy</p>
                                    <p className="text-foreground font-medium">
                                        {new Date(event.start_time).toLocaleDateString("cs-CZ")}
                                    </p>
                                     {event.end_time && (
                                         <p className="text-sm text-muted-foreground">
                                             do {new Date(event.end_time).toLocaleDateString("cs-CZ")}
                                         </p>
                                     )}
                                </div>
                            </div>

                             {event.location && (
                                <div className="flex gap-4">
                                    <div className="bg-primary/10 p-2 rounded-lg h-fit">
                                        <MapPin className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-muted-foreground">Kde</p>
                                        <p className="text-foreground font-medium">{event.location}</p>
                                        <p className="text-sm text-muted-foreground">{event.city?.name}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {event.registration_link ? (
                            <a href={event.registration_link} target="_blank" rel="noopener noreferrer" className="block">
                                <Button className="w-full text-lg py-6 shadow-md hover:shadow-lg transition-all" size="lg">
                                    Registrovat se
                                </Button>
                            </a>
                        ) : (
                            <Button disabled variant="secondary" className="w-full">Registrace uzavřena</Button>
                        )}
                    </div>

                     {/* Share / Actions */}
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" size="sm">
                            <Share2 className="h-4 w-4 mr-2" /> Sdílet
                        </Button>
                    </div>
                </div>

            </div>
            
            <Footer />
        </main>
    );
}
