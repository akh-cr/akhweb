import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CommunitiesPage from '../page';

// Mock the dependencies
vi.mock('@/components/navbar', () => ({
  Navbar: () => <div data-testid="navbar">Navbar</div>
}));

vi.mock('@/components/theme-switcher', () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher">ThemeSwitcher</div>
}));

vi.mock('@/components/footer', () => ({
  Footer: () => <div data-testid="footer">Footer</div>
}));


vi.mock('@/components/communities-map', () => ({
  CommunitiesMap: () => <div data-testid="communities-map">Map</div>
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn()
}));

vi.mock('@/lib/content', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/content')>()),
  getContentBlocks: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { getContentBlocks } from '@/lib/content';

describe('CommunitiesPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

  it('renders correctly with fetched data', async () => {
    // Mock Supabase response for cities
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
            { slug: 'praha', name: 'Praha' },
            { slug: 'brno', name: 'Brno' }
        ]
      })
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    // Mock Content Blocks response
    (getContentBlocks as any).mockResolvedValue({
      'spolecenstvi.header': {
        title: 'Společenství Test',
        subtitle: 'Test Subtitle',
        image: '/test.jpg'
      }
    });

    const jsx = await CommunitiesPage();
    render(jsx);

    // Check Header
    expect(screen.getByText('Společenství Test')).toBeDefined();
    expect(screen.getByText('Test Subtitle')).toBeDefined();
    expect(screen.getByAltText('Společenství Test')).toBeDefined();

    // Check Cities
    expect(screen.getByText('Praha')).toBeDefined();
    expect(screen.getByText('Brno')).toBeDefined();

    // Check Components
    expect(screen.getByTestId('navbar')).toBeDefined();
    expect(await screen.findByTestId('communities-map')).toBeDefined();

    expect(screen.getByTestId('footer')).toBeDefined();
  });
});
