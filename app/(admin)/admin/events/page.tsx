import { createClient } from "@/lib/supabase/server";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AKH_ORGANIZER_SETTINGS_ID, resolveAkhOrganizerColor } from "@/lib/event-organizer-colors";

export default async function EventsPage() {
  const supabase = await createClient();
  const [{ data: events }, { data: akhSettings }] = await Promise.all([
    supabase
      .from('events')
      .select('*, event_organizers(name, color_hex)')
      .order('start_time', { ascending: false }),
    supabase.from('content_blocks').select('content').eq('id', AKH_ORGANIZER_SETTINGS_ID).maybeSingle(),
  ]);

  const akhOrganizerColorHex = resolveAkhOrganizerColor(akhSettings?.content);
  const eventsWithAkhColor = (events || []).map((event) => ({
    ...event,
    akh_organizer_color_hex: akhOrganizerColorHex,
  }));

  return (
    <div className="p-1 sm:p-4 md:p-8 mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Správa Akcí</h1>
        <Link href="/admin/events/create">
            <Button>Přidat akci</Button>
        </Link>
      </div>
      <div className="rounded-md bg-card overflow-hidden">
        <DataTable columns={columns} data={eventsWithAkhColor} />
      </div>
    </div>
  );
}
