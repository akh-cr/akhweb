import { EventForm } from "../event-form"

export default function CreateEventPage() {
  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Vytvořit novou akci</h1>
      <EventForm />
    </div>
  )
}
