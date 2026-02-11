import { createClient } from "@/lib/supabase/server";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function CitiesPage() {
  const supabase = await createClient();
  const { data: cities } = await supabase.from('cities').select('*').order('name', { ascending: true });

  return (
    <div className="p-1 sm:p-4 md:p-8 mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Správa Měst</h1>
        <Link href="/admin/cities/create">
            <Button>Přidat město</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={cities || []} />
    </div>
  );
}
