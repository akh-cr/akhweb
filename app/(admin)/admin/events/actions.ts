"use server"

import { requireAdmin, requireEventAccess } from "@/lib/auth/guards"
import { scopeOrganizerId } from "@/lib/events/scope"
import {
  guardedMutation,
  deleteWithImageCleanup,
  revalidate,
  type RevalidateSet,
} from "@/lib/admin/mutations"
import {
  AKH_ORGANIZER_SETTINGS_ID,
  DEFAULT_EXTERNAL_ORGANIZER_COLOR_HEX,
  isOrganizerColorHex,
  type OrganizerColorHex,
} from "@/lib/event-organizer-colors"
import { assertNoTransientImageSource } from "@/lib/rich-text-images"

/** Every surface an event change can affect (AKH + external, public + admin). */
const EVENT_SURFACES: RevalidateSet = [
  '/admin/events',
  '/admin/pozvanky',
  '/akce',
  '/pozvanky',
  ['/akce/[slug]', 'page'],
  '/',
]

/** Surfaces an event-organizer (pořadatel) change can affect in the admin area. */
const ORGANIZER_ADMIN_SURFACES: RevalidateSet = [
  '/admin/events',
  '/admin/events/create',
  ['/admin/events/[id]', 'page'],
]

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
  return guardedMutation(requireEventAccess, async ({ supabase, role, organizerId }) => {
    assertNoTransientImageSource(data.content)

    // Ensure we have a slug
    if (!data.slug) {
        const { slugify } = await import("@/lib/utils")
        data.slug = slugify(data.title)
    }

    // Pin organizers to their own organization; admins/editors keep their choice.
    const payload = { ...data, organizer_id: scopeOrganizerId(role, organizerId, data.organizer_id) }

    const { error } = await supabase
      .from('events')
      .insert(payload)

    if (error) {
      throw new Error(error.message)
    }

    revalidate(EVENT_SURFACES)
  })
}

export async function updateEvent(id: string, data: EventUpdate) {
  return guardedMutation(requireEventAccess, async ({ supabase, role, organizerId }) => {
    assertNoTransientImageSource(data.content)

    const payload = { ...data }
    // Route through the single scoping seam so update applies the SAME pin as create.
    // Only touch organizer_id when the rule actually constrains it (organizer pin) or
    // the caller sent the field — partial admin/editor updates must stay untouched.
    if (role === 'organizer' || 'organizer_id' in data) {
      payload.organizer_id = scopeOrganizerId(role, organizerId, data.organizer_id)
    }

    const { error } = await supabase
      .from('events')
      .update(payload)
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }

    revalidate(EVENT_SURFACES)
  })
}

export async function deleteEvent(id: string) {
  console.log("Deleting event:", id)

  return guardedMutation(requireEventAccess, async ({ user, supabase }) => {
    console.log("Current user:", user.id)

    // Image cleanup (single image_url + gallery_images) then delete, via the seam.
    const { error, count } = await deleteWithImageCleanup(supabase, {
      table: 'events',
      id,
      imageColumns: 'image_url, gallery_images',
      count: 'exact',
    })

    console.log("Delete result - Error:", error, "Count:", count)

    if (error) {
      console.error("Delete error:", error)
      throw new Error(error.message)
    }

    if (count === 0) {
        console.error("Delete failed: No rows deleted.")
        throw new Error(`Nepodařilo se smazat záznam. User: ${user?.id || 'NONE'}, RLS blocked it.`)
    }

    revalidate(EVENT_SURFACES)
  })
}

export async function toggleEventVisibility(id: string, isHidden: boolean) {
    return guardedMutation(requireEventAccess, async ({ supabase }) => {
        const { error } = await supabase
            .from('events')
            .update({ is_hidden: isHidden })
            .eq('id', id)

        if (error) {
            throw new Error(error.message)
        }

        revalidate(EVENT_SURFACES)
    })
}

export async function createEventOrganizer(
  name: string,
  colorHex: OrganizerColorHex = DEFAULT_EXTERNAL_ORGANIZER_COLOR_HEX,
): Promise<CreateEventOrganizerResult> {
  try {
    return await guardedMutation(requireAdmin, async ({ supabase }) => {
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

      revalidate(ORGANIZER_ADMIN_SURFACES)
      return { success: true, organizer: data }
    })
  } catch (error) {
    console.error('createEventOrganizer failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Nepodařilo se vytvořit pořadatele.',
    }
  }
}

export async function deleteEventOrganizer(id: string) {
  return guardedMutation(requireAdmin, async ({ supabase }) => {
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

    revalidate(ORGANIZER_ADMIN_SURFACES)
  })
}

export async function updateEventOrganizerColor(id: string, colorHex: OrganizerColorHex) {
  return guardedMutation(requireAdmin, async ({ supabase }) => {
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

    revalidate([...ORGANIZER_ADMIN_SURFACES, '/akce', '/'])
  })
}

export async function updateAkhOrganizerColor(colorHex: OrganizerColorHex) {
  return guardedMutation(requireAdmin, async ({ supabase }) => {
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

    revalidate([
      ...ORGANIZER_ADMIN_SURFACES,
      '/akce',
      ['/akce/[slug]', 'page'],
      '/blog',
      '/',
    ])
  })
}
