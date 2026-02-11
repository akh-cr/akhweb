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

// Mock storage-server
const mockDeleteImages = vi.fn()
vi.mock('@/lib/storage-server', () => ({
    deleteImages: (supabase: any, urls: string[]) => mockDeleteImages(supabase, urls)
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
const mockSelect = vi.fn()
const mockSingle = vi.fn()

describe('Events Actions - Image Deletion', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(console, 'log').mockImplementation(() => {})
        vi.spyOn(console, 'error').mockImplementation(() => {})

        mockSupabase.from.mockReturnValue({
            delete: mockDelete,
            select: mockSelect
        })
        mockDelete.mockReturnValue({
            eq: mockEq
        })
        // Mock select chain for fetching event
        mockSelect.mockReturnValue({
            eq: vi.fn().mockReturnValue({
                single: mockSingle
            })
        })
        
        // Default success for delete
        mockEq.mockResolvedValue({ error: null, count: 1 })
    })

    it('should delete images when event is deleted', async () => {
        // Mock existing event with images
        mockSingle.mockResolvedValue({
            data: {
                image_url: 'http://test.com/image.jpg',
                gallery_images: ['http://test.com/gallery1.jpg']
            }
        })

        await deleteEvent('123')

        // Verify select was called
        expect(mockSupabase.from).toHaveBeenCalledWith('events')
        expect(mockSelect).toHaveBeenCalledWith('image_url, gallery_images')
        
        // Verify deleteImages was called with correct args
        expect(mockDeleteImages).toHaveBeenCalledTimes(1)
        expect(mockDeleteImages).toHaveBeenCalledWith(
            mockSupabase, 
            ['http://test.com/image.jpg', 'http://test.com/gallery1.jpg']
        )

        // Verify database deletion happened
        expect(mockDelete).toHaveBeenCalledWith({ count: 'exact' })
    })

    it('should proceed if no images exist', async () => {
        // Mock event with no images
        mockSingle.mockResolvedValue({
            data: {
                image_url: null,
                gallery_images: []
            }
        })

        await deleteEvent('123')

        expect(mockDeleteImages).toHaveBeenCalledTimes(1)
        expect(mockDeleteImages).toHaveBeenCalledWith(mockSupabase, [null]) // Or empty array depending on implementation detail if we filter before passing
        // Our implementation adds image_url to array, checks gallery_images.
        // [null] will be passed. deleteImages filters it out.
    })
})
