import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockUpdateEq = vi.fn()
const mockFrom = vi.fn()
const mockSupabase = { from: mockFrom }

// Mutable access object returned by the mocked guard, set per test.
let mockAccess: {
  user: { id: string }
  supabase: typeof mockSupabase
  role: 'admin' | 'editor' | 'organizer'
  organizerId: string | null
}

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/guards', () => ({
  requireAdmin: vi.fn(() => Promise.resolve({ user: { id: 'u' }, supabase: mockSupabase })),
  requireEventAccess: vi.fn(() => Promise.resolve(mockAccess)),
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

describe('event actions — organizer scoping', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInsert.mockResolvedValue({ error: null })
    mockUpdateEq.mockResolvedValue({ error: null })
    mockUpdate.mockReturnValue({ eq: mockUpdateEq })
    mockFrom.mockReturnValue({ insert: mockInsert, update: mockUpdate })
  })

  it('pins an organizer-created event to the organizer\'s own organization', async () => {
    mockAccess = { user: { id: 'u' }, supabase: mockSupabase, role: 'organizer', organizerId: 'org-1' }

    // Tampering attempt 1: create as AKH (null)
    await createEvent(buildEvent({ organizer_id: null }))
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ organizer_id: 'org-1' }))

    // Tampering attempt 2: assign to another organization
    mockInsert.mockClear()
    await createEvent(buildEvent({ organizer_id: 'org-2' }))
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ organizer_id: 'org-1' }))
  })

  it('keeps the requested organizer when an admin creates an event', async () => {
    mockAccess = { user: { id: 'u' }, supabase: mockSupabase, role: 'admin', organizerId: null }

    await createEvent(buildEvent({ organizer_id: 'org-9' }))
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ organizer_id: 'org-9' }))

    // AKH (null) must remain null for admins
    mockInsert.mockClear()
    await createEvent(buildEvent({ organizer_id: null }))
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({ organizer_id: null }))
  })

  it('prevents an organizer from moving an event to another organization on update', async () => {
    mockAccess = { user: { id: 'u' }, supabase: mockSupabase, role: 'organizer', organizerId: 'org-1' }

    await updateEvent('e1', { title: 'New', organizer_id: 'org-2' })
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ organizer_id: 'org-1' }))
  })
})
