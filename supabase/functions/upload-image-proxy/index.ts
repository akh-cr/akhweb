import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  corsHeaders,
  getStorageFunctionsBaseUrl,
  verifyEventManager,
} from '../_shared/verify-event-manager.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const verified = await verifyEventManager(req, {
      getEnv: (key) => Deno.env.get(key),
      createAdminClient: (url, key) => createClient(url, key),
    })

    if (!verified.ok) {
      throw new Error(verified.error)
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

    const baseUrl = getStorageFunctionsBaseUrl((key) => Deno.env.get(key))
    const response = await fetch(`${baseUrl}/functions/v1/upload-image`, {
      method: 'POST',
      headers: {
        'x-upload-secret': verified.uploadSecret,
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
