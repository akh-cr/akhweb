// Deno tests for the shared storage-instance secret check + error shape used by
// `upload-image` and `delete-image`. The environment is injected so no network
// is touched.
//
// Run with: deno test supabase/functions/_shared/storage-secret.test.ts

import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts'
import { hasValidUploadSecret, storageErrorResponse } from './storage-secret.ts'

const SECRET = 'shared-secret'

function reqWith(headers: Record<string, string>) {
  return new Request('https://storage.example.co', { method: 'POST', headers })
}

function envWith(uploadSecret: string | undefined) {
  return (key: string) => (key === 'UPLOAD_SECRET' ? uploadSecret : undefined)
}

Deno.test('accepts a request whose x-upload-secret matches UPLOAD_SECRET', () => {
  const ok = hasValidUploadSecret(reqWith({ 'x-upload-secret': SECRET }), envWith(SECRET))
  assertEquals(ok, true)
})

Deno.test('rejects a request with a mismatched secret', () => {
  const ok = hasValidUploadSecret(reqWith({ 'x-upload-secret': 'wrong' }), envWith(SECRET))
  assertEquals(ok, false)
})

Deno.test('rejects a request with no x-upload-secret header', () => {
  const ok = hasValidUploadSecret(reqWith({}), envWith(SECRET))
  assertEquals(ok, false)
})

Deno.test('rejects when UPLOAD_SECRET is not configured', () => {
  const ok = hasValidUploadSecret(reqWith({ 'x-upload-secret': SECRET }), envWith(undefined))
  assertEquals(ok, false)
})

Deno.test('storageErrorResponse returns 400 with the Error message', async () => {
  const res = storageErrorResponse(new Error('boom'))
  assertEquals(res.status, 400)
  assertEquals(res.headers.get('Content-Type'), 'application/json')
  assertEquals(await res.json(), { error: 'boom' })
})

Deno.test('storageErrorResponse uses the fallback message for non-Error throws', async () => {
  const res = storageErrorResponse('not an error', 'Delete failed')
  assertEquals(await res.json(), { error: 'Delete failed' })
})
