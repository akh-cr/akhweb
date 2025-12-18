import { createClient } from "@/lib/supabase/server"
import { EventForm } from "../event-form"
import { notFound } from "next/navigation"

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
  
    if (!event) {
      notFound()
    }
  
    return (
      <div className="max-w-2xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-8">Upravit akci: {event.title}</h1>
        <EventForm initialData={event} />
      </div>
    )
  }
