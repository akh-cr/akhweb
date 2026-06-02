/**
 * Whether an event card/header should render an organizer badge.
 * AKH events (no organizer) carry no badge; only external invitations are marked.
 */
export function shouldShowOrganizerBadge(event: { organizer_id?: string | null }): boolean {
  return !!event.organizer_id
}
