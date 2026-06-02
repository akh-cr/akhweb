import { Calendar, Users, FileText, MapPin, Newspaper, Mail, type LucideIcon } from "lucide-react"
import type { EventManagerRole } from "@/lib/auth/roles"

/** Roles that can sign into the admin area (alias of the event-manager set). */
export type AdminRole = EventManagerRole

export interface AdminNavItem {
  title: string
  url: string
  icon: LucideIcon
  roles: AdminRole[]
}

// Single source of truth for the admin sidebar. `roles` controls visibility:
// organizers are intentionally limited to their own external invitations,
// and user management stays admin-only.
const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { title: "Aktuality", url: "/admin/posts", icon: Newspaper, roles: ['admin', 'editor'] },
  { title: "Akce", url: "/admin/events", icon: Calendar, roles: ['admin', 'editor'] },
  { title: "Pozvánky od jiných", url: "/admin/pozvanky", icon: Mail, roles: ['admin', 'editor', 'organizer'] },
  { title: "Společenství", url: "/admin/cities", icon: MapPin, roles: ['admin', 'editor'] },
  { title: "Obsah webu", url: "/admin/content", icon: FileText, roles: ['admin', 'editor'] },
  { title: "Rada AKH", url: "/admin/council", icon: Users, roles: ['admin', 'editor'] },
  { title: "Uživatelé", url: "/admin/users", icon: Users, roles: ['admin'] },
]

export function getAdminNavItems(role: AdminRole): AdminNavItem[] {
  return ADMIN_NAV_ITEMS.filter((item) => item.roles.includes(role))
}
