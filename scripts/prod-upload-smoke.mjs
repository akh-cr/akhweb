import { createClient } from '@supabase/supabase-js'

const DEFAULT_SUPABASE_URL =
  process.env.PROD_SMOKE_SUPABASE_URL ?? 'https://iinvsjtnbyxfrdygsfpo.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY =
  process.env.PROD_SMOKE_SUPABASE_ANON_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpbnZzanRuYnl4ZnJkeWdzZnBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NjMzNTMsImV4cCI6MjA4MTUzOTM1M30.50Z2JSlMBJxVKEA38p_Ogn-WOxoVNvjFI-VUtBhDtMs'

const email = process.env.PROD_SMOKE_ADMIN_EMAIL
const password = process.env.PROD_SMOKE_ADMIN_PASSWORD

if (!email || !password) {
  console.error(
    'Missing PROD_SMOKE_ADMIN_EMAIL or PROD_SMOKE_ADMIN_PASSWORD. Refusing to run against production.'
  )
  process.exit(1)
}

const supabase = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY)

const tinyPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wn7L9sAAAAASUVORK5CYII=',
  'base64'
)

async function parseJsonResponse(response) {
  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

async function main() {
  console.log(`Signing in to ${DEFAULT_SUPABASE_URL} as ${email}`)

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError || !signInData.session?.access_token) {
    throw new Error(`Sign-in failed: ${signInError?.message ?? 'missing session'}`)
  }

  const token = signInData.session.access_token
  const uploadFormData = new FormData()
  uploadFormData.append('file', new File([tinyPng], 'prod-smoke.png', { type: 'image/png' }))
  uploadFormData.append('prefix', 'images')
  uploadFormData.append('folder', 'smoke-tests')

  console.log('Calling upload-image-proxy')
  const uploadResponse = await fetch(`${DEFAULT_SUPABASE_URL}/functions/v1/upload-image-proxy`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: uploadFormData,
  })

  const uploadResult = await parseJsonResponse(uploadResponse)
  if (!uploadResponse.ok || !uploadResult?.publicUrl) {
    throw new Error(
      `Upload failed: ${JSON.stringify(uploadResult) || `${uploadResponse.status} ${uploadResponse.statusText}`}`
    )
  }

  console.log(`Uploaded: ${uploadResult.publicUrl}`)
  console.log('Calling delete-image-proxy')

  const deleteResponse = await fetch(`${DEFAULT_SUPABASE_URL}/functions/v1/delete-image-proxy`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ urls: [uploadResult.publicUrl] }),
  })

  const deleteResult = await parseJsonResponse(deleteResponse)
  if (!deleteResponse.ok) {
    throw new Error(
      `Delete failed: ${JSON.stringify(deleteResult) || `${deleteResponse.status} ${deleteResponse.statusText}`}`
    )
  }

  await supabase.auth.signOut()
  console.log('Production upload smoke test passed')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
