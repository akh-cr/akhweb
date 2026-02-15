import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-upload-secret',
}

const BUCKET = 'akhweb'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify shared secret
    const uploadSecret = Deno.env.get('UPLOAD_SECRET')
    const requestSecret = req.headers.get('x-upload-secret')

    if (!uploadSecret || !requestSecret || requestSecret !== uploadSecret) {
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

    // 4. Upload via service_role
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
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
