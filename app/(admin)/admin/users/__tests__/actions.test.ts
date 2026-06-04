import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateUserRole } from '../actions'

// Mock dependencies
const mockRevalidatePath = vi.fn()
vi.mock('next/cache', () => ({
  revalidatePath: (path: string) => mockRevalidatePath(path)
}))

const mockSupabase = {
  from: vi.fn(),
}

// Mock the central guard. User-role management is admin-only: the guard
// rejects any role other than 'admin'. We drive the acting role via
// `currentRole` so each test can pin the tier (admin allowed, editor/user
// rejected — stricter than the staff guard).
let currentRole = 'admin'
vi.mock('@/lib/auth/guards', () => ({
  requireAdminRole: vi.fn(() => {
    if (currentRole !== 'admin') {
      return Promise.reject(new Error('Forbidden: Insufficient permissions'))
    }
    return Promise.resolve({ user: { id: 'admin-user-id' }, supabase: mockSupabase })
  })
}))

const mockUpsert = vi.fn()

describe('Users Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    currentRole = 'admin'
    mockSupabase.from.mockReturnValue({ upsert: mockUpsert })
    mockUpsert.mockResolvedValue({ error: null })
  })

  describe('updateUserRole', () => {
    it('upserts the role when user is admin', async () => {
      const result = await updateUserRole('target-user', 'editor')

      expect(result).toEqual({ success: true })
      expect(mockSupabase.from).toHaveBeenCalledWith('user_roles')
      expect(mockUpsert).toHaveBeenCalledWith({ user_id: 'target-user', role: 'editor' })
      expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/users')
    })

    it('rejects an editor (admin-only preserved)', async () => {
      currentRole = 'editor'
      await expect(updateUserRole('target-user', 'editor')).rejects.toThrow('Forbidden')
      expect(mockUpsert).not.toHaveBeenCalled()
    })

    it('rejects a non-staff user', async () => {
      currentRole = 'user'
      await expect(updateUserRole('target-user', 'editor')).rejects.toThrow('Forbidden')
      expect(mockUpsert).not.toHaveBeenCalled()
    })

    it('throws when the upsert fails', async () => {
      mockUpsert.mockResolvedValue({ error: { message: 'DB error' } })
      await expect(updateUserRole('target-user', 'editor')).rejects.toThrow('DB error')
    })
  })
})
