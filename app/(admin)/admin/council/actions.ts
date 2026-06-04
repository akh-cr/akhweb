'use server'

import { requireAdminRole } from "@/lib/auth/guards"
import { revalidatePath } from "next/cache"

export async function createCouncilMember(data: any) {
  const { supabase } = await requireAdminRole()

  const { error } = await supabase
    .from('council_members')
    .insert(data)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/council')
  return { success: true }
}

export async function updateCouncilMember(id: string, data: any) {
  const { supabase } = await requireAdminRole()

  const { error } = await supabase
    .from('council_members')
    .update(data)
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/council')
  return { success: true }
}

export async function deleteCouncilMember(id: string) {
  const { supabase } = await requireAdminRole()

  // 1. Fetch image
  const { data: member } = await supabase
      .from('council_members')
      .select('image_url')
      .eq('id', id)
      .single()

  // 2. Delete image
  if (member?.image_url) {
      const { deleteImage } = await import("@/lib/storage-server")
      await deleteImage(supabase, member.image_url)
  }

  const { error } = await supabase
    .from('council_members')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/council')
  return { success: true }
}
