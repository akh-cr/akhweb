import { SupabaseClient } from "@supabase/supabase-js"

/**
 * Deletes a single image from Supabase Storage given its public URL.
 * Silently ignores errors if file doesn't exist or URL is invalid.
 * Requires a SupabaseClient instance (usually with admin/service role or auth context).
 */
export async function deleteImage(supabase: SupabaseClient, url: string | null | undefined) {
    if (!url) return

    try {
        // Extract bucket and path from URL
        // Expected format: .../storage/v1/object/public/[bucket]/[path]
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

        const { error } = await supabase.storage
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
