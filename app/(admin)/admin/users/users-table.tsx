"use client"

import { getUserColumns, type Organizer, type User } from "./columns"
import { DataTable } from "./data-table"

/**
 * Client wrapper that builds the user columns on the client. The column factory
 * is a "use client" export and cannot be invoked from a Server Component.
 */
export function UsersTable({ data, organizers }: { data: User[]; organizers: Organizer[] }) {
  return <DataTable columns={getUserColumns(organizers)} data={data} searchPlaceholder="Hledat podle emailu..." />
}
