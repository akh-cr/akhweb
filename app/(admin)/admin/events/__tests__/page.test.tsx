import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import EventsPage from '../page';

const eventsTableSpy = vi.fn();
vi.mock('../events-table', () => ({
  EventsTable: (props: { data: unknown; basePath: string; showOrganizer: boolean }) => {
    eventsTableSpy(props);
    return <div data-testid="events-table" />;
  },
}));

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/events/read', () => ({ getAdminEvents: vi.fn() }));

import { createClient } from '@/lib/supabase/server';
import { getAdminEvents } from '@/lib/events/read';

const mockSupabase = {} as never;

describe('EventsPage (/admin/events)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createClient as any).mockResolvedValue(mockSupabase);
    (getAdminEvents as any).mockResolvedValue({ data: [{ id: '1', title: 'AKH' }] });
  });

  it('reads AKH events through the module (no inline query) and hides the organizer column', async () => {
    render(await EventsPage());

    expect(getAdminEvents).toHaveBeenCalledWith(mockSupabase, { audience: 'akh' });
    expect(eventsTableSpy).toHaveBeenCalledWith(
      expect.objectContaining({ basePath: '/admin/events', showOrganizer: false }),
    );
  });
});
