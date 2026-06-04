// Deno tests for the shared "verify the caller is an event manager and the
// secret is present" step. These use dependency injection (a fake admin client
// and a fake env getter) so they never touch the network.
//
// Run with: deno test supabase/functions/_shared/verify-event-manager.test.ts

import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts'
import { verifyEventManager } from './verify-event-manager.ts'

const VALID_SECRET = 'super-secret'

/** Build a fake Supabase admin client whose getUser/role behaviour is scripted. */
function fakeAdminClient(opts: {
  user?: { id: string } | null
  userError?: boolean
  role?: string | null
  roleError?: boolean
}) {
  return {
    auth: {
      // deno-lint-ignore no-unused-vars
      getUser(_token: string) {
        return Promise.resolve({
          data: { user: opts.userError ? null : opts.user ?? { id: 'user-1' } },
          error: opts.userError ? { message: 'invalid token' } : null,
        })
      },
    },
    from(_table: string) {
      return {
        select() {
          return this
        },
        eq() {
          return this
        },
        single() {
          return Promise.resolve({
            data: opts.roleError ? null : { role: opts.role ?? null },
            error: opts.roleError ? { message: 'no row' } : null,
          })
        },
      }
    },
  }
}

/** Default deps: a valid env and a scripted admin client. */
function makeDeps(opts: {
  uploadSecret?: string | undefined
  client: ReturnType<typeof fakeAdminClient>
}) {
  const env: Record<string, string | undefined> = {
    UPLOAD_SECRET: 'uploadSecret' in opts ? opts.uploadSecret : VALID_SECRET,
    SUPABASE_URL: 'https://main.example.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
  }
  return {
    getEnv: (key: string) => env[key],
    // deno-lint-ignore no-unused-vars
    createAdminClient: (_url: string, _key: string) => opts.client,
  }
}

function reqWith(headers: Record<string, string>) {
  return new Request('https://proxy.example.co', { method: 'POST', headers })
}

Deno.test('rejects a request with no bearer token', async () => {
  const deps = makeDeps({ client: fakeAdminClient({ role: 'admin' }) })
  const result = await verifyEventManager(reqWith({}), deps)
  assertEquals(result.ok, false)
  if (!result.ok) {
    assertEquals(result.status, 401)
    assertEquals(result.error, 'Unauthorized: Missing access token')
  }
})

Deno.test('rejects when UPLOAD_SECRET is missing from the environment', async () => {
  const deps = makeDeps({
    uploadSecret: undefined,
    client: fakeAdminClient({ role: 'admin' }),
  })
  const result = await verifyEventManager(reqWith({ authorization: 'Bearer tok' }), deps)
  assertEquals(result.ok, false)
  if (!result.ok) {
    assertEquals(result.status, 500)
    assertEquals(result.error, 'Server misconfigured: Missing UPLOAD_SECRET')
  }
})

Deno.test('rejects an invalid / expired access token', async () => {
  const deps = makeDeps({ client: fakeAdminClient({ userError: true }) })
  const result = await verifyEventManager(reqWith({ authorization: 'Bearer bad' }), deps)
  assertEquals(result.ok, false)
  if (!result.ok) {
    assertEquals(result.status, 401)
    assertEquals(result.error, 'Unauthorized: Invalid access token')
  }
})

Deno.test('rejects an authenticated user who is not an event manager', async () => {
  const deps = makeDeps({ client: fakeAdminClient({ user: { id: 'u' }, role: 'user' }) })
  const result = await verifyEventManager(reqWith({ authorization: 'Bearer tok' }), deps)
  assertEquals(result.ok, false)
  if (!result.ok) {
    assertEquals(result.status, 403)
    assertEquals(result.error, 'Forbidden: Insufficient permissions')
  }
})

Deno.test('rejects when the role row cannot be read', async () => {
  const deps = makeDeps({ client: fakeAdminClient({ user: { id: 'u' }, roleError: true }) })
  const result = await verifyEventManager(reqWith({ authorization: 'Bearer tok' }), deps)
  assertEquals(result.ok, false)
  if (!result.ok) {
    assertEquals(result.status, 403)
  }
})

Deno.test('passes a valid event manager with the secret present and returns it', async () => {
  const deps = makeDeps({ client: fakeAdminClient({ user: { id: 'u' }, role: 'organizer' }) })
  const result = await verifyEventManager(reqWith({ authorization: 'Bearer good' }), deps)
  assertEquals(result.ok, true)
  if (result.ok) {
    assertEquals(result.uploadSecret, VALID_SECRET)
  }
})

Deno.test('accepts editor and admin roles as event managers', async () => {
  for (const role of ['admin', 'editor', 'organizer']) {
    const deps = makeDeps({ client: fakeAdminClient({ user: { id: 'u' }, role }) })
    const result = await verifyEventManager(reqWith({ authorization: 'Bearer good' }), deps)
    assertEquals(result.ok, true, `role ${role} should be an event manager`)
  }
})

Deno.test('tolerates a bare token without the Bearer prefix', async () => {
  const deps = makeDeps({ client: fakeAdminClient({ user: { id: 'u' }, role: 'admin' }) })
  const result = await verifyEventManager(reqWith({ authorization: 'rawtoken' }), deps)
  assertEquals(result.ok, true)
})
