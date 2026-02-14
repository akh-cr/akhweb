
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { uploadImage } from '../storage';
import { createStorageClient } from '@/lib/supabase/storage-client';
import imageCompression from 'browser-image-compression';

// Mock dependencies
vi.mock('@/lib/supabase/storage-client', () => ({
  createStorageClient: vi.fn(),
}));

vi.mock('@/lib/supabase/storage-config', () => ({
  STORAGE_BUCKET: 'akhweb',
}));

vi.mock('browser-image-compression', () => ({
  default: vi.fn(),
}));

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => '1234-5678-90ab-cdef',
  },
});

describe('uploadImage', () => {
  const mockUpload = vi.fn();
  const mockGetPublicUrl = vi.fn();
  const mockFrom = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Supabase mock chain
    (createStorageClient as unknown as Mock).mockReturnValue({
      storage: {
        from: mockFrom.mockReturnValue({
          upload: mockUpload,
          getPublicUrl: mockGetPublicUrl,
        }),
      },
    });

    // Default mock responses
    mockUpload.mockResolvedValue({ data: { path: 'test/path' }, error: null });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/image.jpg' } });
    (imageCompression as unknown as Mock).mockImplementation((file) => Promise.resolve(file));
  });

  it('should compress and upload image with default settings', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    const url = await uploadImage(file);

    expect(imageCompression).toHaveBeenCalledWith(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    });

    expect(mockFrom).toHaveBeenCalledWith('akhweb');
    expect(mockUpload).toHaveBeenCalledWith(
      expect.stringMatching(/^images\/uploads\/.*\.jpg$/),
      expect.any(File)
    );
    expect(url).toBe('https://example.com/image.jpg');
  });

  it('should respect custom options', async () => {
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const options = {
      bucket: 'custom-bucket',
      folder: 'custom-folder',
      compression: { maxSizeMB: 0.5 }
    };

    await uploadImage(file, options);

    expect(imageCompression).toHaveBeenCalledWith(file, { maxSizeMB: 0.5 });
    expect(mockFrom).toHaveBeenCalledWith('akhweb');
    expect(mockUpload).toHaveBeenCalledWith(
      expect.stringMatching(/^custom-bucket\/custom-folder\/.*\.png$/),
      expect.any(File)
    );
  });

  it('should clean folder path', async () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await uploadImage(file, { folder: 'trailing/slash/' });

    expect(mockUpload).toHaveBeenCalledWith(
      expect.stringMatching(/^images\/trailing\/slash\/.*\.jpg$/),
      expect.any(File)
    );
  });

  it('should throw error on upload failure', async () => {
    const error = { message: 'Upload failed' };
    mockUpload.mockResolvedValue({ data: null, error });
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    await expect(uploadImage(file)).rejects.toEqual(error);
  });
});
