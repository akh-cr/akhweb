export type EventManagerRole = 'admin' | 'editor' | 'organizer'

/**
 * Resolves the organizer_id that may actually be written for an event, given the
 * acting user's role. Organizers are hard-pinned to their own organization so they
 * can never create or move an event to AKH (null) or to another organization.
 * Admins and editors keep full control, so their requested value passes through.
 */
export function scopeOrganizerId(
  role: EventManagerRole,
  organizerId: string | null,
  requestedOrganizerId: string | null | undefined,
): string | null {
  if (role === 'organizer') {
    return organizerId
  }
  return requestedOrganizerId ?? null
}
