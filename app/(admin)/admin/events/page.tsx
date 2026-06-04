import { createClient } from "@/lib/supabase/server";
import { EventsTable } from "./events-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAdminEvents } from "@/lib/events/read";
import type { Event } from "./columns";

export default async function EventsPage() {
  const supabase = await createClient();
  // AKH events only (organizer_id IS NULL); external invitations live under /admin/pozvanky.
  // The AKH-vs-external split + hidden handling live in the events read module.
  const { data: events } = await getAdminEvents(supabase, { audience: 'akh' });

  return (
    <div className="p-1 sm:p-4 md:p-8 mx-auto w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Správa akcí AKH</h1>
        <Link href="/admin/events/create">
            <Button>Přidat akci</Button>
        </Link>
      </div>
      <div className="rounded-md bg-card overflow-hidden">
        <EventsTable data={(events ?? []) as Event[]} basePath="/admin/events" showOrganizer={false} />
      </div>
    </div>
  );
}
