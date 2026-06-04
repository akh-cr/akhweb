import { requireEventAccess } from "@/lib/auth/guards";
import { EventsTable } from "../events/events-table";
import type { Event } from "../events/columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAdminEvents } from "@/lib/events/read";

export default async function InvitationsAdminPage() {
  const { supabase, role, organizerId } = await requireEventAccess();

  // External invitations only (organizer_id IS NOT NULL). Organizers see only
  // their own organization's invitations — the read-scoping lives in the module:
  // a non-null organizerId pins the read to that organization.
  const { data: events } = await getAdminEvents(supabase, {
    audience: 'external',
    organizerId: role === 'organizer' ? organizerId : null,
  });

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
