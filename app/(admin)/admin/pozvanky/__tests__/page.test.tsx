import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import InvitationsAdminPage from '../page';

// Capture what the page hands to the table so we can assert the read result
// flows straight through without inline reshaping.
const eventsTableSpy = vi.fn();
vi.mock('../../events/events-table', () => ({
  EventsTable: (props: { data: unknown; basePath: string; showOrganizer: boolean }) => {
    eventsTableSpy(props);
    return <div data-testid="events-table" />;
  },
}));

vi.mock('@/lib/auth/guards', () => ({ requireEventAccess: vi.fn() }));
vi.mock('@/lib/events/read', () => ({ getAdminEvents: vi.fn() }));

import { requireEventAccess } from '@/lib/auth/guards';
import { getAdminEvents } from '@/lib/events/read';

const mockSupabase = {} as never;

describe('InvitationsAdminPage (/admin/pozvanky)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getAdminEvents as any).mockResolvedValue({ data: [{ id: '1', title: 'Inv' }] });
  });

  it('reads external invitations through the module (no inline query)', async () => {
    (requireEventAccess as any).mockResolvedValue({
      supabase: mockSupabase,
      role: 'admin',
      organizerId: null,
    });

    render(await InvitationsAdminPage());

    expect(getAdminEvents).toHaveBeenCalledWith(mockSupabase, {
      audience: 'external',
      organizerId: null,
    });
    expect(eventsTableSpy).toHaveBeenCalledWith(
      expect.objectContaining({ basePath: '/admin/pozvanky', showOrganizer: true }),
    );
  });

  it('scopes an organizer to their own organization via the module', async () => {
    (requireEventAccess as any).mockResolvedValue({
      supabase: mockSupabase,
      role: 'organizer',
      organizerId: 'org-1',
    });

    render(await InvitationsAdminPage());

    // Organizer read-scoping is delegated to the module (organizerId passed in),
    // not applied inline on the page.
    expect(getAdminEvents).toHaveBeenCalledWith(mockSupabase, {
      audience: 'external',
      organizerId: 'org-1',
    });
  });

  it('does not scope editors (organizerId stays null even if one is present)', async () => {
    (requireEventAccess as any).mockResolvedValue({
      supabase: mockSupabase,
      role: 'editor',
      organizerId: 'org-1',
    });

    render(await InvitationsAdminPage());

    expect(getAdminEvents).toHaveBeenCalledWith(mockSupabase, {
      audience: 'external',
      organizerId: null,
    });
  });
});
