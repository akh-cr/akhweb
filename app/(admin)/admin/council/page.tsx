import { createClient } from "@/lib/supabase/server"
import { DataTable } from "../users/data-table" // Reusing DataTable from users for now, or should import from UI? 
// Actually, let's verify if generic DataTable is available. Looking at admin/users/page.tsx it imports from "./data-table".
// I should probably check if there is a shared one or copy it.
// admin/users/data-table.tsx seems to be a generic implementation.
// I will import it from there for now to avoid duplication, or better yet, move it to components/ui/data-table.tsx if I were refactoring.
// For now, I will import from relative path.

import { columns } from "./columns"
import { CouncilMemberDialog } from "./council-member-dialog"
import { DataTable as UsersDataTable } from "../users/data-table" 

export default async function CouncilPage() {
  const supabase = await createClient()

  const { data: members, error } = await supabase
    .from('council_members')
    .select('*')
    .order('priority', { ascending: true })

  if (error) {
      console.error("Error fetching council members:", error)
      return (
          <div className="p-8 text-center">
              <h1 className="text-2xl font-bold text-destructive mb-4">Chyba při načítání rady</h1>
              <p className="text-muted-foreground">{error.message}</p>
          </div>
      )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Rada AKH</h1>
        <CouncilMemberDialog />
      </div>

      <div className="bg-card rounded-xl border p-2">
         <UsersDataTable columns={columns} data={members || []} filterColumnName="name" searchPlaceholder="Hledat podle jména..." />
      </div>
    </div>
  )
}
