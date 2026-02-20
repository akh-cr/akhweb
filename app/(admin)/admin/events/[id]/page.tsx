import { createClient } from "@/lib/supabase/server"
import { EventForm } from "../event-form"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Link from "next/link"
import { AKH_ORGANIZER_SETTINGS_ID, resolveAkhOrganizerColor } from "@/lib/event-organizer-colors"

interface EditEventPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditEventPage({ params }: EditEventPageProps) {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: event } = await supabase
      .from('events')
      .select('*, event_organizers(name, color_hex)')
      .eq('id', id)
      .single()

    const [{ data: cities }, { data: organizers }, { data: akhSettings }] = await Promise.all([
      supabase.from('cities').select('id, name').order('name'),
      supabase.from('event_organizers').select('id, name, color_hex').order('name'),
      supabase.from('content_blocks').select('content').eq('id', AKH_ORGANIZER_SETTINGS_ID).maybeSingle(),
    ])
    const akhOrganizerColor = resolveAkhOrganizerColor(akhSettings?.content)
  
    if (!event) {
      notFound()
    }
  
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 w-full">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Upravit akci: {event.title}</h1>
            {event.slug && (
              <Link href={`/akce/${event.slug}`} target="_blank">
                  <Button variant="outline" size="sm" className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Zobrazit na webu
                  </Button>
              </Link>
            )}
        </div>
        <EventForm
          initialData={event}
          cities={cities || []}
          organizers={organizers || []}
          akhOrganizerColor={akhOrganizerColor}
        />
      </div>
    )
  }
