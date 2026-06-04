'use server'

import { requireAdminRole } from "@/lib/auth/guards"
import { guardedMutation, revalidate, type RevalidateSet } from "@/lib/admin/mutations"

/** Surfaces a user-role change can affect. */
const USER_SURFACES: RevalidateSet = ['/admin/users']

export async function updateUserRole(userId: string, role: string) {
  return guardedMutation(requireAdminRole, async ({ supabase }) => {
    // Upsert role
    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role })

    if (error) {
      throw new Error(error.message)
    }

    revalidate(USER_SURFACES)
    return { success: true }
  })
}
