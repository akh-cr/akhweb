import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockSingle = vi.fn()
const mockEq = vi.fn(() => ({ single: mockSingle }))
const mockSelect = vi.fn(() => ({ eq: mockEq }))
const mockFrom = vi.fn(() => ({ select: mockSelect }))
const mockSupabase = {
  auth: { getUser: mockGetUser },
  from: mockFrom,
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}))

import { requireEventAccess, requireAdminRole } from '../guards'

describe('requireAdminRole', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEq.mockReturnValue({ single: mockSingle })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ select: mockSelect })
  })

  it('throws when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    await expect(requireAdminRole()).rejects.toThrow('Unauthorized')
  })

  it('throws for a plain user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockSingle.mockResolvedValue({ data: { role: 'user' } })
    await expect(requireAdminRole()).rejects.toThrow('Forbidden')
  })

  it('throws for an editor (admin-only, stricter than staff)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u2' } } })
    mockSingle.mockResolvedValue({ data: { role: 'editor' } })
    await expect(requireAdminRole()).rejects.toThrow('Forbidden')
  })

  it('throws for an organizer', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u3' } } })
    mockSingle.mockResolvedValue({ data: { role: 'organizer' } })
    await expect(requireAdminRole()).rejects.toThrow('Forbidden')
  })

  it('allows an admin', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u4' } } })
    mockSingle.mockResolvedValue({ data: { role: 'admin' } })
    const result = await requireAdminRole()
    expect(result.user.id).toBe('u4')
    expect(result.supabase).toBe(mockSupabase)
  })
})

describe('requireEventAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEq.mockReturnValue({ single: mockSingle })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ select: mockSelect })
  })

  it('throws when not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    await expect(requireEventAccess()).rejects.toThrow('Unauthorized')
  })

  it('throws for a plain user (no management role)', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } } })
    mockSingle.mockResolvedValue({ data: { role: 'user', organizer_id: null } })
    await expect(requireEventAccess()).rejects.toThrow('Forbidden')
  })

  it('returns role and organizerId for an organizer', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u2' } } })
    mockSingle.mockResolvedValue({ data: { role: 'organizer', organizer_id: 'org-1' } })
    const result = await requireEventAccess()
    expect(result.role).toBe('organizer')
    expect(result.organizerId).toBe('org-1')
    expect(result.user.id).toBe('u2')
  })

  it('allows an admin and reports a null organizerId', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u3' } } })
    mockSingle.mockResolvedValue({ data: { role: 'admin', organizer_id: null } })
    const result = await requireEventAccess()
    expect(result.role).toBe('admin')
    expect(result.organizerId).toBeNull()
  })
})
