import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase.from('posts').select('*').order('published_at', { ascending: false });
  const { data: page } = await supabase.from('pages').select('*').eq('slug', 'blog-intro').single();

  return (
    <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] bg-[#f5f5f5]">
      <Navbar />

      {/* Blog Hero */}
      <section className="w-full py-20 text-center px-5 bg-background border-b">
         <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{page?.title || "Blog"}</h1>
         <div className="max-w-2xl mx-auto text-lg text-gray-600 rich-text" dangerouslySetInnerHTML={{ __html: page?.content || "<p>Články, zamyšlení a novinky ze života hnutí.</p>" }} />
      </section>

      {/* Posts Grid */}
      <section className="w-full py-16 px-5 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts?.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                    <div className="bg-card rounded-xl border overflow-hidden hover:shadow-lg transition h-full flex flex-col">
                        {post.image_url && (
                            <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover" />
                        )}
                        <div className="p-6 flex-1 flex flex-col">
                            <p className="text-sm text-muted-foreground mb-2">
                                {new Date(post.published_at).toLocaleDateString("cs-CZ", { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition">{post.title}</h3>
                            <p className="text-gray-600 line-clamp-3 mb-4 flex-1">{post.excerpt}</p>
                            <span className="text-sm font-medium text-primary underline decoration-transparent group-hover:decoration-primary transition underline-offset-4">Číst více</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
        {(!posts || posts.length === 0) && (
            <div className="text-center text-muted-foreground py-20">
                Zatím zde nejsou žádné články.
            </div>
        )}
      </section>
    </main>
  );
}
