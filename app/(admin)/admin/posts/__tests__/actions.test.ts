import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createPost,
  updatePost,
  deletePost,
  togglePostVisibility,
} from '../actions'

// Mock next/cache so revalidatePath is inert.
const mockRevalidatePath = vi.fn()
vi.mock('next/cache', () => ({
  revalidatePath: (path: string) => mockRevalidatePath(path),
}))

vi.mock('@/lib/utils', () => ({
  slugify: vi.fn((str: string) => str.toLowerCase().replace(/\s+/g, '-')),
}))

// Shared mock Supabase client.
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockSupabase = {
  from: vi.fn(),
  auth: { getUser: vi.fn() },
}

// Mock the shared guard so we can drive role decisions.
const mockRequireAdmin = vi.fn()
vi.mock('@/lib/auth/guards', () => ({
  requireAdmin: () => mockRequireAdmin(),
}))

const STAFF_USER = { id: 'staff-user' }

function setStaff() {
  mockRequireAdmin.mockResolvedValue({ user: STAFF_USER, supabase: mockSupabase })
}

function setNonStaff() {
  mockRequireAdmin.mockRejectedValue(
    new Error('Forbidden: Insufficient permissions'),
  )
}

describe('Posts Actions authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Generic chain wiring: insert/update/delete eventually resolve { error: null }.
    mockSupabase.from.mockReturnValue({
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      select: mockSelect,
    })
    mockInsert.mockResolvedValue({ error: null })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockDelete.mockReturnValue({ eq: mockEq })
    // select(...).eq(...).neq(...).single() for slug-uniqueness in updatePost,
    // and select(...).eq(...).single() for image lookup in deletePost.
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        neq: vi.fn().mockReturnValue({ single: mockSingle }),
        single: mockSingle,
      }),
    })
    mockSingle.mockResolvedValue({ data: null, error: null })
    mockEq.mockResolvedValue({ error: null })

    // auth.getUser default success (createPost reads the author id).
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: STAFF_USER },
      error: null,
    })

    setStaff()
  })

  const postData = {
    title: 'Test Post',
    content: 'c',
    excerpt: 'e',
    published_at: null,
    is_hidden: false,
    image_url: null,
    slug: 'test-post',
  }

  describe('createPost', () => {
    it('creates a post for a staff actor', async () => {
      await createPost(postData)
      expect(mockSupabase.from).toHaveBeenCalledWith('posts')
      expect(mockInsert).toHaveBeenCalled()
    })

    it('rejects a non-staff actor before writing', async () => {
      setNonStaff()
      await expect(createPost(postData)).rejects.toThrow(
        'Forbidden: Insufficient permissions',
      )
      expect(mockInsert).not.toHaveBeenCalled()
    })

    it('rejects browser-local image URLs before writing content', async () => {
      await expect(createPost({
        ...postData,
        content: '<img src="blob:https://akhcr.cz/transient">',
      })).rejects.toThrow('Nahrávání obrázku ještě není dokončeno')
      expect(mockInsert).not.toHaveBeenCalled()
    })
  })

  describe('updatePost', () => {
    it('updates a post for a staff actor', async () => {
      await updatePost('post-1', { title: 'New' })
      expect(mockSupabase.from).toHaveBeenCalledWith('posts')
      expect(mockUpdate).toHaveBeenCalled()
    })

    it('rejects a non-staff actor before writing', async () => {
      setNonStaff()
      await expect(updatePost('post-1', { title: 'New' })).rejects.toThrow(
        'Forbidden: Insufficient permissions',
      )
      expect(mockUpdate).not.toHaveBeenCalled()
    })
  })

  describe('deletePost', () => {
    it('deletes a post for a staff actor', async () => {
      await deletePost('post-1')
      expect(mockSupabase.from).toHaveBeenCalledWith('posts')
      expect(mockDelete).toHaveBeenCalled()
    })

    it('rejects a non-staff actor before writing', async () => {
      setNonStaff()
      await expect(deletePost('post-1')).rejects.toThrow(
        'Forbidden: Insufficient permissions',
      )
      expect(mockDelete).not.toHaveBeenCalled()
    })
  })

  describe('togglePostVisibility', () => {
    it('toggles visibility for a staff actor', async () => {
      await togglePostVisibility('post-1', true)
      expect(mockSupabase.from).toHaveBeenCalledWith('posts')
      expect(mockUpdate).toHaveBeenCalledWith({ is_hidden: true })
    })

    it('rejects a non-staff actor before writing', async () => {
      setNonStaff()
      await expect(togglePostVisibility('post-1', true)).rejects.toThrow(
        'Forbidden: Insufficient permissions',
      )
      expect(mockUpdate).not.toHaveBeenCalled()
    })
  })
})
