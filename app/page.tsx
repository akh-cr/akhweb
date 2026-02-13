
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { FeedSection } from "@/components/feed-section";
import { VideoPlayer } from "@/components/video-player";
import { createClient } from "@/lib/supabase/server";
import { Gallery } from "@/components/gallery";

import { HomeLayoutV1 } from "@/components/home/HomeLayoutV1";

import { HomeLayoutContent } from "@/components/home/types";

import { Metadata } from "next";
import { getPageSeo } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo('home');
  return {
    title: seo?.title || "AKH - ABSOLVENTSKÉ KŘESŤANSKÉ HNUTÍ",
    description: seo?.description || "Spojujeme lidi, kteří chtějí růst ve víře i v životě. Přidej se k síti absolventských společenství po celé ČR.",
  };
}

export default async function Home() {
  
  const supabase = await createClient();
  const now = new Date().toISOString();

  // Parallel fetching for initial load speed
  const [
    { data: feedData },
    [{ data: contentBlocks }]
  ] = await Promise.all([
     // Fetch unified news feed via RPC
     supabase.rpc('get_news_feed', { 
        p_limit: 3, 
        p_offset: 0, 
        p_include_hidden: false 
      }),
      // Fetch Content Blocks
      Promise.all([
        supabase
          .from('content_blocks')
          .select('*')
          .in('id', ['home.gallery', 'home.video', 'home.about', 'home.hero'])
      ])
  ]);
  
  const contentMap: HomeLayoutContent = (contentBlocks || []).reduce((acc: any, block: any) => {
    acc[block.id] = block.content;
    return acc;
  }, {});

  const feedItems = (feedData || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      date: item.published_at,
      type: item.type as 'post' | 'event' | 'community',
      excerpt: item.excerpt,
      location: item.location,
      city: item.city_name,
      image_url: item.image_url,
      gallery_images: null // RPC doesn't return gallery images to keep payload light
  }));

  // Always use HomeLayoutV1 with clean design
  return <HomeLayoutV1 feedItems={feedItems} design="clean" content={contentMap} />;
}
