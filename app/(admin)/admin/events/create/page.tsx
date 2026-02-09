import { createClient } from "@/lib/supabase/server"
import { EventForm } from "../event-form"

export default async function CreateEventPage() {
  const supabase = await createClient()
  const { data: cities } = await supabase.from('cities').select('id, name').order('name')

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Vytvořit novou akci</h1>
      <EventForm cities={cities || []} />
    </div>
  )
}
