// Shared "verify the caller is an event manager and the upload secret is
// present" step for the main-instance image proxies (`upload-image-proxy`,
// `delete-image-proxy`). Both proxies share this exact gate, then differ only
// in what they forward to the storage instance (multipart file vs JSON urls).
//
// The Supabase admin client and the environment are injected so this can be
// unit-tested in Deno without touching the network. The proxies pass the real
// `createClient` and `Deno.env.get`.

import { isEventManager } from './roles.ts'

/** CORS headers shared by both main-instance proxies. */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Base URL of the storage instance that hosts the `upload-image` /
 * `delete-image` functions. Read from configuration (`STORAGE_FUNCTIONS_URL`,
 * falling back to `STORAGE_URL`) so it is no longer hardcoded in each proxy.
 * The previous hardcoded value is kept as a last-resort default to preserve
 * current behaviour if the env var is not yet set in the deployment.
 */
const STORAGE_FUNCTIONS_BASE_URL_FALLBACK = 'https://lwfpdjxsdmkfyrzqbrlk.supabase.co'

export function getStorageFunctionsBaseUrl(getEnv: (key: string) => string | undefined): string {
  return (
    getEnv('STORAGE_FUNCTIONS_URL') ??
    getEnv('STORAGE_URL') ??
    STORAGE_FUNCTIONS_BASE_URL_FALLBACK
  )
}

/** Minimal shape of the Supabase admin client this helper depends on. */
export interface AdminClientLike {
  auth: {
    getUser(token: string): Promise<{
      data: { user: { id: string } | null }
      error: { message: string } | null
    }>
  }
  from(table: string): {
    select(columns: string): {
      eq(column: string, value: string): {
        single(): Promise<{ data: { role?: string | null } | null; error: { message: string } | null }>
      }
    }
  }
}

export interface VerifyDeps {
  /** Environment accessor, e.g. `Deno.env.get`. */
  getEnv: (key: string) => string | undefined
  /**
   * Factory for the Supabase admin client, e.g. `createClient`. Typed loosely
   * so the real (richly-typed) `SupabaseClient` and a test double both satisfy
   * it; the helper only consumes the {@link AdminClientLike} surface.
   */
  createAdminClient: (url: string, key: string) => AdminClientLike | unknown
}

export type VerifyResult =
  | { ok: true; uploadSecret: string; userId: string }
  | { ok: false; status: number; error: string }

/**
 * Verifies that the request carries a bearer token for an authenticated event
 * manager and that the `UPLOAD_SECRET` is configured. On success returns the
 * secret (so the proxy can forward it to the storage instance) and the user id.
 * On failure returns the rejection status and message — the proxy maps these
 * onto the existing 400/`{ error }` response contract.
 */
export async function verifyEventManager(req: Request, deps: VerifyDeps): Promise<VerifyResult> {
  const authorization = req.headers.get('authorization')
  const accessToken = authorization?.replace(/^Bearer\s+/i, '').trim()
  const uploadSecret = deps.getEnv('UPLOAD_SECRET')

  if (!accessToken) {
    return { ok: false, status: 401, error: 'Unauthorized: Missing access token' }
  }

  if (!uploadSecret) {
    return { ok: false, status: 500, error: 'Server misconfigured: Missing UPLOAD_SECRET' }
  }

  const mainSupabaseAdmin = deps.createAdminClient(
    deps.getEnv('SUPABASE_URL') ?? '',
    deps.getEnv('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  ) as AdminClientLike

  const {
    data: { user },
    error: userError,
  } = await mainSupabaseAdmin.auth.getUser(accessToken)

  if (userError || !user) {
    return { ok: false, status: 401, error: 'Unauthorized: Invalid access token' }
  }

  const { data: roleRow, error: roleError } = await mainSupabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleError || !isEventManager(roleRow?.role)) {
    return { ok: false, status: 403, error: 'Forbidden: Insufficient permissions' }
  }

  return { ok: true, uploadSecret, userId: user.id }
}
