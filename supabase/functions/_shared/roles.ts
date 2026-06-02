// Mirror of lib/auth/roles.ts for the Deno edge runtime, which cannot import
// from the Next app. Keep these values in sync with lib/auth/roles.ts.

export const STAFF_ROLES = ['admin', 'editor'] as const
export const EVENT_MANAGER_ROLES = ['admin', 'editor', 'organizer'] as const
export const ASSIGNABLE_ROLES = ['admin', 'editor', 'organizer', 'user'] as const

/** May manage events and upload/delete their images. */
export function isEventManager(role?: string | null): boolean {
  return !!role && (EVENT_MANAGER_ROLES as readonly string[]).includes(role)
}

/** A role an admin may assign when inviting or updating a user. */
export function isAssignableRole(role?: string | null): boolean {
  return !!role && (ASSIGNABLE_ROLES as readonly string[]).includes(role)
}
