import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock requireAdmin
vi.mock('@/lib/auth/guards', () => ({
  requireAdmin: vi.fn().mockResolvedValue({ user: { id: 'test' }, supabase: {} }),
}));

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock env
vi.stubEnv('STORAGE_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('UPLOAD_SECRET', 'test-secret');

describe('uploadImageAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should forward file to Edge Function with correct headers', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ publicUrl: 'https://test.supabase.co/storage/v1/object/public/akhweb/images/uploads/test.jpg' }),
    });

    // Dynamic import to pick up env stubs
    const { uploadImageAction } = await import('../actions/upload-image');

    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.jpg', { type: 'image/jpeg' }));

    const result = await uploadImageAction(formData);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://test.supabase.co/functions/v1/upload-image',
      expect.objectContaining({
        method: 'POST',
        headers: { 'x-upload-secret': 'test-secret' },
      })
    );
    expect(result).toMatchObject({ success: true });
    if (!result.success) {
      throw new Error('Expected successful upload result');
    }
    expect(result.publicUrl).toContain('test.supabase.co');
  });

  it('should return an error on missing file', async () => {
    const { uploadImageAction } = await import('../actions/upload-image');

    const formData = new FormData();

    await expect(uploadImageAction(formData)).resolves.toEqual({ success: false, error: 'No file provided' });
  });

  it('should return an error on Edge Function error', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Unauthorized: Invalid upload secret' }),
    });

    const { uploadImageAction } = await import('../actions/upload-image');

    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.jpg', { type: 'image/jpeg' }));

    await expect(uploadImageAction(formData)).resolves.toEqual({ success: false, error: 'Unauthorized: Invalid upload secret' });
  });

  it('should pass prefix and folder to Edge Function', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ publicUrl: 'https://test.supabase.co/image.jpg' }),
    });

    const { uploadImageAction } = await import('../actions/upload-image');

    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.jpg', { type: 'image/jpeg' }));
    formData.append('prefix', 'blog');
    formData.append('folder', 'images');

    await uploadImageAction(formData);

    const sentFormData = mockFetch.mock.calls[0][1].body as FormData;
    expect(sentFormData.get('prefix')).toBe('blog');
    expect(sentFormData.get('folder')).toBe('images');
  });
});
