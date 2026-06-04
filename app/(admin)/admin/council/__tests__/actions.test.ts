import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createCouncilMember, updateCouncilMember, deleteCouncilMember } from '../actions'

// Mock dependencies
const mockRevalidatePath = vi.fn()
vi.mock('next/cache', () => ({
  revalidatePath: (path: string) => mockRevalidatePath(path)
}))

const mockSupabase = {
  from: vi.fn(),
}

// Mock the central guard. Council is admin-only: the guard rejects any role
// other than 'admin'. We drive the acting role via `currentRole` so each test
// can pin the per-feature tier (admin allowed, editor/user rejected).
let currentRole = 'admin'
vi.mock('@/lib/auth/guards', () => ({
  requireAdminRole: vi.fn(() => {
    if (currentRole !== 'admin') {
      return Promise.reject(new Error('Forbidden: Insufficient permissions'))
    }
    return Promise.resolve({ user: { id: 'test-user-id' }, supabase: mockSupabase })
  })
}))

const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()

describe('Council Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    currentRole = 'admin'

    const queryBuilder = {
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    }
    mockSupabase.from.mockReturnValue(queryBuilder)

    mockSelect.mockReturnValue({ eq: () => ({ single: mockSingle }) })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockDelete.mockReturnValue({ eq: mockEq })

    // image_url lookup used by deleteCouncilMember
    mockSingle.mockResolvedValue({ data: { image_url: null } })

    mockInsert.mockResolvedValue({ error: null })
    mockEq.mockResolvedValue({ error: null }) // final await of update/delete chains
  })

  describe('createCouncilMember', () => {
    it('creates member when user is admin', async () => {
      const data = { name: 'Test', role: 'Role' }
      const result = await createCouncilMember(data)

      expect(result).toEqual({ success: true })
      expect(mockSupabase.from).toHaveBeenCalledWith('council_members')
      expect(mockInsert).toHaveBeenCalledWith(data)
      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/council')
    })

    it('rejects an editor (admin-only preserved)', async () => {
      currentRole = 'editor'
      await expect(createCouncilMember({})).rejects.toThrow('Forbidden')
      expect(mockInsert).not.toHaveBeenCalled()
    })

    it('rejects a non-staff user', async () => {
      currentRole = 'user'
      await expect(createCouncilMember({})).rejects.toThrow('Forbidden')
      expect(mockInsert).not.toHaveBeenCalled()
    })
  })

  describe('updateCouncilMember', () => {
    it('updates member when user is admin', async () => {
      const data = { name: 'Updated' }
      const result = await updateCouncilMember('123', data)

      expect(result).toEqual({ success: true })
      expect(mockSupabase.from).toHaveBeenCalledWith('council_members')
      expect(mockUpdate).toHaveBeenCalledWith(data)
      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/council')
    })

    it('rejects an editor (admin-only preserved)', async () => {
      currentRole = 'editor'
      await expect(updateCouncilMember('123', {})).rejects.toThrow('Forbidden')
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('rejects a non-staff user', async () => {
      currentRole = 'user'
      await expect(updateCouncilMember('123', {})).rejects.toThrow('Forbidden')
      expect(mockUpdate).not.toHaveBeenCalled()
    })
  })

  describe('deleteCouncilMember', () => {
    it('deletes member when user is admin', async () => {
      const result = await deleteCouncilMember('123')

      expect(result).toEqual({ success: true })
      expect(mockSupabase.from).toHaveBeenCalledWith('council_members')
      expect(mockDelete).toHaveBeenCalled()
      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/council')
    })

    it('rejects an editor (admin-only preserved)', async () => {
      currentRole = 'editor'
      await expect(deleteCouncilMember('123')).rejects.toThrow('Forbidden')
      expect(mockDelete).not.toHaveBeenCalled()
    })

    it('rejects a non-staff user', async () => {
      currentRole = 'user'
      await expect(deleteCouncilMember('123')).rejects.toThrow('Forbidden')
      expect(mockDelete).not.toHaveBeenCalled()
    })
  })
})
