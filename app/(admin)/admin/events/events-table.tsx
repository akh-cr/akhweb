"use client"

import { getEventColumns, type Event } from "./columns"
import { DataTable } from "./data-table"

/**
 * Client wrapper that builds the event columns on the client. The column
 * factory lives in a "use client" module, so it must be invoked here rather
 * than in a Server Component (calling a client export from the server throws).
 */
export function EventsTable({
  data,
  basePath,
  showOrganizer,
}: {
  data: Event[]
  basePath: string
  showOrganizer: boolean
}) {
  return <DataTable columns={getEventColumns({ basePath, showOrganizer })} data={data} />
}
