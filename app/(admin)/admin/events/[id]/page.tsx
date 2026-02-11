import { createClient } from "@/lib/supabase/server"
import { EventForm } from "../event-form"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

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
      .select('*')
      .eq('id', id)
      .single()

    const { data: cities } = await supabase.from('cities').select('id, name').order('name')
  
    if (!event) {
      notFound()
    }
  
    return (
      <div className="max-w-2xl mx-auto py-10">
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
        <EventForm initialData={event} cities={cities || []} />
      </div>
    )
  }
