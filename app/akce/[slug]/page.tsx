import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EventLayoutV1 } from "@/components/events/EventLayoutV1";
import { EventLayoutV2 } from "@/components/events/EventLayoutV2";
import { EventLayoutV3 } from "@/components/events/EventLayoutV3";
import { EventLayoutV4 } from "@/components/events/EventLayoutV4";

import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug)
  const supabase = await createClient();
  const { data: event } = await supabase.from('events').select('title, description').eq('slug', slug).single();

  return {
    title: event?.title || 'Akce nenalezena',
    description: event?.description ? event.description.substring(0, 160) : 'Detail akce',
  }
}

export default async function EventDetailPage({ 
    params,
    searchParams 
}: { 
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ design?: string }>
}) {
  const unwrappedParams = await params;
  const unwrappedSearchParams = await searchParams;
  const design = unwrappedSearchParams.design || 'v1'; // Default to V1 (Minimalist)

  const supabase = await createClient();
  const slug = decodeURIComponent(unwrappedParams.slug); // Ensure we decode before querying

  const { data: rawEvent } = await supabase
    .from('events')
    .select('*, cities(name, image_url)') // Enhanced query
    .eq('slug', slug)
    .single();

  if (!rawEvent) {
    notFound();
  }

  // Map to stricter type if needed, or pass rawEvent if compatible
  // We need to reshape slightly because Supabase returns array/object structure that matches query
  const event = {
      ...rawEvent,
      city: rawEvent.cities // Map cities -> city
  };

  switch (design) {
      case 'v2':
          return <EventLayoutV2 event={event} />;
      case 'v3':
          return <EventLayoutV3 event={event} />;
      case 'v4':
          return <EventLayoutV4 event={event} />;
      case 'v1':
      default:
          return <EventLayoutV1 event={event} />;
  }
}
