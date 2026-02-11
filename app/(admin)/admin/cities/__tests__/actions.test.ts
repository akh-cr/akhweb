import { describe, it, expect, vi, beforeEach } from 'vitest'
import { deleteCity } from '../actions'

// Mock dependencies
const mockRevalidatePath = vi.fn()
vi.mock('next/cache', () => ({
  revalidatePath: (path: string) => mockRevalidatePath(path)
}))

const mockSupabase = {
  from: vi.fn(),
}

// Mock guards
vi.mock('@/lib/auth/guards', () => ({
  requireAdmin: vi.fn(() => Promise.resolve({ user: { id: 'test-user' }, supabase: mockSupabase }))
}))

const mockDelete = vi.fn()
const mockEq = vi.fn()

describe('Cities Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockSupabase.from.mockReturnValue({
            delete: mockDelete,
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: { image_url: 'https://example.com/test.jpg' }, error: null })
                })
            })
        })
        mockDelete.mockReturnValue({
            eq: mockEq
        })
        mockEq.mockResolvedValue({ error: null })
    })

    describe('deleteCity', () => {
        it('deletes city successfully', async () => {
            await deleteCity('123')
            expect(mockSupabase.from).toHaveBeenCalledWith('cities')
            expect(mockDelete).toHaveBeenCalled()
            expect(mockEq).toHaveBeenCalledWith('id', '123')
            expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/cities')
        })

         it('throws error on failure', async () => {
            mockEq.mockResolvedValue({ error: { message: 'Failed' } })
            await expect(deleteCity('123')).rejects.toThrow('Failed')
        })
    })
})
