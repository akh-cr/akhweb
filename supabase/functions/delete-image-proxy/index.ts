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

    const { urls } = await req.json()
    if (!Array.isArray(urls) || urls.length === 0) {
      throw new Error('No image URLs provided')
    }

    const baseUrl = getStorageFunctionsBaseUrl((key) => Deno.env.get(key))
    const response = await fetch(`${baseUrl}/functions/v1/delete-image`, {
      method: 'POST',
      headers: {
        'x-upload-secret': verified.uploadSecret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ urls }),
    })

    const responseText = await response.text()

    if (!response.ok) {
      throw new Error(responseText || 'Delete failed')
    }

    return new Response(responseText, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Delete failed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
