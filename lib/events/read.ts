import type { SupabaseClient } from "@supabase/supabase-js"
import type { Event } from "./types"

export type { Event } from "./types"

/**
 * The one canonical select for reading events. EVERY event read flows through
 * this string so the organizer (name + brand colour) and city joins can never
 * silently drift between surfaces — a dropped join here previously rendered
 * organizer colours blank. `cities(name, image_url)` is a superset: list
 * surfaces use only `name`, the detail hero also uses `image_url`.
 */
export const EVENTS_SELECT =
  "*, cities(name, image_url), event_organizers(name, color_hex)" as const

/**
 * Loosely-typed Supabase client. The schema generics differ per call site
 * (some pass a typed `Database` client, others the untyped server client), so
 * the read module accepts any client and owns the result typing via `Event`.
 */
type Client = SupabaseClient<any, any, any>

/** AKH events have no organizer (`organizer_id IS NULL`); everything else is an external invitation. */
export type EventAudience = "akh" | "external"

/** Whether a public list shows upcoming (future) or past events. */
export type EventTimeScope = "upcoming" | "past"

export interface PublicEventsOptions {
  /**
   * Which events to list. `akh` (default) = AKH events (organizer_id IS NULL),
   * shown on `/akce`; `external` = external invitations (organizer_id IS NOT
   * NULL), shown on `/pozvanky`. Both audiences exclude hidden events.
   */
  audience?: EventAudience
  /** Time window relative to `now`. Defaults to `upcoming`. */
  scope?: EventTimeScope
  /** ISO timestamp used as the upcoming/past boundary. Defaults to `new Date().toISOString()`. */
  now?: string
  /** Pagination window passed to PostgREST `.range(from, to)`. Omit for no pagination. */
  range?: { from: number; to: number }
}

export interface PublicEventsResult {
  data: Event[]
  count: number | null
}

/**
 * Reads public events, excluding hidden ones. The `audience` picks the
 * AKH-vs-external split (this filter lives here, never inline in a page):
 *  - `akh` (default) → AKH events (organizer_id IS NULL), shown on `/akce`.
 *  - `external` → external invitations (organizer_id IS NOT NULL), shown on
 *    `/pozvanky`.
 *
 * Within an audience the time window is chosen by `scope`:
 *  - `scope: 'upcoming'` → start_time >= now, ordered ascending.
 *  - `scope: 'past'` → start_time < now, ordered descending, with an exact count
 *    (so callers can paginate); pass `range` for the page window.
 */
export async function getPublicEvents(
  supabase: Client,
  options: PublicEventsOptions = {},
): Promise<PublicEventsResult> {
  const {
    audience = "akh",
    scope = "upcoming",
    now = new Date().toISOString(),
    range,
  } = options

  // Only the past list needs a total count (for pagination); the upcoming list
  // matches /akce's original query which did not request a count.
  const query =
    scope === "past"
      ? supabase.from("events").select(EVENTS_SELECT, { count: "exact" })
      : supabase.from("events").select(EVENTS_SELECT)

  query.eq("is_hidden", false)

  // AKH-vs-external split. AKH events have a NULL organizer; everything else is
  // an external invitation.
  if (audience === "external") {
    query.not("organizer_id", "is", null)
  } else {
    query.is("organizer_id", null)
  }

  if (scope === "past") {
    query.lt("start_time", now).order("start_time", { ascending: false })
  } else {
    query.gte("start_time", now).order("start_time", { ascending: true })
  }

  if (range) {
    query.range(range.from, range.to)
  }

  const { data, count } = await query.returns<Event[]>()
  return { data: data ?? [], count: count ?? null }
}

export interface EventDetailResult {
  data: Event | null
}

/**
 * Reads a single event by slug through the canonical select. Returns
 * `{ data: null }` when no row matches. Used by the event detail surface.
 */
export async function getEventDetail(
  supabase: Client,
  slug: string,
): Promise<EventDetailResult> {
  const { data } = await supabase
    .from("events")
    .select(EVENTS_SELECT)
    .eq("slug", slug)
    .single()

  return { data: (data as Event | null) ?? null }
}

export interface AdminEventsOptions {
  /**
   * Which events to list. `akh` (default) = AKH events (organizer_id IS NULL);
   * `external` = external invitations (organizer_id IS NOT NULL).
   */
  audience?: EventAudience
  /**
   * Restrict to a single organizer (organizer-scoped admins). Implies the
   * external audience. Issue 07 wires this to the acting user's organization.
   */
  organizerId?: string | null
}

export interface AdminEventsResult {
  data: Event[]
}

/**
 * Reads events for admin surfaces. Unlike the public reads this INCLUDES hidden
 * events (admins manage visibility) and is ordered newest-first. Defaults to
 * the AKH audience; pass `audience: 'external'` for the invitations admin, or
 * `organizerId` to scope to a single organizer.
 */
export async function getAdminEvents(
  supabase: Client,
  options: AdminEventsOptions = {},
): Promise<AdminEventsResult> {
  const { audience = "akh", organizerId } = options

  const query = supabase.from("events").select(EVENTS_SELECT)

  if (organizerId != null) {
    query.eq("organizer_id", organizerId)
  } else if (audience === "external") {
    query.not("organizer_id", "is", null)
  } else {
    query.is("organizer_id", null)
  }

  query.order("start_time", { ascending: false })

  const { data } = await query.returns<Event[]>()
  return { data: data ?? [] }
}
