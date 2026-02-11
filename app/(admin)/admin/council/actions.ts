'use server'

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createCouncilMember(data: any) {
  const supabase = await createClient()

  // Verify permission
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: currentRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()
  
  if (currentRole?.role !== 'admin') {
    throw new Error("Only admins can create members")
  }

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
    const supabase = await createClient()
  
    // Verify permission
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
  
    const { data: currentRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    if (currentRole?.role !== 'admin') {
      throw new Error("Only admins can update members")
    }
  
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
    const supabase = await createClient()
  
    // Verify permission
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")
  
    const { data: currentRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    if (currentRole?.role !== 'admin') {
      throw new Error("Only admins can delete members")
    }

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
