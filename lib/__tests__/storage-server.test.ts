import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { deleteImage, deleteImages } from '../storage-server'

describe('Storage Server Utils', () => {
    const mockRemove = vi.fn()
    const mockFrom = vi.fn()
    
    const mockSupabase = {
        storage: {
            from: mockFrom
        }
    } as any

    beforeEach(() => {
        vi.clearAllMocks()
        mockFrom.mockReturnValue({
            remove: mockRemove
        })
        mockRemove.mockResolvedValue({ error: null })
        
        // Spy on console to avoid pollution
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })
    
    afterEach(() => {
         vi.clearAllMocks()
    })

    describe('deleteImage', () => {
        it('should extract bucket and path correctly from valid URL', async () => {
            const url = 'https://PROJECT_ID.supabase.co/storage/v1/object/public/images/folder/image.jpg'
            
            await deleteImage(mockSupabase, url)
            
            expect(mockFrom).toHaveBeenCalledWith('images')
            expect(mockRemove).toHaveBeenCalledWith(['folder/image.jpg'])
        })

        it('should handle URLs without folders', async () => {
             const url = 'https://PROJECT_ID.supabase.co/storage/v1/object/public/avatars/user.png'
             
             await deleteImage(mockSupabase, url)
             
             expect(mockFrom).toHaveBeenCalledWith('avatars')
             expect(mockRemove).toHaveBeenCalledWith(['user.png'])
        })

        it('should ignore null/undefined URLs', async () => {
            await deleteImage(mockSupabase, null)
            await deleteImage(mockSupabase, undefined)
            
            expect(mockFrom).not.toHaveBeenCalled()
        })

        it('should warn on invalid URL format', async () => {
            // Missing /storage/v1/object/public/
            const url = 'https://example.com/images/test.jpg'
            
            await deleteImage(mockSupabase, url)
            
            expect(mockFrom).not.toHaveBeenCalled()
            expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Invalid Supabase storage URL'), url)
        })

        it('should log error when storage remove fails', async () => {
            mockRemove.mockResolvedValue({ error: { message: 'Storage Error' } })
            const url = 'https://sb.co/storage/v1/object/public/b/f.jpg'
            
            await deleteImage(mockSupabase, url)
            
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining("Failed to delete"),
                expect.anything()
            )
        })
    })

    describe('deleteImages', () => {
        it('should call deleteImage for each valid URL', async () => {
            const urls = [
                'https://sb.co/storage/v1/object/public/b1/f1.jpg',
                null,
                'https://sb.co/storage/v1/object/public/b2/f2.jpg'
            ]
            
            await deleteImages(mockSupabase, urls)
            
            expect(mockFrom).toHaveBeenCalledTimes(2)
            expect(mockFrom).toHaveBeenCalledWith('b1')
            expect(mockFrom).toHaveBeenCalledWith('b2')
        })
    })
})
