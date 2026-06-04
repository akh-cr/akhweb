'use server'

import { requireAdminRole } from "@/lib/auth/guards"
import {
  guardedMutation,
  deleteWithImageCleanup,
  revalidate,
  type RevalidateSet,
} from "@/lib/admin/mutations"

/** Surfaces a council change can affect. */
const COUNCIL_SURFACES: RevalidateSet = ['/admin/council']

export async function createCouncilMember(data: any) {
  return guardedMutation(requireAdminRole, async ({ supabase }) => {
    const { error } = await supabase
      .from('council_members')
      .insert(data)

    if (error) {
      throw new Error(error.message)
    }

    revalidate(COUNCIL_SURFACES)
    return { success: true }
  })
}

export async function updateCouncilMember(id: string, data: any) {
  return guardedMutation(requireAdminRole, async ({ supabase }) => {
    const { error } = await supabase
      .from('council_members')
      .update(data)
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    revalidate(COUNCIL_SURFACES)
    return { success: true }
  })
}

export async function deleteCouncilMember(id: string) {
  return guardedMutation(requireAdminRole, async ({ supabase }) => {
    const { error } = await deleteWithImageCleanup(supabase, {
      table: 'council_members',
      id,
      imageColumns: 'image_url',
    })

    if (error) {
      throw new Error(error.message)
    }

    revalidate(COUNCIL_SURFACES)
    return { success: true }
  })
}
