import { createClient } from "@/lib/supabase/server";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CitiesPage() {
  const supabase = await createClient();
  const { data: cities } = await supabase.from('cities').select('*').order('name', { ascending: true });

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Správa Měst</h1>
        <Link href="/admin/cities/create">
            <Button>Přidat město</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={cities || []} />
    </div>
  );
}
