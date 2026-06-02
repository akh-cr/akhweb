import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { isEventManager } from '../_shared/roles.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const STORAGE_FUNCTIONS_BASE_URL = 'https://lwfpdjxsdmkfyrzqbrlk.supabase.co'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authorization = req.headers.get('authorization')
    const accessToken = authorization?.replace(/^Bearer\s+/i, '').trim()
    const uploadSecret = Deno.env.get('UPLOAD_SECRET')

    if (!accessToken) {
      throw new Error('Unauthorized: Missing access token')
    }

    if (!uploadSecret) {
      throw new Error('Server misconfigured: Missing UPLOAD_SECRET')
    }

    const mainSupabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const {
      data: { user },
      error: userError,
    } = await mainSupabaseAdmin.auth.getUser(accessToken)

    if (userError || !user) {
      throw new Error('Unauthorized: Invalid access token')
    }

    const { data: roleRow, error: roleError } = await mainSupabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || !isEventManager(roleRow?.role)) {
      throw new Error('Forbidden: Insufficient permissions')
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      throw new Error('No file provided')
    }

    const storageFormData = new FormData()
    storageFormData.append('file', file)

    const prefix = formData.get('prefix') as string | null
    const folder = formData.get('folder') as string | null
    if (prefix) storageFormData.append('prefix', prefix)
    if (folder) storageFormData.append('folder', folder)

    const response = await fetch(`${STORAGE_FUNCTIONS_BASE_URL}/functions/v1/upload-image`, {
      method: 'POST',
      headers: {
        'x-upload-secret': uploadSecret,
      },
      body: storageFormData,
    })

    const responseText = await response.text()

    if (!response.ok) {
      throw new Error(responseText || 'Upload failed')
    }

    return new Response(responseText, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Upload failed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
