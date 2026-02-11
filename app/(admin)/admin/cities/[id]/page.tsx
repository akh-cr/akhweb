import { createClient } from "@/lib/supabase/server"
import { CityForm } from "../city-form"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

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
      <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Upravit město: {city.name}</h1>
          {city.slug && (
            <Link href={`/spolecenstvi/${city.slug}`} target="_blank">
                <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Zobrazit na webu
                </Button>
            </Link>
          )}
      </div>
      <CityForm initialData={city} />
    </div>
  )
}
