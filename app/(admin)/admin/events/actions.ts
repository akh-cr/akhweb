"use server"

import { requireAdmin } from "@/lib/auth/guards"
import { revalidatePath } from "next/cache"
import {
  AKH_ORGANIZER_SETTINGS_ID,
  DEFAULT_EXTERNAL_ORGANIZER_COLOR_HEX,
  isOrganizerColorHex,
  type OrganizerColorHex,
} from "@/lib/event-organizer-colors"

export interface Event {
  id: string
  title: string
  slug: string
  description: string
  content: string | null
  start_time: string
  city_id: string | null
  organizer_id?: string | null
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
export type CreateEventOrganizerResult =
  | { success: true; organizer: { id: string; name: string; color_hex: string } }
  | { success: false; error: string }

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
  revalidatePath('/akce/[slug]', 'page')
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
    revalidatePath('/akce/[slug]', 'page')
    revalidatePath('/')
}

export async function createEventOrganizer(
  name: string,
  colorHex: OrganizerColorHex = DEFAULT_EXTERNAL_ORGANIZER_COLOR_HEX,
): Promise<CreateEventOrganizerResult> {
  try {
    const { supabase } = await requireAdmin()

    const trimmedName = name.trim()
    if (!trimmedName) {
      return { success: false, error: 'Název pořadatele je povinný' }
    }

    if (!isOrganizerColorHex(colorHex)) {
      return { success: false, error: 'Neplatná barva pořadatele' }
    }

    const { data, error } = await supabase
      .from('event_organizers')
      .insert({ name: trimmedName, color_hex: colorHex })
      .select('id, name, color_hex')
      .single()

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'Pořadatel s tímto názvem už existuje' }
      }
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/events')
    revalidatePath('/admin/events/create')
    revalidatePath('/admin/events/[id]', 'page')
    return { success: true, organizer: data }
  } catch (error) {
    console.error('createEventOrganizer failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Nepodařilo se vytvořit pořadatele.',
    }
  }
}

export async function deleteEventOrganizer(id: string) {
  const { supabase } = await requireAdmin()

  const { data: organizer, error: organizerError } = await supabase
    .from('event_organizers')
    .select('id, name')
    .eq('id', id)
    .single()

  if (organizerError || !organizer) {
    throw new Error('Pořadatel nebyl nalezen')
  }

  const { count, error: countError } = await supabase
    .from('events')
    .select('id', { count: 'exact', head: true })
    .eq('organizer_id', id)

  if (countError) {
    throw new Error(countError.message)
  }

  if ((count ?? 0) > 0) {
    throw new Error('Pořadatele nelze smazat, protože má přiřazené akce')
  }

  const { error } = await supabase
    .from('event_organizers')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/events')
  revalidatePath('/admin/events/create')
  revalidatePath('/admin/events/[id]', 'page')
}

export async function updateEventOrganizerColor(id: string, colorHex: OrganizerColorHex) {
  const { supabase } = await requireAdmin()

  if (!isOrganizerColorHex(colorHex)) {
    throw new Error('Neplatná barva pořadatele')
  }

  const { error } = await supabase
    .from('event_organizers')
    .update({ color_hex: colorHex })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/events')
  revalidatePath('/admin/events/create')
  revalidatePath('/admin/events/[id]', 'page')
  revalidatePath('/akce')
  revalidatePath('/')
}

export async function updateAkhOrganizerColor(colorHex: OrganizerColorHex) {
  const { supabase } = await requireAdmin()

  if (!isOrganizerColorHex(colorHex)) {
    throw new Error('Neplatná barva pořadatele')
  }

  const { error } = await supabase
    .from('content_blocks')
    .upsert(
      {
        id: AKH_ORGANIZER_SETTINGS_ID,
        type: 'text',
        content: { colorHex },
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/events')
  revalidatePath('/admin/events/create')
  revalidatePath('/admin/events/[id]', 'page')
  revalidatePath('/akce')
  revalidatePath('/akce/[slug]', 'page')
  revalidatePath('/blog')
  revalidatePath('/')
}
