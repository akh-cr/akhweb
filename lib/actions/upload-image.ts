'use server'

import { requireAdmin } from '@/lib/auth/guards'

const EDGE_FUNCTION_URL = `${process.env.STORAGE_SUPABASE_URL}/functions/v1/upload-image`
const UPLOAD_SECRET = process.env.UPLOAD_SECRET

export type UploadImageActionResult =
    | { success: true; publicUrl: string }
    | { success: false; error: string }

export async function uploadImageAction(formData: FormData): Promise<UploadImageActionResult> {
    try {
        await requireAdmin()

        const file = formData.get('file') as File | null
        if (!file) {
            return { success: false, error: 'No file provided' }
        }

        if (!process.env.STORAGE_SUPABASE_URL) {
            return { success: false, error: 'Chybí STORAGE_SUPABASE_URL v produkční konfiguraci.' }
        }

        if (!UPLOAD_SECRET) {
            return { success: false, error: 'Chybí UPLOAD_SECRET v produkční konfiguraci.' }
        }

        const edgeFormData = new FormData()
        edgeFormData.append('file', file)

        const prefix = formData.get('prefix') as string
        const folder = formData.get('folder') as string
        if (prefix) edgeFormData.append('prefix', prefix)
        if (folder) edgeFormData.append('folder', folder)

        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'x-upload-secret': UPLOAD_SECRET,
            },
            body: edgeFormData,
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Upload failed' }))
            console.error('Edge Function upload error:', error)
            return { success: false, error: error.error || 'Upload failed' }
        }

        const result = await response.json()
        if (!result?.publicUrl) {
            return { success: false, error: 'Upload succeeded but no public URL was returned.' }
        }

        return { success: true, publicUrl: result.publicUrl }
    } catch (error) {
        console.error('uploadImageAction failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Nahrávání selhalo kvůli neznámé chybě.',
        }
    }
}
