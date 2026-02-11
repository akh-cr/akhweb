import { CommunityLayoutProps } from "./types";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Gallery } from "@/components/gallery";
import { ViewSwitcher } from "@/components/events/ViewSwitcher";
import { ArrowLeft, User, Mail, Map } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function CommunityLayoutV2({ community }: CommunityLayoutProps) {
    const heroImage = community.image_url || (community.gallery_images && community.gallery_images[0]);

    return (
        <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] bg-muted/10">
            <ViewSwitcher currentDesign="v2" />
            <Navbar />

            <div className="max-w-7xl mx-auto w-full px-5 py-12 md:py-20 grid md:grid-cols-[1fr_350px] gap-12 items-start">
                
                {/* Main Content */}
                <div className="space-y-8">
                     <Link href="/spolecenstvi" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Zpět na společenství
                    </Link>

                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">{community.name}</h1>
                    </div>
                    
                    {heroImage ? (
                        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-sm">
                             <Image 
                                src={heroImage} 
                                alt={community.name} 
                                fill 
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-sm bg-gradient-to-br from-muted to-muted/50 border flex items-center justify-center">
                            <div className="text-muted-foreground/20 font-bold text-4xl select-none">AKH</div>
                        </div>
                    )}

                    {community.description && (
                        <div className="prose prose-lg dark:prose-invert max-w-none bg-background p-8 rounded-2xl border shadow-sm mb-8 rich-text">
                            <p>{community.description}</p>
                        </div>
                    )}

                    {community.content && (
                        <div 
                            className="prose prose-lg dark:prose-invert max-w-none bg-background p-8 rounded-2xl border shadow-sm rich-text"
                            dangerouslySetInnerHTML={{ __html: community.content }}
                        />
                    )}

                     {community.gallery_images && community.gallery_images.length > 0 && (
                        <div className="pt-8">
                            <Gallery images={community.gallery_images} title="Fotogalerie ze života společenství" />
                        </div>
                    )}
                </div>

                {/* Sticky Sidebar */}
                <div className="md:sticky md:top-24 space-y-6">
                    <div className="bg-background rounded-2xl border shadow-sm p-6 space-y-6">
                        <h3 className="text-lg font-bold border-b pb-2">O společenství</h3>
                        
                        {community.mayor && (
                             <div className="flex gap-4">
                                <div className="bg-primary/10 p-2 rounded-lg h-fit">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-muted-foreground">Kontakt</p>
                                    <p className="text-foreground font-medium">{community.mayor.nickname || "Neznámý"}</p>
                                    {community.mayor.contact_email && (
                                        <a href={`mailto:${community.mayor.contact_email}`} className="text-sm text-primary hover:underline mt-1 block">
                                            {community.mayor.contact_email}
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                        
                         {/* Placeholder for future map integration if lat/long functionality is robust */}
                        <div className="flex gap-4">
                             <div className="bg-primary/10 p-2 rounded-lg h-fit">
                                <Map className="h-5 w-5 text-primary" />
                             </div>
                            <div>
                                <p className="font-semibold text-sm text-muted-foreground">Lokalita</p>
                                <p className="text-foreground font-medium">{community.name}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            
            <Footer />
        </main>
    );
}
