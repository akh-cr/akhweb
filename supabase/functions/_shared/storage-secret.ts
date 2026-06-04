// Shared boilerplate for the storage-instance image functions (`upload-image`,
// `delete-image`). Both verify the `x-upload-secret` header against the
// `UPLOAD_SECRET` env var (the shared secret set by the main-instance proxies)
// and return the same `{ error }` / status-400 error shape.
//
// The environment is injected so the secret check can be unit-tested in Deno
// without touching the network; the functions pass `Deno.env.get`.

/** CORS headers shared by both storage-instance functions (includes the secret header). */
export const storageCorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-upload-secret',
}

/**
 * Verifies the request carries the correct shared upload secret. Returns true
 * when the configured secret is present and the request header matches it.
 */
export function hasValidUploadSecret(
  req: Request,
  getEnv: (key: string) => string | undefined
): boolean {
  const uploadSecret = getEnv('UPLOAD_SECRET')
  const requestSecret = req.headers.get('x-upload-secret')
  return !!uploadSecret && !!requestSecret && requestSecret === uploadSecret
}

/**
 * The 400 / `{ error }` response shape shared by both storage functions.
 * `fallbackMessage` is used when a non-Error value is thrown (preserving each
 * function's existing fallback text).
 */
export function storageErrorResponse(error: unknown, fallbackMessage = 'Request failed'): Response {
  const message = error instanceof Error ? error.message : fallbackMessage
  return new Response(JSON.stringify({ error: message }), {
    headers: { ...storageCorsHeaders, 'Content-Type': 'application/json' },
    status: 400,
  })
}
