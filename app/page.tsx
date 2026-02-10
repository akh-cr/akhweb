
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

  // Fetch upcoming events (limit 3)
  const eventsPromise = supabase
    .from('events')
    .select('*, cities(name)')
    .gte('start_time', now)
    .order('start_time', { ascending: true })
    .limit(3);

  const contentPromise = supabase
    .from('content_blocks')
    .select('*')
    .in('id', ['home.gallery', 'home.video', 'home.about', 'home.hero']);

  let [{ data: events }, { data: contentBlocks }] = await Promise.all([eventsPromise, contentPromise]);
  
  const contentMap: HomeLayoutContent = (contentBlocks || []).reduce((acc: any, block: any) => {
    acc[block.id] = block.content;
    return acc;
  }, {});

  // Fallback: If no upcoming events, show most recent past events
  if (!events || events.length === 0) {
      const { data: pastEvents } = await supabase
        .from('events')
        .select('*, cities(name)')
        .lt('start_time', now)
        .order('start_time', { ascending: false })
        .limit(3);
      events = pastEvents;
  }



  const feedItems = (events || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        slug: e.slug,
        date: e.start_time,
        type: 'event' as const,
        excerpt: e.description,
        location: e.location,
        city: e.cities?.name,
        image_url: e.image_url,
        gallery_images: e.gallery_images
  }));

  // Always use HomeLayoutV1, but pass the design param to control the hero variant
  return <HomeLayoutV1 feedItems={feedItems} design={design} content={contentMap} />;
}
