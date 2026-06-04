import { describe, it, expect, vi, beforeEach } from 'vitest'

// The guarded-mutation seam: one entry point that runs a role guard before any
// write, a declarative per-feature revalidate set, and a single
// image-cleanup-before-delete used by every feature that owns images.

const mockRevalidatePath = vi.fn()
vi.mock('next/cache', () => ({
  revalidatePath: (path: string, type?: string) => mockRevalidatePath(path, type),
}))

const mockDeleteImages = vi.fn()
vi.mock('@/lib/storage-server', () => ({
  deleteImages: (supabase: unknown, urls: unknown[]) => mockDeleteImages(supabase, urls),
}))

import {
  collectImageUrls,
  guardedMutation,
  revalidate,
  deleteWithImageCleanup,
} from '../mutations'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('collectImageUrls', () => {
  it('collects the single image_url and each gallery image', () => {
    const row = {
      image_url: 'http://test/cover.jpg',
      gallery_images: ['http://test/g1.jpg', 'http://test/g2.jpg'],
    }
    expect(collectImageUrls(row)).toEqual([
      'http://test/cover.jpg',
      'http://test/g1.jpg',
      'http://test/g2.jpg',
    ])
  })

  it('handles a row with only a single image_url (no gallery field)', () => {
    expect(collectImageUrls({ image_url: 'http://test/only.jpg' })).toEqual([
      'http://test/only.jpg',
    ])
  })

  it('handles a row with only gallery_images', () => {
    expect(collectImageUrls({ gallery_images: ['http://test/g1.jpg'] })).toEqual([
      'http://test/g1.jpg',
    ])
  })

  it('keeps a null/absent single image as a slot (deleteImages filters it out)', () => {
    expect(collectImageUrls({ image_url: null, gallery_images: [] })).toEqual([null])
  })

  it('ignores a non-array gallery_images value', () => {
    expect(
      collectImageUrls({ image_url: 'http://test/cover.jpg', gallery_images: null }),
    ).toEqual(['http://test/cover.jpg'])
  })

  it('returns an empty array for a null/undefined row', () => {
    expect(collectImageUrls(null)).toEqual([])
    expect(collectImageUrls(undefined)).toEqual([])
  })
})

describe('guardedMutation', () => {
  it('runs the guard before the mutation body and passes its context through', async () => {
    const calls: string[] = []
    const ctx = { supabase: { tag: 'sb' }, user: { id: 'u1' } } as never
    const guard = vi.fn(async () => {
      calls.push('guard')
      return ctx
    })

    const result = await guardedMutation(guard, async (received) => {
      calls.push('body')
      expect(received).toBe(ctx)
      return 'ok'
    })

    expect(calls).toEqual(['guard', 'body'])
    expect(result).toBe('ok')
  })

  it('never runs the mutation body when the guard rejects', async () => {
    const guard = vi.fn(async () => {
      throw new Error('Forbidden: Insufficient permissions')
    })
    const body = vi.fn()

    await expect(guardedMutation(guard, body)).rejects.toThrow('Forbidden')
    expect(body).not.toHaveBeenCalled()
  })
})

describe('revalidate', () => {
  it('fires revalidatePath for exactly the declared path set', () => {
    revalidate(['/admin/cities', '/spolecenstvi'])

    expect(mockRevalidatePath).toHaveBeenCalledTimes(2)
    expect(mockRevalidatePath).toHaveBeenNthCalledWith(1, '/admin/cities', undefined)
    expect(mockRevalidatePath).toHaveBeenNthCalledWith(2, '/spolecenstvi', undefined)
  })

  it('passes a route type for tuple entries (dynamic page revalidation)', () => {
    revalidate(['/akce', ['/akce/[slug]', 'page']])

    expect(mockRevalidatePath).toHaveBeenCalledTimes(2)
    expect(mockRevalidatePath).toHaveBeenNthCalledWith(1, '/akce', undefined)
    expect(mockRevalidatePath).toHaveBeenNthCalledWith(2, '/akce/[slug]', 'page')
  })
})

describe('deleteWithImageCleanup', () => {
  const mockSingle = vi.fn()
  const mockSelectEq = vi.fn(() => ({ single: mockSingle }))
  const mockSelect = vi.fn(() => ({ eq: mockSelectEq }))
  const mockDeleteEq = vi.fn()
  const mockDelete = vi.fn(() => ({ eq: mockDeleteEq }))
  const supabase = {
    from: vi.fn(() => ({ select: mockSelect, delete: mockDelete })),
  }

  beforeEach(() => {
    supabase.from.mockClear()
    mockSelect.mockClear()
    mockSelectEq.mockClear()
    mockDelete.mockClear()
    mockSingle.mockReset()
    mockDeleteEq.mockReset()
    mockDeleteEq.mockResolvedValue({ error: null, count: 1 })
  })

  it('fetches the image columns, cleans up the collected URLs, then deletes the row', async () => {
    mockSingle.mockResolvedValue({
      data: { image_url: 'http://test/cover.jpg', gallery_images: ['http://test/g1.jpg'] },
    })

    await deleteWithImageCleanup(supabase as never, {
      table: 'events',
      id: '123',
      imageColumns: 'image_url, gallery_images',
    })

    // 1. fetch images first
    expect(supabase.from).toHaveBeenCalledWith('events')
    expect(mockSelect).toHaveBeenCalledWith('image_url, gallery_images')
    expect(mockSelectEq).toHaveBeenCalledWith('id', '123')

    // 2. cleanup runs for the collected URLs
    expect(mockDeleteImages).toHaveBeenCalledTimes(1)
    expect(mockDeleteImages).toHaveBeenCalledWith(supabase, [
      'http://test/cover.jpg',
      'http://test/g1.jpg',
    ])

    // 3. row deleted
    expect(mockDelete).toHaveBeenCalled()
    expect(mockDeleteEq).toHaveBeenCalledWith('id', '123')
  })

  it('still attempts cleanup when the row has no images (passes the empty slot)', async () => {
    mockSingle.mockResolvedValue({ data: { image_url: null, gallery_images: [] } })

    await deleteWithImageCleanup(supabase as never, {
      table: 'events',
      id: '123',
      imageColumns: 'image_url, gallery_images',
    })

    expect(mockDeleteImages).toHaveBeenCalledTimes(1)
    expect(mockDeleteImages).toHaveBeenCalledWith(supabase, [null])
  })

  it('does not call cleanup when the row is missing', async () => {
    mockSingle.mockResolvedValue({ data: null })

    await deleteWithImageCleanup(supabase as never, {
      table: 'events',
      id: '123',
      imageColumns: 'image_url, gallery_images',
    })

    expect(mockDeleteImages).not.toHaveBeenCalled()
    expect(mockDelete).toHaveBeenCalled()
  })

  it('passes the count option and returns the delete result', async () => {
    mockSingle.mockResolvedValue({ data: { image_url: null } })
    mockDeleteEq.mockResolvedValue({ error: null, count: 1 })

    const result = await deleteWithImageCleanup(supabase as never, {
      table: 'events',
      id: '123',
      imageColumns: 'image_url, gallery_images',
      count: 'exact',
    })

    expect(mockDelete).toHaveBeenCalledWith({ count: 'exact' })
    expect(result).toEqual({ error: null, count: 1 })
  })

  it('returns (does not throw) a delete error so the caller keeps its own error handling', async () => {
    mockSingle.mockResolvedValue({ data: { image_url: null } })
    mockDeleteEq.mockResolvedValue({ error: { message: 'DB Error' }, count: null })

    const result = await deleteWithImageCleanup(supabase as never, {
      table: 'events',
      id: '123',
      imageColumns: 'image_url, gallery_images',
    })

    expect(result).toEqual({ error: { message: 'DB Error' }, count: null })
  })
})
