import type { Event as EventRow } from "@/types/supabase"

/**
 * The canonical event shape returned by the events read module
 * (`lib/events/read.ts`). It is the single source of truth for the
 * organizer + city joins so they can never silently drift between surfaces.
 *
 * Every read goes through `EVENTS_SELECT`, so callers can always rely on:
 *  - `event_organizers` — the organizer's display name + brand colour
 *    (`null` for AKH events, i.e. `organizer_id IS NULL`); used to render the
 *    organizer badge/colour. A dropped join used to render this blank.
 *  - `cities` — the city name and (when present) its image, used for the
 *    location label and the detail hero. The `image_url` is part of the
 *    canonical join so the detail surface (issue 07) does not need a wider one.
 */
export interface Event extends EventRow {
  cities: {
    name: string
    image_url?: string | null
  } | null
  // Required: every event read now flows through `EVENTS_SELECT`, which always
  // joins the organizer (issue 07 migrated the last surfaces off inline selects).
  // It is `null` for AKH events (organizer_id IS NULL); consumers still guard
  // with `?.` for that null.
  event_organizers: {
    name: string
    color_hex: string | null
  } | null
}
