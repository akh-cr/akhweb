import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/supabase/server";
import { FeedSection } from "@/components/feed-section";
import Image from "next/image";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Metadata } from "next";
import { getPageSeo } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('blog');
  return {
    title: seo?.title || "Aktuality",
    description: seo?.description || "Články, zamyšlení a novinky ze života hnutí.",
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();
  const now = new Date().toISOString();
  
  const params = await searchParams;
  const page = typeof params.page === 'string' ? parseInt(params.page) : 1;
  const pageSize = 12;
  const from = (page - 1) * pageSize;

  // Fetch feed using RPC
  const { data: feedData, error } = await supabase
    .rpc('get_news_feed', {
      p_limit: pageSize,
      p_offset: from,
      p_include_hidden: false
    });

  const totalItems = feedData && feedData.length > 0 ? feedData[0].total_count : 0;
  const totalPages = Math.ceil(Number(totalItems) / pageSize);

  // Fetch blog hero content
  const { data: heroBlock } = await supabase
    .from('content_blocks')
    .select('content')
    .eq('id', 'blog.hero')
    .single();

  const heroContent = heroBlock?.content || {
      title: "Aktuality",
      subtitle: "Články, zamyšlení a novinky ze života hnutí.",
      image: null
  };

  const feedItems = (feedData || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      slug: item.type === 'post' ? item.slug : (item.type === 'community' ? `spolecenstvi/${item.slug}` : (item.slug || item.id)),
      date: item.published_at,
      type: item.type,
      excerpt: item.excerpt,
      location: item.location,
      city: item.city_name,
      image_url: item.image_url,
      gallery_images: null
  }));

  return (
    <main className="min-h-screen flex flex-col font-[family-name:var(--font-inter)] bg-[#f5f5f5] dark:bg-background">
      <Navbar />

      {/* Blog Hero */}
      <section className="w-full relative h-[400px] flex items-center justify-center overflow-hidden">
          {heroContent.image && (
              <div className="absolute inset-0 z-0">
                  <Image 
                    src={heroContent.image} 
                    alt="Blog Hero" 
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-black/50" />
              </div>
          )}
          {!heroContent.image && (
               <div className="absolute inset-0 z-0 bg-zinc-900" />
          )}

          <div className="relative z-10 text-center px-5 max-w-4xl mx-auto text-white">
             <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{heroContent.title}</h1>
             <p className="text-lg md:text-xl text-zinc-200">{heroContent.subtitle}</p>
          </div>
      </section>

      {/* Posts Grid */}
      <div className="flex-1">
        <FeedSection items={feedItems} showHeader={false} />
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
            <div className="max-w-7xl mx-auto px-5 pb-20">
                <Pagination>
                    <PaginationContent>
                        {page > 1 && (
                            <PaginationItem>
                                <PaginationPrevious href={`/blog?page=${page - 1}`} />
                            </PaginationItem>
                        )}
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                            if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                                return (
                                    <PaginationItem key={p}>
                                        <PaginationLink href={`/blog?page=${p}`} isActive={page === p}>
                                            {p}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            } else if (p === page - 2 || p === page + 2) {
                                return <PaginationItem key={p}><PaginationEllipsis /></PaginationItem>
                            }
                            return null;
                        })}

                        {page < totalPages && (
                            <PaginationItem>
                                <PaginationNext href={`/blog?page=${page + 1}`} />
                            </PaginationItem>
                        )}
                    </PaginationContent>
                </Pagination>
            </div>
        )}
      </div>


      <Footer />
    </main>
  );
}
