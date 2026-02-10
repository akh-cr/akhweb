"use server"

import { requireAdmin } from "@/lib/auth/guards"
import { revalidatePath } from "next/cache"

export async function deleteCity(id: string) {
  const { supabase } = await requireAdmin()
  const { error } = await supabase.from("cities").delete().eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/cities")
}

export async function searchCityCoordinates(cityName: string) {
    if (!cityName) return []

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`, 
            {
                headers: {
                    'User-Agent': 'AKH-Web-Admin/1.0 (admin@akh.cz)' // Nominatim requires a User-Agent
                }
            }
        )
        
        if (!response.ok) {
            throw new Error(`Nominatim API error: ${response.statusText}`)
        }

        const data = await response.json()
        return data.map((item: any) => ({
            lat: item.lat,
            lon: item.lon,
            display_name: item.display_name
        }))
    } catch (error) {
        console.error("Error searching coordinates:", error)
        throw new Error("Failed to search coordinates")
    }
}
