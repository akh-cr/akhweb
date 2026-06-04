import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateContentBlock } from '../actions'

// Mock next/cache so revalidatePath is inert.
const mockRevalidatePath = vi.fn()
vi.mock('next/cache', () => ({
  revalidatePath: (path: string) => mockRevalidatePath(path),
}))

// Shared mock Supabase client. `from('content_blocks')` is used twice per call:
// first to SELECT the block's declared `type` (so validation knows what shape to
// enforce), then to UPDATE the content. Both chains are mocked here.
const mockUpdate = vi.fn()
const mockEqUpdate = vi.fn()
const mockSelect = vi.fn()
const mockEqSelect = vi.fn()
const mockSingle = vi.fn()
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
      select: mockSelect,
      update: mockUpdate,
    })
    // SELECT type chain: from().select('type').eq('id', id).single()
    mockSelect.mockReturnValue({ eq: mockEqSelect })
    mockEqSelect.mockReturnValue({ single: mockSingle })
    mockSingle.mockResolvedValue({ data: { type: 'header' }, error: null })
    // UPDATE chain: from().update({...}).eq('id', id)
    mockUpdate.mockReturnValue({ eq: mockEqUpdate })
    mockEqUpdate.mockResolvedValue({ error: null })

    // Default: staff actor (guard resolves).
    mockRequireAdmin.mockResolvedValue({
      user: { id: 'staff-user' },
      supabase: mockSupabase,
    })
  })

  describe('updateContentBlock', () => {
    it('validates against the declared type then writes for a staff actor', async () => {
      const validHeader = { title: 'Hello', subtitle: 'Sub' }
      const result = await updateContentBlock('block-1', validHeader)

      expect(result).toEqual({ success: true })
      expect(mockSupabase.from).toHaveBeenCalledWith('content_blocks')
      // The declared type was looked up before the write.
      expect(mockSelect).toHaveBeenCalledWith('type')
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ content: validHeader }),
      )
      expect(mockEqUpdate).toHaveBeenCalledWith('id', 'block-1')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/')
    })

    it('rejects malformed content against the declared type BEFORE the DB write', async () => {
      // `header` requires a string `title`; this payload is malformed.
      await expect(
        updateContentBlock('block-1', { subtitle: 'no title' }),
      ).rejects.toThrow()

      // The type was looked up, but NO update was attempted.
      expect(mockSelect).toHaveBeenCalledWith('type')
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('rejects a non-staff (user-role) actor before writing', async () => {
      mockRequireAdmin.mockRejectedValue(
        new Error('Forbidden: Insufficient permissions'),
      )

      await expect(
        updateContentBlock('block-1', { title: 'ok' }),
      ).rejects.toThrow('Forbidden: Insufficient permissions')

      // No write must have happened.
      expect(mockUpdate).not.toHaveBeenCalled()
    })
  })
})
