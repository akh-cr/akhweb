import { requireEventAccess } from "@/lib/auth/guards"
import { EventForm } from "../../events/event-form"
import { AKH_ORGANIZER_SETTINGS_ID, DEFAULT_AKH_ORGANIZER_COLOR_HEX, resolveAkhOrganizerColor } from "@/lib/event-organizer-colors"

export default async function CreateInvitationPage() {
  const { supabase, role, organizerId } = await requireEventAccess()
  const [{ data: cities }, { data: organizers }, { data: akhSettings }] = await Promise.all([
    supabase.from('cities').select('id, name').order('name'),
    supabase.from('event_organizers').select('id, name, color_hex').order('name'),
    supabase.from('content_blocks').select('content').eq('id', AKH_ORGANIZER_SETTINGS_ID).maybeSingle(),
  ])
  const akhOrganizerColor = resolveAkhOrganizerColor(akhSettings?.content) || DEFAULT_AKH_ORGANIZER_COLOR_HEX

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Nová pozvánka od jiných</h1>
      <EventForm
        cities={cities || []}
        organizers={organizers || []}
        akhOrganizerColor={akhOrganizerColor}
        scope="external"
        lockOrganizer={role === 'organizer'}
        lockedOrganizerId={organizerId}
      />
    </div>
  )
}
