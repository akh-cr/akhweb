import { SupabaseClient } from "@supabase/supabase-js"
import { createStorageServerClient } from "@/lib/supabase/storage-server-client"
import { STORAGE_SUPABASE_URL } from "@/lib/supabase/storage-config"

/**
 * Deletes a single image from Supabase Storage given its public URL.
 * Automatically detects whether the URL belongs to the storage instance
 * (commercial) or the main instance and uses the appropriate client.
 */
export async function deleteImage(supabase: SupabaseClient, url: string | null | undefined) {
    if (!url) return

    try {
        const urlObj = new URL(url)
        const pathParts = urlObj.pathname.split('/storage/v1/object/public/')

        if (pathParts.length !== 2) {
            console.warn("Invalid Supabase storage URL format:", url)
            return
        }

        const fullPath = pathParts[1]
        const [bucket, ...rest] = fullPath.split('/')
        const filePath = rest.join('/')

        if (!bucket || !filePath) {
             console.warn("Could not extract bucket or path from URL:", url)
             return
        }

        // Use storage client if URL points to the storage instance
        const isStorageInstance = url.startsWith(STORAGE_SUPABASE_URL)
        const client = isStorageInstance ? createStorageServerClient() : supabase

        const { error } = await client.storage
            .from(bucket)
            .remove([filePath])

        if (error) {
            console.error(`Failed to delete image ${url}:`, error)
        }
    } catch (error) {
        console.error(`Error processing delete for ${url}:`, error)
    }
}

/**
 * Deletes multiple images from Supabase Storage.
 */
export async function deleteImages(supabase: SupabaseClient, urls: (string | null | undefined)[]) {
    const validUrls = urls.filter((url): url is string => !!url)
    if (validUrls.length === 0) return

    await Promise.all(validUrls.map(url => deleteImage(supabase, url)))
}
