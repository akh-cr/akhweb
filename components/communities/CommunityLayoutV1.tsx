import { CommunityLayoutProps } from "./types";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Gallery } from "@/components/gallery";
import { ViewSwitcher } from "@/components/events/ViewSwitcher";
import { ArrowLeft, User, Mail } from "lucide-react";
import Link from "next/link";

export function CommunityLayoutV1({ community }: CommunityLayoutProps) {
    return (
        <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] bg-background">
            <ViewSwitcher currentDesign="v1" />
            <Navbar />

            <article className="max-w-3xl mx-auto w-full px-5 py-24 md:py-32">
                
                {/* Header */}
                <header className="mb-12 text-center">
                    <div className="flex justify-center gap-2 mb-6">
                        <span className="bg-secondary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Společenství
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight text-foreground">
                        {community.name}
                    </h1>
                </header>

                {/* Content */}
                {community.description && (
                    <div className="prose prose-lg dark:prose-invert max-w-none leading-loose mb-8 text-center text-xl text-muted-foreground">
                        <p>{community.description}</p>
                    </div>
                )}

                {community.content && (
                    <div 
                        className="prose prose-lg dark:prose-invert max-w-none leading-loose mb-12 rich-text"
                        dangerouslySetInnerHTML={{ __html: community.content }}
                    />
                )}

                {/* Leader Info - Minimal */}
                {community.mayor && (
                    <div className="bg-muted/30 p-8 rounded-2xl text-center mb-16">
                        <h3 className="font-semibold mb-4">Kontakt na vedoucího</h3>
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2 text-lg">
                                <User className="h-5 w-5 text-primary" />
                                <span>{community.mayor.nickname || "Neznámý"}</span>
                            </div>
                            {community.mayor.contact_email && (
                                <a href={`mailto:${community.mayor.contact_email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                                    <Mail className="h-4 w-4" />
                                    <span>{community.mayor.contact_email}</span>
                                </a>
                            )}
                        </div>
                    </div>
                )}

                 {/* Gallery */}
                {community.gallery_images && community.gallery_images.length > 0 && (
                     <div className="mt-16 pt-16 border-t">
                        <Gallery images={community.gallery_images} title={`Fotogalerie ${community.name}`} />
                     </div>
                )}
                
                <div className="mt-16 pt-8 border-t flex justify-center">
                    <Link href="/spolecenstvi" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" /> Zpět na přehled společenství
                    </Link>
                </div>
            </article>

            <Footer />
        </main>
    );
}
