"use server"

import { requireAdmin } from "@/lib/auth/guards"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function deleteEvent(id: string) {
  console.log("Deleting event:", id)
  
  const { user, supabase } = await requireAdmin()
  console.log("Current user:", user.id)

  const { error, count } = await supabase
    .from('events')
    .delete({ count: 'exact' })
    .eq('id', id)
  
  console.log("Delete result - Error:", error, "Count:", count)

  if (error) {
    console.error("Delete error:", error)
    throw new Error(error.message)
  }

  if (count === 0) {
      console.error("Delete failed: No rows deleted.")
      throw new Error(`Nepodařilo se smazat záznam. User: ${user?.id || 'NONE'}, RLS blocked it.`)
  }

  revalidatePath('/admin/events')
}
