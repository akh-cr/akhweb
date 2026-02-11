import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArrowLeft, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { TextWithLinks } from "@/components/ui/text-with-links";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from('posts').select('*').eq('slug', unwrappedParams.slug).single();

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] bg-background">
      <Navbar />

      <article className="max-w-3xl mx-auto w-full px-5 py-24 md:py-32">
         {/* Minimal Header */}
         <header className="mb-12 text-center">
             <div className="flex justify-center gap-2 mb-6">
                 <span className="bg-secondary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Blog
                 </span>
             </div>
             <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight text-foreground">
                 {post.title}
             </h1>

             {post.excerpt && (
                 <div className="mb-8">
                    <TextWithLinks 
                        text={post.excerpt} 
                        className="text-xl text-muted-foreground leading-relaxed" 
                    />
                 </div>
             )}

            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground border-y py-4">
                <div className="flex items-center gap-2">
                     <Calendar className="h-4 w-4" />
                     <span>{new Date(post.published_at).toLocaleDateString("cs-CZ", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
            </div>
         </header>

         {/* Content */}
         <div className="prose prose-lg dark:prose-invert max-w-none leading-loose rich-text">
            {post.image_url && (
                <img 
                    src={post.image_url} 
                    alt={post.title} 
                    className="w-full h-auto rounded-xl shadow-sm mb-12" 
                />
            )}
            
            <div dangerouslySetInnerHTML={{ __html: post.content || "" }} />
         </div>

         <div className="mt-16 pt-8 border-t flex justify-center">
            <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Zpět na blog
            </Link>
         </div>
      </article>
      
      <Footer />
    </main>
  );
}
