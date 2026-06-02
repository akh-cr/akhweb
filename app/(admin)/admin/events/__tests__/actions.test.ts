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

// Mock lib/storage-server
vi.mock('@/lib/storage-server', () => ({
    deleteImages: vi.fn(),
    deleteImage: vi.fn()
}))

// Mock guards
vi.mock('@/lib/auth/guards', () => ({
  requireAdmin: vi.fn(() => Promise.resolve({ user: { id: 'test-user' }, supabase: mockSupabase })),
  requireEventAccess: vi.fn(() => Promise.resolve({ user: { id: 'test-user' }, supabase: mockSupabase, role: 'admin', organizerId: null }))
}))

const mockDelete = vi.fn()
const mockEq = vi.fn()
const mockSelect = vi.fn()
const mockSingle = vi.fn()

describe('Events Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // spy on console to keep output clean, valid strategy
        vi.spyOn(console, 'log').mockImplementation(() => {})
        vi.spyOn(console, 'error').mockImplementation(() => {})

        mockSupabase.from.mockReturnValue({
            delete: mockDelete,
            select: mockSelect
        })
        mockDelete.mockReturnValue({
            eq: mockEq
        })
        
        // Mock select chain for image fetching
        mockSelect.mockReturnValue({
             eq: vi.fn().mockReturnValue({
                 single: mockSingle
             })
        })
        // Default: no images found, so we don't crash the delete logic
        mockSingle.mockResolvedValue({ data: null })

        // success case: count 1
        mockEq.mockResolvedValue({ error: null, count: 1 })
    })

    describe('deleteEvent', () => {
        it('deletes event successfully', async () => {
            await deleteEvent('123')
            expect(mockSupabase.from).toHaveBeenCalledWith('events')
            expect(mockSelect).toHaveBeenCalled() // It now selects images first
            expect(mockDelete).toHaveBeenCalledWith({ count: 'exact' })
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
