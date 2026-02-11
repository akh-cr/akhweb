
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { FeedSection } from "@/components/feed-section";
import { VideoPlayer } from "@/components/video-player";
import { createClient } from "@/lib/supabase/server";
import { Gallery } from "@/components/gallery";

import { HomeLayoutV1 } from "@/components/home/HomeLayoutV1";
import { HomeLayoutV2 } from "@/components/home/HomeLayoutV2";
import { HomeLayoutV3 } from "@/components/home/HomeLayoutV3";

import { HomeLayoutContent } from "@/components/home/types";

export default async function Home({ searchParams }: { searchParams: Promise<{ design?: string }> }) {
  const unwrappedSearchParams = await searchParams;
  const design = unwrappedSearchParams.design || 'clean';
  
  const supabase = await createClient();
  const now = new Date().toISOString();

  // Fetch unified news feed via RPC
  const { data: feedData } = await supabase
    .rpc('get_news_feed', { 
        p_limit: 3, 
        p_offset: 0, 
        p_include_hidden: false 
    });

  const contentPromise = supabase
    .from('content_blocks')
    .select('*')
    .in('id', ['home.gallery', 'home.video', 'home.about', 'home.hero']);

  let [{ data: contentBlocks }] = await Promise.all([
    contentPromise
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

  // Always use HomeLayoutV1, but pass the design param to control the hero variant
  return <HomeLayoutV1 feedItems={feedItems} design={design} content={contentMap} />;
}
