import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { EventLayoutV1 } from "@/components/events/EventLayoutV1";
import { getEventDetail } from "@/lib/events/read";
import { AKH_ORGANIZER_SETTINGS_ID, resolveAkhOrganizerColor } from "@/lib/event-organizer-colors";


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
  // Read through the events module so the metadata can never drift from the page.
  const { data: event } = await getEventDetail(supabase, slug);

  return {
    title: event?.title || 'Akce nenalezena',
    description: event?.description ? event.description.substring(0, 160) : 'Detail akce',
  }
}

export default async function EventDetailPage({ 
    params
}: { 
    params: Promise<{ slug: string }>
}) {
  const unwrappedParams = await params;

  const supabase = await createClient();
  const slug = decodeURIComponent(unwrappedParams.slug); // Ensure we decode before querying

  const [{ data: rawEvent }, { data: akhSettings }] = await Promise.all([
    getEventDetail(supabase, slug),
    supabase.from('content_blocks').select('content').eq('id', AKH_ORGANIZER_SETTINGS_ID).maybeSingle(),
  ]);

  if (!rawEvent) {
    notFound();
  }

  // Map to stricter type if needed, or pass rawEvent if compatible
  // We need to reshape slightly because Supabase returns array/object structure that matches query
  const event = {
      ...rawEvent,
      city: rawEvent.cities, // Map cities -> city
      organizer: rawEvent.event_organizers,
  };

  return <EventLayoutV1 event={event} akhOrganizerColorHex={resolveAkhOrganizerColor(akhSettings?.content)} />;
}
