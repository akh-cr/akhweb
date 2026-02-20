import { createClient } from "@/lib/supabase/server"
import { EventForm } from "../event-form"
import { AKH_ORGANIZER_SETTINGS_ID, DEFAULT_AKH_ORGANIZER_COLOR_HEX, resolveAkhOrganizerColor } from "@/lib/event-organizer-colors"

export default async function CreateEventPage() {
  const supabase = await createClient()
  const [{ data: cities }, { data: organizers }, { data: akhSettings }] = await Promise.all([
    supabase.from('cities').select('id, name').order('name'),
    supabase.from('event_organizers').select('id, name, color_hex').order('name'),
    supabase.from('content_blocks').select('content').eq('id', AKH_ORGANIZER_SETTINGS_ID).maybeSingle(),
  ])
  const akhOrganizerColor = resolveAkhOrganizerColor(akhSettings?.content) || DEFAULT_AKH_ORGANIZER_COLOR_HEX

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Vytvořit novou akci</h1>
      <EventForm cities={cities || []} organizers={organizers || []} akhOrganizerColor={akhOrganizerColor} />
    </div>
  )
}
