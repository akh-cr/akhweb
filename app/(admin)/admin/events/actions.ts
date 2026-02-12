"use server"

import { requireAdmin } from "@/lib/auth/guards"
import { revalidatePath } from "next/cache"

export interface Event {
  id: string
  title: string
  slug: string
  description: string
  content: string | null
  start_time: string
  city_id: string | null
  location: string
  image_url: string | null
  gallery_images: string[]
  registration_link: string | null
  facebook_event_link: string | null
  news_publish_date: string | null
  is_hidden: boolean
}

export type EventCreate = Omit<Event, 'id'>
export type EventUpdate = Partial<EventCreate>

export async function createEvent(data: EventCreate) {
  const { supabase } = await requireAdmin()
  
  // Ensure we have a slug
  if (!data.slug) {
      const { slugify } = await import("@/lib/utils")
      data.slug = slugify(data.title)
  }

  const { error } = await supabase
    .from('events')
    .insert(data)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/events')
  revalidatePath('/akce')
  revalidatePath('/')
}

export async function updateEvent(id: string, data: EventUpdate) {
  const { supabase } = await requireAdmin()
  
  const { error } = await supabase
    .from('events')
    .update(data)
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/events')
  revalidatePath('/akce')
  revalidatePath('/')
  revalidatePath(`/akce/[slug]`) 
}

export async function deleteEvent(id: string) {
  console.log("Deleting event:", id)
  
  const { user, supabase } = await requireAdmin()
  console.log("Current user:", user.id)

  // 1. Fetch images to delete
  const { data: event } = await supabase
      .from('events')
      .select('image_url, gallery_images')
      .eq('id', id)
      .single()

  // 2. Delete images from storage (fire and forget / await - we want to clean up)
  if (event) {
      const imagesToDelete = [event.image_url]
      if (event.gallery_images && Array.isArray(event.gallery_images)) {
          imagesToDelete.push(...event.gallery_images)
      }
      
      const { deleteImages } = await import("@/lib/storage-server")
      await deleteImages(supabase, imagesToDelete)
  }

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

export async function toggleEventVisibility(id: string, isHidden: boolean) {
    const { supabase } = await requireAdmin()
    
    const { error } = await supabase
        .from('events')
        .update({ is_hidden: isHidden })
        .eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/admin/events')
    revalidatePath('/akce')
    revalidatePath('/akce/[slug]')
    revalidatePath('/')
}
