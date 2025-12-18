'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateUserRole(userId: string, role: string) {
  const supabase = await createClient()

  // Verify permission (double check)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check if current user is admin
  const { data: currentRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()
  
  if (currentRole?.role !== 'admin') {
    throw new Error("Only admins can update roles")
  }

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
