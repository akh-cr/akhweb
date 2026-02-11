import { EventLayoutProps } from "./types";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Gallery } from "@/components/gallery";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ViewSwitcher } from "./ViewSwitcher";
import { TextWithLinks } from "@/components/ui/text-with-links";

export function EventLayoutV1({ event }: EventLayoutProps) {
    return (
        <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] bg-background">
            <ViewSwitcher currentDesign="v1" />
            <Navbar />

            <article className="max-w-3xl mx-auto w-full px-5 py-24 md:py-32">
                
                {/* Minimal Header */}
                <header className="mb-12 text-center">
                    <div className="flex justify-center gap-2 mb-6">
                        <span className="bg-secondary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {event.city?.name || "Akce"}
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight text-foreground">
                        {event.title}
                    </h1>
                     {event.description && (
                         <TextWithLinks 
                            text={event.description} 
                            className="text-xl text-muted-foreground leading-relaxed" 
                         />
                     )}

                    <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-muted-foreground border-y py-4">
                        <div className="flex items-center gap-2">
                             <Calendar className="h-4 w-4" />
                             <span>{new Date(event.start_time).toLocaleDateString("cs-CZ")}</span>
                        </div>
                         {event.location && (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{event.location}</span>
                            </div>
                        )}
                    </div>
                </header>

                {/* Content - Reader Mode */}
                <div className="prose prose-lg dark:prose-invert max-w-none leading-loose rich-text">
                    {event.content && <div dangerouslySetInnerHTML={{ __html: event.content }} />}
                </div>

                {/* Call to Action */}
                <div className="my-16 flex flex-col sm:flex-row justify-center gap-4">
                    {event.registration_link && (
                        <a href={event.registration_link} target="_blank" rel="noopener noreferrer">
                            <Button size="lg" className="px-8 rounded-full w-full sm:w-auto">
                                Registrace na akci
                            </Button>
                        </a>
                    )}
                    
                    {event.facebook_event_link && (
                         <a href={event.facebook_event_link} target="_blank" rel="noopener noreferrer">
                            <Button size="lg" variant="outline" className="px-8 rounded-full w-full sm:w-auto gap-2">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600">
                                    <path d="M22 12.06C22 6.505 17.523 2 12 2C6.477 2 2 6.505 2 12.06C2 17.083 5.657 21.245 10.438 22V14.969H7.898V12.06H10.438V9.845C10.438 7.333 11.931 5.955 14.215 5.955C15.309 5.955 16.453 6.151 16.453 6.151V8.616H15.192C13.95 8.616 13.563 9.39 13.563 10.183V12.06H16.328L15.886 14.969H13.563V22C18.344 21.245 22 17.083 22 12.06Z" fill="currentColor" />
                                </svg>
                                Událost na Facebooku
                            </Button>
                        </a>
                    )}
                </div>

                 {/* Gallery - Simplified Bottom Section */}
                {event.gallery_images && event.gallery_images.length > 0 && (
                     <div className="mt-16 pt-16 border-t">
                        <Gallery images={event.gallery_images} title="Fotogalerie" />
                     </div>
                )}
                
                <div className="mt-16 pt-8 border-t flex justify-center">
                    <Link href="/akce" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" /> Zpět na přehled
                    </Link>
                </div>
            </article>

            <Footer />
        </main>
    );
}
