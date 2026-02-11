import { expect, test, vi, describe } from 'vitest'
import { GET } from './route'
import { NextResponse } from 'next/server'

// Mock createClient
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null })
    }
  })
}))

describe('Auth Callback Route', () => {
  test('redirects to /admin by default if no next param', async () => {
    const request = new Request('http://localhost:3000/auth/callback?code=123')
    const response = await GET(request)
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/admin')
  })

  test('redirects to specified next param', async () => {
    const request = new Request('http://localhost:3000/auth/callback?code=123&next=/auth/update-password')
    const response = await GET(request)
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/auth/update-password')
  })

  test('redirects to login on error', async () => {
     // Mock error scenario if needed, but the main logic is the redirect path
     // Re-mock implementation to return error
     const { createClient } = await import('@/lib/supabase/server')
     vi.mocked(createClient).mockResolvedValueOnce({
        auth: {
            exchangeCodeForSession: vi.fn().mockResolvedValue({ error: { message: 'Auth failed' } })
        }
     } as any)

     const request = new Request('http://localhost:3000/auth/callback?code=bad_code')
     const response = await GET(request)
     expect(response.status).toBe(307)
     expect(response.headers.get('location')).toContain('/login?error=auth-code-error')
  })
})
