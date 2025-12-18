import { createClient } from "@/lib/supabase/server";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase.from('events').select('*').order('start_time', { ascending: false });

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Správa Akcí</h1>
        <Link href="/admin/events/create">
            <Button>Přidat akci</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={events || []} />
    </div>
  );
}
