"use server"

import { requireAdmin } from "@/lib/auth/guards"
import {
  guardedMutation,
  deleteWithImageCleanup,
  revalidate,
  type RevalidateSet,
} from "@/lib/admin/mutations"

/** Surfaces a city change can affect (admin list + public community pages). */
const CITY_SURFACES: RevalidateSet = [
  "/admin/cities",
  "/spolecenstvi",
  "/spolecenstvi/[slug]",
]

export async function deleteCity(id: string) {
  return guardedMutation(requireAdmin, async ({ supabase }) => {
    const { error } = await deleteWithImageCleanup(supabase, {
      table: "cities",
      id,
      imageColumns: "image_url, gallery_images",
    })

    if (error) {
      throw new Error(error.message)
    }

    revalidate(["/admin/cities"])
  })
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

export async function toggleCityVisibility(id: string, isHidden: boolean) {
    return guardedMutation(requireAdmin, async ({ supabase }) => {
        const { error } = await supabase
            .from('cities')
            .update({ is_hidden: isHidden })
            .eq('id', id)

        if (error) {
            throw new Error(error.message)
        }

        revalidate(CITY_SURFACES)
    })
}
