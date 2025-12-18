import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export default async function GenericPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: page } = await supabase.from('pages').select('*').eq('slug', slug).single();

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] bg-secondary/30">
      <Navbar />
      
      <section className="w-full py-20 bg-background px-5 text-center border-b">
         <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">{page.title}</h1>
      </section>

      <section className="w-full py-16 px-5 flex justify-center">
          <div className="w-full max-w-4xl bg-card p-8 rounded-xl border shadow-sm prose prose-lg dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: page.content }} />
          </div>
      </section>
      
      <Footer />
    </main>
  );
}
