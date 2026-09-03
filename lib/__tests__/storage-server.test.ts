import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { deleteImage, deleteImages } from '../storage-server'

describe('Storage Server Utils', () => {
    const mockGetSession = vi.fn()
    const mockFetch = vi.fn()
    
    const mockSupabase = {
        auth: {
            getSession: mockGetSession
        }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any

    vi.stubGlobal('fetch', mockFetch)

    beforeEach(() => {
        vi.clearAllMocks()
        vi.unstubAllEnvs()
        vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://main.supabase.co')
        mockGetSession.mockResolvedValue({
            data: {
                session: {
                    access_token: 'test-access-token'
                }
            }
        })
        mockFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ success: true })
        })
        
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })
    
    afterEach(() => {
         vi.clearAllMocks()
    })

    describe('deleteImage', () => {
        it('should forward a single image URL to the delete proxy', async () => {
            const url = 'https://PROJECT_ID.supabase.co/storage/v1/object/public/images/folder/image.jpg'
            
            await deleteImage(mockSupabase, url)
            
            expect(mockFetch).toHaveBeenCalledWith(
                'https://image-api.festapp.net/delete',
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer test-access-token',
                        'Content-Type': 'application/json',
                    },
                })
            )
            expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({ projectId: 'akhweb', links: [url] })
        })

        it('should ignore null/undefined URLs', async () => {
            await deleteImage(mockSupabase, null)
            await deleteImage(mockSupabase, undefined)
            
            expect(mockFetch).not.toHaveBeenCalled()
        })

        it('should log error when the delete proxy fails', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                json: () => Promise.resolve({ error: 'Delete failed' })
            })

            const url = 'https://sb.co/storage/v1/object/public/b/f.jpg'
            
            await deleteImage(mockSupabase, url)
            
            expect(console.error).toHaveBeenCalledWith(
                'Image API delete error:',
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
            
            expect(mockFetch).toHaveBeenCalledTimes(1)
            expect(JSON.parse(mockFetch.mock.calls[0][1].body)).toEqual({
                projectId: 'akhweb',
                links: [
                    'https://sb.co/storage/v1/object/public/b1/f1.jpg',
                    'https://sb.co/storage/v1/object/public/b2/f2.jpg'
                ]
            })
        })
    })
})
