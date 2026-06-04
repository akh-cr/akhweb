import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  hasValidUploadSecret,
  storageCorsHeaders as corsHeaders,
  storageErrorResponse,
} from '../_shared/storage-secret.ts'

const BUCKET = 'akhweb'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify shared secret from the main AKH proxy function
    if (!hasValidUploadSecret(req, (key) => Deno.env.get(key))) {
      throw new Error('Unauthorized: Invalid upload secret')
    }

    // 2. Parse FormData
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) {
      throw new Error('No file provided')
    }

    const prefix = (formData.get('prefix') as string) || 'images'
    const folder = (formData.get('folder') as string) || 'uploads'

    // 3. Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${crypto.randomUUID()}.${fileExt}`
    const cleanFolder = folder.endsWith('/') ? folder.slice(0, -1) : folder
    const filePath = `${prefix}/${cleanFolder}/${fileName}`

    // 4. Upload via storage project service_role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(filePath, file, {
        contentType: file.type,
      })

    if (uploadError) {
      throw uploadError
    }

    // 5. Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(filePath)

    return new Response(
      JSON.stringify({ success: true, publicUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return storageErrorResponse(error, 'Upload failed')
  }
})
