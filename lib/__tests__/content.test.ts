import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { getContentBlocks } from '../content';
import { createClient } from '@/lib/supabase/server';

// Mock Supabase client
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

describe('getContentBlocks', () => {
  const mockFrom: Mock = vi.fn();
  const mockSelect: Mock = vi.fn();
  const mockIn: Mock = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as unknown as Mock).mockResolvedValue({
      from: mockFrom.mockReturnValue({
        select: mockSelect.mockReturnValue({
          in: mockIn,
        }),
      }),
    });
  });

  it('should fetch content and handle empty results', async () => {
    mockIn.mockResolvedValue({ data: [] });
    
    const result = await getContentBlocks(['test.id']);
    
    expect(result).toEqual({});
    expect(mockFrom).toHaveBeenCalledWith('content_blocks');
    expect(mockIn).toHaveBeenCalledWith('id', ['test.id']);
  });

  it('should transform data into a map', async () => {
    const mockData = [
      { id: 'home.header', content: { title: 'Test Header' } },
      { id: 'about.text', content: { text: 'Test Text' } },
    ];
    mockIn.mockResolvedValue({ data: mockData });

    const result = await getContentBlocks(['home.header', 'about.text']);

    expect(result).toEqual({
      'home.header': { title: 'Test Header' },
      'about.text': { text: 'Test Text' },
    });
  });

  it('should handle null data gracefully', async () => {
    mockIn.mockResolvedValue({ data: null });
    
    const result = await getContentBlocks(['test.id']);
    
    expect(result).toEqual({});
  });
});
