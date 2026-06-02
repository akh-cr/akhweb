import { requireEventAccess } from "@/lib/auth/guards";
import { EventsTable } from "../events/events-table";
import type { Event } from "../events/columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function InvitationsAdminPage() {
  const { supabase, role, organizerId } = await requireEventAccess();

  // External invitations only (organizer_id IS NOT NULL).
  let query = supabase
    .from('events')
    .select('*, event_organizers(name, color_hex)')
    .not('organizer_id', 'is', null)
    .order('start_time', { ascending: false });

  // Organizers see only their own organization's invitations.
  if (role === 'organizer' && organizerId) {
    query = query.eq('organizer_id', organizerId);
  }

  const { data: events } = await query;

  return (
    <div className="p-1 sm:p-4 md:p-8 mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Pozvánky od jiných</h1>
        <Link href="/admin/pozvanky/create">
            <Button>Přidat pozvánku</Button>
        </Link>
      </div>
      <div className="rounded-md bg-card overflow-hidden">
        <EventsTable data={(events ?? []) as Event[]} basePath="/admin/pozvanky" showOrganizer={true} />
      </div>
    </div>
  );
}
