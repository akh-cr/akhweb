import { createClient } from "@/lib/supabase/server"
import { isAdmin, isStaff, isEventManager, type EventManagerRole } from "@/lib/auth/roles"


/**
 * Guard for staff surfaces (content, posts, cities). Allows admins AND editors.
 * NOTE: this is mis-named — it is the "staff" tier, not admin-only. For
 * admin-only surfaces (council, user-role management) use {@link requireAdminRole}.
 */
export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  // Check role
  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!isStaff(role?.role)) {
    throw new Error("Forbidden: Insufficient permissions")
  }

  return { user, supabase }
}


/**
 * Guard for admin-only surfaces (council members, user-role management).
 * Stricter than {@link requireAdmin}: editors and organizers are rejected,
 * only the 'admin' role passes.
 */
export async function requireAdminRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!isAdmin(role?.role)) {
    throw new Error("Forbidden: Insufficient permissions")
  }

  return { user, supabase }
}


/**
 * Guard for managing events. Allows admins, editors and organization users.
 * Returns the acting role plus the organizer the user is scoped to (only set
 * for the 'organizer' role). Row-level security is the real enforcement of
 * scoping; this guard surfaces the role so server actions can pin writes.
 */
export async function requireEventAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const { data: role } = await supabase
    .from('user_roles')
    .select('role, organizer_id')
    .eq('user_id', user.id)
    .single()

  if (!isEventManager(role?.role)) {
    throw new Error("Forbidden: Insufficient permissions")
  }

  return {
    user,
    supabase,
    role: role.role as EventManagerRole,
    organizerId: (role.organizer_id ?? null) as string | null,
  }
}
