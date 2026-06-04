// Single source of truth for application roles and authorization predicates.
//
// Authorization is enforced in three layers (defense in depth):
//   1. Postgres RLS policies on the data (the real gate),
//   2. these guards in Next server actions/components,
//   3. the Supabase edge functions.
// The Deno edge runtime cannot import this module, so it keeps a deliberate
// mirror in `supabase/functions/_shared/roles.ts` — keep the two in sync.

export type AppRole = 'admin' | 'editor' | 'organizer' | 'user'

/** Roles allowed to create/edit events and upload images, i.e. the admin area. */
export type EventManagerRole = 'admin' | 'editor' | 'organizer'

/** May manage the council and assign user roles, i.e. admin-only surfaces. */
export const ADMIN_ROLES = ['admin'] as const

/** Full content access (everything except organization-scoped users). */
export const STAFF_ROLES = ['admin', 'editor'] as const

/** May manage events (and upload images for them) and enter the admin area. */
export const EVENT_MANAGER_ROLES = ['admin', 'editor', 'organizer'] as const

/** Roles an admin may assign when inviting or updating a user. */
export const ASSIGNABLE_ROLES = ['admin', 'editor', 'organizer', 'user'] as const

export function isAdmin(role?: string | null): boolean {
  return !!role && (ADMIN_ROLES as readonly string[]).includes(role)
}

export function isStaff(role?: string | null): boolean {
  return !!role && (STAFF_ROLES as readonly string[]).includes(role)
}

export function isEventManager(role?: string | null): role is EventManagerRole {
  return !!role && (EVENT_MANAGER_ROLES as readonly string[]).includes(role)
}
