import { CommunityLayoutProps } from "./types";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Gallery } from "@/components/gallery";
import { ViewSwitcher } from "@/components/events/ViewSwitcher";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function CommunityLayoutV3({ community }: CommunityLayoutProps) {
     const heroImage = community.image_url || (community.gallery_images && community.gallery_images[0]);

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
                            alt={community.name} 
                            fill 
                            className="object-cover opacity-80"
                            priority
                        />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-zinc-900 z-10" />
                )}
                
                <div className="relative z-30 h-full max-w-7xl mx-auto px-5 flex flex-col justify-end pb-32">
                     <div className="inline-flex items-center gap-2 mb-4">
                        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
                            Společenství
                        </span>
                     </div>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 leading-none max-w-4xl tracking-tighter">
                        {community.name}
                    </h1>
                </div>
            </div>

            {/* Floating Content Card */}
            <div className="relative z-40 -mt-20 max-w-7xl mx-auto px-5 w-full grid lg:grid-cols-[1fr_400px] gap-8 pb-32">
                
                {/* Left: Content */}
                <div className="bg-background rounded-3xl p-8 md:p-12 shadow-2xl border">
                    {community.description && (
                         <div className="prose prose-lg dark:prose-invert max-w-none rich-text mb-8">
                            <p>{community.description}</p>
                        </div>
                    )}

                    {community.content && (
                        <div 
                            className="prose prose-lg dark:prose-invert max-w-none rich-text"
                            dangerouslySetInnerHTML={{ __html: community.content }}
                        />
                    )}

                    {community.gallery_images && community.gallery_images.length > 0 && (
                        <div className="mt-12 pt-12 border-t">
                            <Gallery images={community.gallery_images} title="Galerie" />
                        </div>
                    )}
                </div>

                {/* Right: Info Card */}
                <div className="space-y-6">
                    <div className="bg-background/80 backdrop-blur-xl border rounded-3xl p-8 sticky top-32 shadow-xl">
                        <h3 className="text-xl font-bold mb-6">Kontakt</h3>

                        <div className="space-y-6 mb-8">
                             {community.mayor && (
                                <div className="flex items-start gap-4">
                                    <User className="h-6 w-6 text-primary shrink-0" />
                                    <div>
                                        <p className="font-bold text-lg">{community.mayor.nickname || "Neznámý"}</p>
                                        <p className="text-muted-foreground text-sm">Kontakt</p>
                                    </div>
                                </div>
                            )}

                             <div className="flex items-start gap-4">
                                <MapPin className="h-6 w-6 text-primary shrink-0" />
                                <div>
                                    <p className="font-bold text-lg">{community.name}</p>
                                    <p className="text-muted-foreground text-sm">Lokalita</p>
                                </div>
                            </div>
                        </div>

                         {community.mayor?.contact_email && (
                            <a href={`mailto:${community.mayor.contact_email}`}>
                                    <Button size="lg" className="w-full text-lg h-14 rounded-xl shadow-lg shadow-primary/20">
                                    <Mail className="mr-2 h-5 w-5" /> Napsat zprávu
                                </Button>
                            </a>
                        )}

                        <div className="mt-8 pt-6 border-t">
                            <Link href="/spolecenstvi" className="flex items-center text-muted-foreground hover:text-foreground transition-colors justify-center">
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
