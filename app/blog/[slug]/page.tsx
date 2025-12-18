import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const unwrappedParams = await params;
  const supabase = await createClient();
  const { data: post } = await supabase.from('posts').select('*').eq('slug', unwrappedParams.slug).single();

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] bg-[#f5f5f5]">
      <Navbar />

      <article className="w-full max-w-3xl mx-auto py-20 px-5 bg-card shadow-sm my-10 rounded-xl border">
         <div className="mb-8 text-center">
             <div className="text-sm text-muted-foreground mb-4">
                {new Date(post.published_at).toLocaleDateString("cs-CZ", { day: 'numeric', month: 'long', year: 'numeric' })}
             </div>
             <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">{post.title}</h1>
             {post.image_url && (
                 <img src={post.image_url} alt={post.title} className="w-full h-auto rounded-lg mb-8" />
             )}
         </div>

         <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-img:rounded-lg rich-text" dangerouslySetInnerHTML={{ __html: post.content || "" }} />

         <div className="mt-12 pt-8 border-t flex justify-center">
            <Link href="/blog">
                <Button variant="ghost"><ArrowLeft className="mr-2 h-4 w-4"/>Zpět na blog</Button>
            </Link>
         </div>
      </article>
    </main>
  );
}
