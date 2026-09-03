import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock event-management guard used by the upload action
vi.mock('@/lib/auth/guards', () => ({
  requireEventAccess: vi.fn().mockResolvedValue({
    user: { id: 'test' },
    role: 'admin',
    organizerId: null,
    supabase: {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: {
            session: {
              access_token: 'test-access-token',
            },
          },
        }),
      },
    },
  }),
}));

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('uploadImageAction', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
  });

  it('should forward file to the image API with correct headers', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: 'https://akh.img.festapp.net/images/uploads/test.jpg' }),
    });

    // Dynamic import to pick up env stubs
    const { uploadImageAction } = await import('../actions/upload-image');

    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.jpg', { type: 'image/jpeg' }));

    const result = await uploadImageAction(formData);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://image-api.festapp.net/upload',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer test-access-token' },
      })
    );
    expect(result).toMatchObject({ success: true });
    if (!result.success) {
      throw new Error('Expected successful upload result');
    }
    expect(result.publicUrl).toContain('akh.img.festapp.net');
  });

  it('should return an error on missing file', async () => {
    const { uploadImageAction } = await import('../actions/upload-image');

    const formData = new FormData();

    await expect(uploadImageAction(formData)).resolves.toEqual({ success: false, error: 'No file provided' });
  });

  it('should return an error on image API failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Unauthorized: Invalid upload secret' }),
    });

    const { uploadImageAction } = await import('../actions/upload-image');

    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.jpg', { type: 'image/jpeg' }));

    await expect(uploadImageAction(formData)).resolves.toEqual({ success: false, error: 'Unauthorized: Invalid upload secret' });
  });

  it('should pass the AKH project, prefix and folder to the image API', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: 'https://akh.img.festapp.net/blog/images/image.jpg' }),
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
    expect(sentFormData.get('projectId')).toBe('akhweb');
  });

  it('should always use the canonical image API for uploads', async () => {
    vi.unstubAllEnvs();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://main.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: 'https://akh.img.festapp.net/images/uploads/image.jpg' }),
    });

    const { uploadImageAction } = await import('../actions/upload-image');

    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.jpg', { type: 'image/jpeg' }));

    const result = await uploadImageAction(formData);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://image-api.festapp.net/upload',
      expect.objectContaining({
        method: 'POST',
        headers: { Authorization: 'Bearer test-access-token' },
      })
    );
    expect(result).toMatchObject({ success: true });
  });

  it('should return an error when the user session is missing', async () => {
    vi.doMock('@/lib/auth/guards', () => ({
      requireEventAccess: vi.fn().mockResolvedValue({
        user: { id: 'test' },
        role: 'admin',
        organizerId: null,
        supabase: {
          auth: {
            getSession: vi.fn().mockResolvedValue({
              data: { session: null },
            }),
          },
        },
      }),
    }));

    const { uploadImageAction } = await import('../actions/upload-image');

    const formData = new FormData();
    formData.append('file', new File(['test'], 'test.jpg', { type: 'image/jpeg' }));

    await expect(uploadImageAction(formData)).resolves.toEqual({
      success: false,
      error: 'Chybí přihlašovací relace pro autorizaci uploadu.',
    });
  });
});
