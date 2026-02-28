import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BUCKET = 'akhweb'
const MAIN_SUPABASE_URL = Deno.env.get('AKH_SUPABASE_URL') ?? 'https://iinvsjtnbyxfrdygsfpo.supabase.co'
const MAIN_SUPABASE_ANON_KEY = Deno.env.get('AKH_SUPABASE_ANON_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpbnZzanRuYnl4ZnJkeWdzZnBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NjMzNTMsImV4cCI6MjA4MTUzOTM1M30.50Z2JSlMBJxVKEA38p_Ogn-WOxoVNvjFI-VUtBhDtMs'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify caller via main AKH Supabase JWT + role check
    const authorization = req.headers.get('authorization')
    const accessToken = authorization?.replace(/^Bearer\s+/i, '').trim()

    if (!accessToken) {
      throw new Error('Unauthorized: Missing access token')
    }

    const mainSupabase = createClient(MAIN_SUPABASE_URL, MAIN_SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    })

    const {
      data: { user },
      error: userError,
    } = await mainSupabase.auth.getUser(accessToken)

    if (userError || !user) {
      throw new Error('Unauthorized: Invalid access token')
    }

    const { data: roleRow, error: roleError } = await mainSupabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || !roleRow || !['admin', 'editor'].includes(roleRow.role)) {
      throw new Error('Forbidden: Insufficient permissions')
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
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
