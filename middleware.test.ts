import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { middleware } from './middleware'

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(),
}))

describe('middleware content security policy', () => {
  beforeEach(() => {
    vi.mocked(createServerClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as never)
  })

  it('allows canonical AKH images embedded in rich-text descriptions', async () => {
    const response = await middleware(new NextRequest('https://akhcr.cz/akce/ples2026'))
    const csp = response.headers.get('Content-Security-Policy')

    expect(csp).toMatch(/img-src[^;]*https:\/\/akh\.img\.festapp\.net/)
  })
})
