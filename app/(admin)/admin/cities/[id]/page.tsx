import { createClient } from "@/lib/supabase/server"
import { CityForm } from "../city-form"
import { notFound } from "next/navigation"

interface EditCityPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditCityPage({ params }: EditCityPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: city } = await supabase
    .from('cities')
    .select('*')
    .eq('id', id)
    .single()

  if (!city) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Upravit město: {city.name}</h1>
      <CityForm initialData={city} />
    </div>
  )
}
