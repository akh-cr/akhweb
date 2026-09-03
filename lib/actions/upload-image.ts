'use server'

import { requireEventAccess } from '@/lib/auth/guards'

const IMAGE_API_URL = 'https://image-api.festapp.net'

export type UploadImageActionResult =
    | { success: true; publicUrl: string }
    | { success: false; error: string }

export async function uploadImageAction(formData: FormData): Promise<UploadImageActionResult> {
    try {
        // Anyone who can manage events (admin, editor, organizer) may upload images.
        const { supabase } = await requireEventAccess()

        const file = formData.get('file') as File | null
        if (!file) {
            return { success: false, error: 'No file provided' }
        }

        const {
            data: { session },
        } = await supabase.auth.getSession()

        if (!session?.access_token) {
            return { success: false, error: 'Chybí přihlašovací relace pro autorizaci uploadu.' }
        }

        const edgeFormData = new FormData()
        edgeFormData.append('file', file)
        edgeFormData.append('projectId', 'akhweb')

        const prefix = formData.get('prefix') as string
        const folder = formData.get('folder') as string
        if (prefix) edgeFormData.append('prefix', prefix)
        if (folder) edgeFormData.append('folder', folder)

        const response = await fetch(`${IMAGE_API_URL}/upload`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
            body: edgeFormData,
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Upload failed' }))
            console.error('Image API upload error:', error)
            return { success: false, error: error.error || 'Upload failed' }
        }

        const result = await response.json()
        if (!result?.url) {
            return { success: false, error: 'Upload succeeded but no public URL was returned.' }
        }

        return { success: true, publicUrl: result.url }
    } catch (error) {
        console.error('uploadImageAction failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Nahrávání selhalo kvůli neznámé chybě.',
        }
    }
}
