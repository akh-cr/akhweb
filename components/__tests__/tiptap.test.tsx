import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor, fireEvent } from '@testing-library/react'
import Tiptap from '../tiptap'
import React from 'react'

// Mock dependencies
const mockUpload = vi.fn()
const mockGetPublicUrl = vi.fn()

// Mock Supabase storage client
const mockSupabase = {
  storage: {
    from: vi.fn((bucket) => ({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl
    }))
  }
}

vi.mock('@/lib/supabase/storage-client', () => ({
  createStorageClient: () => mockSupabase
}))

vi.mock('@/lib/supabase/storage-config', () => ({
  STORAGE_BUCKET: 'akhweb'
}))

// Mock image compression
vi.mock('browser-image-compression', () => ({
  default: vi.fn((file) => Promise.resolve(file))
}))

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:test-url')

describe('Tiptap Editor Image Upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default success behavior
    mockUpload.mockResolvedValue({ data: { path: 'uploaded-path.jpg' }, error: null })
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://fake.supabase/test.jpg' } })
  })

  it('uploads image to "images" bucket and updates editor content', async () => {
    // 1. Render component
    const handleChange = vi.fn()
    const { container } = render(<Tiptap content="" onChange={handleChange} />)

    // 2. Find file input
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeTruthy()

    // 3. Create dummy file
    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })

    // 4. Trigger upload
    fireEvent.change(fileInput, { target: { files: [file] } })

    // 5. Verify optimized upload call
    await waitFor(() => {
      expect(mockUpload).toHaveBeenCalled()
    })

    // Verify it used the unified storage bucket 'akhweb'
    expect(mockSupabase.storage.from).toHaveBeenCalledWith('akhweb')

    // 6. Verify public URL retrieval
    expect(mockGetPublicUrl).toHaveBeenCalled()

    // 7. Verify logic update (setNodeMarkup calls or setImage)
    // Tiptap runs asynchronously. We check if onChange was called with the new HTML containing the public URL
    await waitFor(() => {
        const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1][0]
        expect(lastCall).toContain('src="https://fake.supabase/test.jpg"')
    })
  })
})
