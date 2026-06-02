import { createClient } from "@/lib/supabase/server"
import { DataTable } from "./data-table"
import { getUserColumns } from "./columns"
import { InviteUserDialog } from "./invite-user-dialog"

export default async function UsersPage() {
  const supabase = await createClient()

  // We call the secure RPC function.
  // RLS logic inside the function will block non-admins, but let's handle error gracefully if needed.
  const [{ data: users, error }, { data: organizers }] = await Promise.all([
    supabase.rpc('get_users_with_roles'),
    supabase.from('event_organizers').select('id, name').order('name'),
  ])
  const organizerList = organizers || []

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
    <div className="p-1 sm:p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Uživatelé</h1>
        <InviteUserDialog organizers={organizerList} />
      </div>

      <div className="bg-card rounded-xl p-2 overflow-hidden">
         <DataTable columns={getUserColumns(organizerList)} data={users || []} searchPlaceholder="Hledat podle emailu..." />
      </div>

      <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <div className="space-y-2">
              <p><strong>Role:</strong></p>
              <ul className="list-disc list-inside ml-2">
                  <li><strong>Admin:</strong> Má plná práva. Může spravovat uživatele, měnit jejich role a upravovat veškerý obsah webu.</li>
                  <li><strong>Editor:</strong> Může upravovat pouze obsah (akce, aktuality, stránky), ale nemůže spravovat ostatní uživatele.</li>
                  <li><strong>Organizace:</strong> Vidí a spravuje pouze pozvánky (akce) své organizace. Nemá přístup k ostatnímu obsahu.</li>
                  <li><strong>User:</strong> Nemá přístup do administrace.</li>
              </ul>
              <p className="mt-2">Pozvaní uživatelé obdrží email s odkazem pro nastavení hesla.</p>
          </div>
      </div>
    </div>
  )
}
