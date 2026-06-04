import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import EventDetailPage, { generateMetadata } from '../page';

const layoutSpy = vi.fn();
vi.mock('@/components/events/EventLayoutV1', () => ({
  EventLayoutV1: (props: unknown) => {
    layoutSpy(props);
    return <div data-testid="event-layout" />;
  },
}));

const notFoundSpy = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});
vi.mock('next/navigation', () => ({ notFound: () => notFoundSpy() }));

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/events/read', () => ({ getEventDetail: vi.fn() }));
vi.mock('@/lib/event-organizer-colors', () => ({
  AKH_ORGANIZER_SETTINGS_ID: 'akh-settings',
  resolveAkhOrganizerColor: vi.fn(() => '#abcdef'),
}));

import { createClient } from '@/lib/supabase/server';
import { getEventDetail } from '@/lib/events/read';

// content_blocks lookup (AKH organizer colour) — a non-event read left on the page.
function makeSupabase() {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { color_hex: '#abcdef' } }),
    }),
  };
}

describe('EventDetailPage (/akce/[slug])', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockResolvedValue(makeSupabase());
  });

  it('reads the event through the module by decoded slug and reshapes for the layout', async () => {
    (getEventDetail as any).mockResolvedValue({
      data: {
        id: '1',
        slug: 'my-event',
        title: 'Detail',
        cities: { name: 'Praha', image_url: null },
        event_organizers: { name: 'Org', color_hex: '#7dd3fc' },
      },
    });

    render(await EventDetailPage({ params: Promise.resolve({ slug: 'my-event' }) }));

    expect(getEventDetail).toHaveBeenCalledWith(expect.anything(), 'my-event');
    const passed = layoutSpy.mock.calls[0][0].event;
    // cities -> city, event_organizers -> organizer mapping is preserved.
    expect(passed.city).toEqual({ name: 'Praha', image_url: null });
    expect(passed.organizer).toEqual({ name: 'Org', color_hex: '#7dd3fc' });
  });

  it('decodes URL-encoded slugs before reading', async () => {
    (getEventDetail as any).mockResolvedValue({
      data: { id: '1', slug: 'akce cesky', title: 'X', cities: null, event_organizers: null },
    });

    render(await EventDetailPage({ params: Promise.resolve({ slug: 'akce%20cesky' }) }));

    expect(getEventDetail).toHaveBeenCalledWith(expect.anything(), 'akce cesky');
  });

  it('calls notFound() when the event is missing', async () => {
    (getEventDetail as any).mockResolvedValue({ data: null });

    await expect(
      EventDetailPage({ params: Promise.resolve({ slug: 'missing' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFoundSpy).toHaveBeenCalled();
  });

  it('builds metadata from the module read (title + truncated description)', async () => {
    (getEventDetail as any).mockResolvedValue({
      data: { title: 'My Title', description: 'x'.repeat(200) },
    });

    const meta = await generateMetadata(
      { params: Promise.resolve({ slug: 'my-event' }), searchParams: Promise.resolve({}) },
      {} as never,
    );

    expect(getEventDetail).toHaveBeenCalledWith(expect.anything(), 'my-event');
    expect(meta.title).toBe('My Title');
    expect((meta.description as string).length).toBe(160);
  });
});
