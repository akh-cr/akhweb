import { describe, it, expect, vi, beforeEach } from 'vitest'

// This suite proves every event write path delegates the organizer_id decision to
// the single seam (`scopeOrganizerId`) rather than re-deriving the organizer pin
// inline. We mock the seam with a sentinel so a caller that ignores it (e.g. an
// inline `role === 'organizer'` branch) fails the test.

const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockUpdateEq = vi.fn()
const mockFrom = vi.fn()
const mockSupabase = { from: mockFrom }

let mockAccess: {
  user: { id: string }
  supabase: typeof mockSupabase
  role: 'admin' | 'editor' | 'organizer'
  organizerId: string | null
}

const mockScopeOrganizerId = vi.fn()

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/guards', () => ({
  requireAdmin: vi.fn(() => Promise.resolve({ user: { id: 'u' }, supabase: mockSupabase })),
  requireEventAccess: vi.fn(() => Promise.resolve(mockAccess)),
}))
vi.mock('@/lib/events/scope', () => ({
  scopeOrganizerId: (...args: unknown[]) => mockScopeOrganizerId(...args),
}))

import { createEvent, updateEvent } from '../actions'

function buildEvent(overrides: Record<string, unknown> = {}) {
  return {
    title: 'T',
    slug: 't',
    description: 'a description',
    content: null,
    start_time: '2030-01-01T10:00',
    city_id: null,
    organizer_id: null,
    location: 'loc',
    image_url: null,
    gallery_images: [],
    registration_link: null,
    facebook_event_link: null,
    news_publish_date: null,
    is_hidden: false,
    ...overrides,
  } as Parameters<typeof createEvent>[0]
}

describe('event write scoping — delegates to scopeOrganizerId', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInsert.mockResolvedValue({ error: null })
    mockUpdateEq.mockResolvedValue({ error: null })
    mockUpdate.mockReturnValue({ eq: mockUpdateEq })
    mockFrom.mockReturnValue({ insert: mockInsert, update: mockUpdate })
    // Sentinel value that no inline branch would ever produce.
    mockScopeOrganizerId.mockReturnValue('SCOPED-SENTINEL')
  })

  it('createEvent writes the organizer_id returned by scopeOrganizerId', async () => {
    mockAccess = { user: { id: 'u' }, supabase: mockSupabase, role: 'organizer', organizerId: 'org-1' }

    await createEvent(buildEvent({ organizer_id: 'org-2' }))

    expect(mockScopeOrganizerId).toHaveBeenCalledWith('organizer', 'org-1', 'org-2')
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ organizer_id: 'SCOPED-SENTINEL' }))
  })

  it('updateEvent writes the organizer_id returned by scopeOrganizerId', async () => {
    mockAccess = { user: { id: 'u' }, supabase: mockSupabase, role: 'organizer', organizerId: 'org-1' }

    await updateEvent('e1', { title: 'New', organizer_id: 'org-2' })

    expect(mockScopeOrganizerId).toHaveBeenCalledWith('organizer', 'org-1', 'org-2')
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ organizer_id: 'SCOPED-SENTINEL' }))
  })

  it('createEvent and updateEvent route through the same seam with the same args', async () => {
    mockAccess = { user: { id: 'u' }, supabase: mockSupabase, role: 'organizer', organizerId: 'org-1' }

    await createEvent(buildEvent({ organizer_id: 'org-2' }))
    await updateEvent('e1', { title: 'New', organizer_id: 'org-2' })

    expect(mockScopeOrganizerId).toHaveBeenNthCalledWith(1, 'organizer', 'org-1', 'org-2')
    expect(mockScopeOrganizerId).toHaveBeenNthCalledWith(2, 'organizer', 'org-1', 'org-2')
    expect(mockInsert.mock.calls[0][0].organizer_id).toBe(mockUpdate.mock.calls[0][0].organizer_id)
  })

  it('rejects browser-local image URLs before writing rich-text content', async () => {
    mockAccess = { user: { id: 'u' }, supabase: mockSupabase, role: 'admin', organizerId: null }

    await expect(createEvent(buildEvent({
      content: '<p>Text</p><img src="blob:https://akhcr.cz/transient">',
    }))).rejects.toThrow('Nahrávání obrázku ještě není dokončeno')

    expect(mockInsert).not.toHaveBeenCalled()
  })
})
