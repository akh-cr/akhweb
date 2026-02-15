'use server'

import { requireAdmin } from '@/lib/auth/guards'

const EDGE_FUNCTION_URL = `${process.env.STORAGE_SUPABASE_URL}/functions/v1/upload-image`
const UPLOAD_SECRET = process.env.UPLOAD_SECRET

export async function uploadImageAction(formData: FormData): Promise<{ publicUrl: string }> {
    // 1. Verify admin/editor on main instance
    await requireAdmin()

    // 2. Forward file to Edge Function
    const file = formData.get('file') as File
    if (!file) throw new Error('No file provided')

    const edgeFormData = new FormData()
    edgeFormData.append('file', file)

    const prefix = formData.get('prefix') as string
    const folder = formData.get('folder') as string
    if (prefix) edgeFormData.append('prefix', prefix)
    if (folder) edgeFormData.append('folder', folder)

    const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
            'x-upload-secret': UPLOAD_SECRET ?? '',
        },
        body: edgeFormData,
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Upload failed' }))
        console.error('Edge Function upload error:', error)
        throw new Error(error.error || 'Upload failed')
    }

    const result = await response.json()
    return { publicUrl: result.publicUrl }
}
