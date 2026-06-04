'use server'

import { requireAdminRole } from "@/lib/auth/guards"
import { revalidatePath } from "next/cache"

export async function updateUserRole(userId: string, role: string) {
  const { supabase } = await requireAdminRole()

  // Upsert role
  const { error } = await supabase
    .from('user_roles')
    .upsert({ user_id: userId, role })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/users')
  return { success: true }
}
