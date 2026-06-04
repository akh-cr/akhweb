import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import {
  hasValidUploadSecret,
  storageCorsHeaders as corsHeaders,
  storageErrorResponse,
} from '../_shared/storage-secret.ts'

function getStoragePath(url: string) {
  const urlObj = new URL(url)
  const pathParts = urlObj.pathname.split('/storage/v1/object/public/')

  if (pathParts.length !== 2) {
    throw new Error(`Invalid Supabase storage URL format: ${url}`)
  }

  const fullPath = pathParts[1]
  const [bucket, ...rest] = fullPath.split('/')
  const filePath = rest.join('/')

  if (!bucket || !filePath) {
    throw new Error(`Could not extract bucket or path from URL: ${url}`)
  }

  return { bucket, filePath }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!hasValidUploadSecret(req, (key) => Deno.env.get(key))) {
      throw new Error('Unauthorized: Invalid upload secret')
    }

    const { urls } = await req.json()
    if (!Array.isArray(urls) || urls.length === 0) {
      throw new Error('No image URLs provided')
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const deletionsByBucket = new Map<string, string[]>()

    for (const url of urls) {
      if (typeof url !== 'string' || !url) continue
      const { bucket, filePath } = getStoragePath(url)
      const existing = deletionsByBucket.get(bucket) ?? []
      existing.push(filePath)
      deletionsByBucket.set(bucket, existing)
    }

    for (const [bucket, paths] of deletionsByBucket.entries()) {
      const { error } = await supabaseAdmin.storage.from(bucket).remove(paths)
      if (error) {
        throw error
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return storageErrorResponse(error, 'Delete failed')
  }
})
