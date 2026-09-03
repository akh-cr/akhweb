import { SupabaseClient } from "@supabase/supabase-js"

const IMAGE_API_URL = 'https://image-api.festapp.net'

/**
 * Deletes a single image via the main AKH proxy function.
 */
export async function deleteImage(supabase: SupabaseClient, url: string | null | undefined) {
    if (!url) return

    await deleteImages(supabase, [url])
}

/**
 * Deletes multiple images via the main AKH proxy function.
 */
export async function deleteImages(supabase: SupabaseClient, urls: (string | null | undefined)[]) {
    const validUrls = urls.filter((url): url is string => !!url)
    if (validUrls.length === 0) return

    try {
        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session?.access_token) {
            console.error('Missing session when deleting images')
            return
        }

        const response = await fetch(`${IMAGE_API_URL}/delete`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ projectId: 'akhweb', links: validUrls }),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Delete failed' }))
            console.error('Image API delete error:', error)
        }
    } catch (error) {
        console.error('Error deleting images:', error)
    }
}
