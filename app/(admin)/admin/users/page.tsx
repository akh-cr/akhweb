import { createClient } from "@/lib/supabase/server"
import { DataTable } from "./data-table"
import { columns } from "./columns"

export default async function UsersPage() {
  const supabase = await createClient()

  // We call the secure RPC function. 
  // RLS logic inside the function will block non-admins, but let's handle error gracefully if needed.
  const { data: users, error } = await supabase.rpc('get_users_with_roles')

  if (error) {
      console.error("Error fetching users:", error)
      return (
          <div className="p-8 text-center">
              <h1 className="text-2xl font-bold text-destructive mb-4">Chyba při načítání uživatelů</h1>
              <p className="text-muted-foreground">{error.message}</p>
          </div>
      )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Uživatelé</h1>
        {/* Add user button is just instructions since auth is self-serve */}
      </div>

      <div className="bg-card rounded-xl border p-2">
         <DataTable columns={columns} data={users || []} />
      </div>
      
      <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <div className="space-y-2">
              <p><strong>Role:</strong></p>
              <ul className="list-disc list-inside ml-2">
                  <li><strong>Admin:</strong> Má plná práva. Může spravovat uživatele, měnit jejich role a upravovat veškerý obsah webu.</li>
                  <li><strong>Editor:</strong> Může upravovat pouze obsah (akce, aktuality, stránky), ale nemůže spravovat ostatní uživatele.</li>
              </ul>
              <p className="mt-2">Noví uživatelé se musí nejprve zaregistrovat/přihlásit přes přihlašovací stránku. Poté se objeví v tomto seznamu jako "user" a můžete jim změnit roli.</p>
          </div>
      </div>
    </div>
  )
}
