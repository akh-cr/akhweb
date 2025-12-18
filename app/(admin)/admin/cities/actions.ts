"use server"

import { requireAdmin } from "@/lib/auth/guards"
import { revalidatePath } from "next/cache"

export async function deleteCity(id: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from("cities").delete().eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/cities")
}
