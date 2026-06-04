import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import InvitationsPage from '../page';

vi.mock('@/components/navbar', () => ({ Navbar: () => <div data-testid="navbar">Navbar</div> }));
vi.mock('@/components/footer', () => ({ Footer: () => <div data-testid="footer">Footer</div> }));
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/content', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/content')>()),
  getContentBlocks: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { getContentBlocks } from '@/lib/content';

describe('InvitationsPage (/pozvanky)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists only external invitations (organizer_id IS NOT NULL) with a badge', async () => {
    const upcomingData = [
      { id: '1', title: 'External Upcoming', start_time: '2099-01-01', slug: 'ext-up', organizer_id: 'org-1', event_organizers: { name: 'Org One', color_hex: '#7dd3fc' } },
    ];
    const pastData = [
      { id: '2', title: 'External Past', start_time: '2020-01-01', slug: 'ext-past', organizer_id: 'org-1', event_organizers: { name: 'Org One', color_hex: '#7dd3fc' } },
    ];

    (getContentBlocks as any).mockResolvedValue({});

    const mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      not: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      returns: vi.fn().mockReturnThis(),
      then: vi.fn()
        .mockImplementationOnce((resolve) => resolve({ data: upcomingData }))
        .mockImplementationOnce((resolve) => resolve({ data: pastData, count: 1 })),
    };

    const mockSupabase = { from: vi.fn().mockReturnValue(mockQueryBuilder) };
    (createClient as any).mockResolvedValue(mockSupabase);

    const jsx = await InvitationsPage({ searchParams: Promise.resolve({}) });
    render(jsx);

    expect(screen.getByText('External Upcoming')).toBeDefined();
    expect(screen.getByText('External Past')).toBeDefined();
    // The badge of the external organizer is shown
    expect(screen.getAllByText('Org One').length).toBeGreaterThan(0);
    // Only external invitations are queried
    expect(mockQueryBuilder.not).toHaveBeenCalledWith('organizer_id', 'is', null);
  });
});
