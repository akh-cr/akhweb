import { describe, it, expect, vi, beforeEach } from 'vitest'
import { deleteEvent } from '../actions'

// Mock dependencies
const mockRevalidatePath = vi.fn()
vi.mock('next/cache', () => ({
  revalidatePath: (path: string) => mockRevalidatePath(path)
}))

vi.mock('next/headers', () => ({
    cookies: vi.fn()
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

describe('Events Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // spy on console to keep output clean, valid strategy
        vi.spyOn(console, 'log').mockImplementation(() => {})
        vi.spyOn(console, 'error').mockImplementation(() => {})

        mockSupabase.from.mockReturnValue({
            delete: mockDelete
        })
        mockDelete.mockReturnValue({
            eq: mockEq
        })
        // success case: count 1
        mockEq.mockResolvedValue({ error: null, count: 1 })
    })

    describe('deleteEvent', () => {
        it('deletes event successfully', async () => {
            await deleteEvent('123')
            expect(mockSupabase.from).toHaveBeenCalledWith('events')
            expect(mockDelete).toHaveBeenCalledWith({ count: 'exact' })
            expect(mockEq).toHaveBeenCalledWith('id', '123')
            expect(mockRevalidatePath).toHaveBeenCalledWith('/admin/events')
        })

         it('throws error on DB error', async () => {
            mockEq.mockResolvedValue({ error: { message: 'DB Error' }, count: null })
            await expect(deleteEvent('123')).rejects.toThrow('DB Error')
        })

        it('throws error when no rows deleted (RLS or not found)', async () => {
             mockEq.mockResolvedValue({ error: null, count: 0 })
             await expect(deleteEvent('123')).rejects.toThrow('Nepodařilo se smazat záznam')
        })
    })
})
