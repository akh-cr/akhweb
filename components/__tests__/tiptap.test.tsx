import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor, fireEvent } from '@testing-library/react'
import Tiptap from '../tiptap'
import React from 'react'

// Mock the server action
vi.mock('@/lib/actions/upload-image', () => ({
  uploadImageAction: vi.fn().mockResolvedValue({
    success: true,
    publicUrl: 'https://fake.supabase/test.jpg'
  })
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
  })

  it('uploads image via server action and updates editor content', async () => {
    const { uploadImageAction } = await import('@/lib/actions/upload-image')

    const handleChange = vi.fn()
    const { container } = render(<Tiptap content="" onChange={handleChange} />)

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeTruthy()

    const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })

    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(uploadImageAction).toHaveBeenCalled()
    })

    // Verify the FormData sent to server action contains the file
    const calledFormData = (uploadImageAction as ReturnType<typeof vi.fn>).mock.calls[0][0] as FormData
    expect(calledFormData.get('file')).toBeTruthy()
    expect(calledFormData.get('prefix')).toBe('images')

    // Verify editor content updated with public URL
    await waitFor(() => {
      const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1][0]
      expect(lastCall).toContain('src="https://fake.supabase/test.jpg"')
    })
  })
})
