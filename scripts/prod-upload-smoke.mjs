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

async function waitUntilDeleted(url) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const response = await fetch(url, { cache: 'no-store' })
    if (response.status === 404) return
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  throw new Error('Deleted image remained publicly readable after 5 seconds')
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
  let uploadedUrl = null

  try {
    const uploadFormData = new FormData()
    uploadFormData.append('file', new File([tinyPng], 'prod-smoke.png', { type: 'image/png' }))
    uploadFormData.append('prefix', 'images')
    uploadFormData.append('folder', 'smoke-tests')
    uploadFormData.append('projectId', 'akhweb')

    console.log('Calling canonical image upload API')
    const uploadResponse = await fetch('https://image-api.festapp.net/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: uploadFormData,
    })

    const uploadResult = await parseJsonResponse(uploadResponse)
    if (!uploadResponse.ok || !uploadResult?.url) {
      throw new Error(
        `Upload failed: ${JSON.stringify(uploadResult) || `${uploadResponse.status} ${uploadResponse.statusText}`}`
      )
    }

    const parsedUrl = new URL(uploadResult.url)
    if (parsedUrl.protocol === 'https:' && parsedUrl.hostname === 'akh.img.festapp.net') {
      uploadedUrl = uploadResult.url
    }
    if (!uploadedUrl || uploadResult.projectId !== 'akhweb' ||
        !parsedUrl.pathname.startsWith('/images/smoke-tests/')) {
      throw new Error(`Upload returned a non-canonical URL: ${uploadResult.url}`)
    }

    const publicResponse = await fetch(uploadedUrl, { cache: 'no-store' })
    const publicBytes = Buffer.from(await publicResponse.arrayBuffer())
    if (!publicResponse.ok || !publicBytes.equals(tinyPng)) {
      throw new Error(`Public read did not return the uploaded bytes: HTTP ${publicResponse.status}`)
    }

    console.log('Canonical upload and byte-identical public read passed')
  } finally {
    try {
      if (uploadedUrl) {
        console.log('Calling canonical image delete API')
        const deleteResponse = await fetch('https://image-api.festapp.net/delete', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ projectId: 'akhweb', links: [uploadedUrl] }),
        })
        const deleteResult = await parseJsonResponse(deleteResponse)
        if (!deleteResponse.ok || deleteResult?.complete !== true) {
          throw new Error(
            `Delete failed: ${JSON.stringify(deleteResult) || `${deleteResponse.status} ${deleteResponse.statusText}`}`
          )
        }
        await waitUntilDeleted(uploadedUrl)
      }
    } finally {
      await supabase.auth.signOut()
    }
  }

  console.log('Production upload/read/delete smoke test passed')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
