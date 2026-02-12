import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../page';

vi.mock('@/components/navbar', () => ({ Navbar: () => <div data-testid="navbar">Navbar</div> }));
vi.mock('@/components/footer', () => ({ Footer: () => <div data-testid="footer">Footer</div> }));
vi.mock('@/components/home/HomeLayoutV1', () => ({ HomeLayoutV1: () => <div data-testid="home-layout">Home Layout</div> }));
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/seo', () => ({ getPageSeo: vi.fn() }));

import { createClient } from '@/lib/supabase/server';

describe('Home Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

  it('fetches data in parallel and renders layout', async () => {
    const mockSupabase = {
      rpc: vi.fn().mockResolvedValue({ data: [] }),
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockResolvedValue({ data: [] })
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const props = {
        searchParams: Promise.resolve({})
    };

    const jsx = await Home(props);
    render(jsx);

    expect(mockSupabase.rpc).toHaveBeenCalled();
    expect(mockSupabase.from).toHaveBeenCalledWith('content_blocks');
    expect(screen.getByTestId('home-layout')).toBeDefined();
  });
});
