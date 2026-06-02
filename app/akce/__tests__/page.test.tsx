import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import EventsPage from '../page';

// Mock dependencies
vi.mock('@/components/navbar', () => ({ Navbar: () => <div data-testid="navbar">Navbar</div> }));
vi.mock('@/components/footer', () => ({ Footer: () => <div data-testid="footer">Footer</div> }));
vi.mock('@/components/video-player', () => ({ VideoPlayer: () => <div data-testid="video-player">Video</div> }));
vi.mock('@/components/google-calendar', () => ({ GoogleCalendar: () => <div data-testid="google-calendar">Calendar</div> }));
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/content', () => ({ getContentBlocks: vi.fn() }));

import { createClient } from '@/lib/supabase/server';
import { getContentBlocks } from '@/lib/content';

describe('EventsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

  it('renders upcoming and past events correctly', async () => {
    // Data Definitions
    const upcomingData = [
        { id: '1', title: 'Upcoming Event', start_time: '2099-01-01', slug: 'upcoming' }
    ];
    const pastData = [
        { id: '2', title: 'Past Event', start_time: '2020-01-01', slug: 'past' }
    ];
    const pastEventsDataCount = { data: pastData, count: 1 };

    // Mock Content
    (getContentBlocks as any).mockResolvedValue({
        'akce.header': { title: 'Akce Test', subtitle: 'Subtitle Test', image: '/img.jpg' }
    });


    // Mock Supabase
    // Mock Query Builder
    const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        returns: vi.fn().mockReturnThis(),
        then: vi.fn()
          .mockImplementationOnce((resolve) => resolve({ data: upcomingData }))
          .mockImplementationOnce((resolve) => resolve({ data: pastData, count: 1 }))
    };

    // Mock Supabase Client
    const mockSupabase = {
        from: vi.fn().mockReturnValue(mockQueryBuilder),
    };
    (createClient as any).mockResolvedValue(mockSupabase);

    const jsx = await EventsPage({ searchParams: Promise.resolve({}) });
    render(jsx);

    // Check Header
    expect(screen.getByText('Akce Test')).toBeDefined();

    // Check Events
    expect(screen.getByText('Upcoming Event')).toBeDefined();
    expect(screen.getByText('Past Event')).toBeDefined();

    // Check Sections
    expect(screen.getByText('Nadcházející akce')).toBeDefined();
    expect(screen.getByText('Proběhlé akce')).toBeDefined();

    // /akce shows ONLY AKH events (organizer_id IS NULL)
    expect(mockQueryBuilder.is).toHaveBeenCalledWith('organizer_id', null);
    
    // Check hero image presence via alt text (Mocked content title is 'Akce Test')
    const heroImage = screen.getByAltText('Akce Test');
    expect(heroImage).toBeDefined();
  });
});
