'use server'

import { requireAdmin } from '@/lib/auth/guards'
import { SUPABASE_URL } from '@/lib/supabase/config'

export type UploadImageActionResult =
    | { success: true; publicUrl: string }
    | { success: false; error: string }

export async function uploadImageAction(formData: FormData): Promise<UploadImageActionResult> {
    try {
        const { supabase } = await requireAdmin()

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

        const prefix = formData.get('prefix') as string
        const folder = formData.get('folder') as string
        if (prefix) edgeFormData.append('prefix', prefix)
        if (folder) edgeFormData.append('folder', folder)

        const response = await fetch(`${SUPABASE_URL}/functions/v1/upload-image-proxy`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${session.access_token}`,
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
