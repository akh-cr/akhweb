import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateContentBlock } from '../actions'

// Mock next/cache so revalidatePath is inert.
const mockRevalidatePath = vi.fn()
vi.mock('next/cache', () => ({
  revalidatePath: (path: string) => mockRevalidatePath(path),
}))

// Shared mock Supabase client whose update chain resolves successfully.
const mockUpdate = vi.fn()
const mockEqUpdate = vi.fn()
const mockSupabase = {
  from: vi.fn(),
}

// Mock the real guard so we can drive role decisions. We re-use the actual
// "Forbidden" message the shared guard throws for non-staff actors.
const mockRequireAdmin = vi.fn()
vi.mock('@/lib/auth/guards', () => ({
  requireAdmin: () => mockRequireAdmin(),
}))

describe('Content Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockSupabase.from.mockReturnValue({
      update: mockUpdate,
    })
    mockUpdate.mockReturnValue({ eq: mockEqUpdate })
    mockEqUpdate.mockResolvedValue({ error: null })

    // Default: staff actor (guard resolves).
    mockRequireAdmin.mockResolvedValue({
      user: { id: 'staff-user' },
      supabase: mockSupabase,
    })
  })

  describe('updateContentBlock', () => {
    it('updates the content block for a staff actor', async () => {
      const result = await updateContentBlock('block-1', { foo: 'bar' })

      expect(result).toEqual({ success: true })
      expect(mockSupabase.from).toHaveBeenCalledWith('content_blocks')
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ content: { foo: 'bar' } }),
      )
      expect(mockEqUpdate).toHaveBeenCalledWith('id', 'block-1')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/')
    })

    it('rejects a non-staff (user-role) actor before writing', async () => {
      mockRequireAdmin.mockRejectedValue(
        new Error('Forbidden: Insufficient permissions'),
      )

      await expect(
        updateContentBlock('block-1', { foo: 'bar' }),
      ).rejects.toThrow('Forbidden: Insufficient permissions')

      // No write must have happened.
      expect(mockUpdate).not.toHaveBeenCalled()
    })
  })
})
