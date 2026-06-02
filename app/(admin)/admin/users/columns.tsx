"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserRoleDialog } from "./user-role-dialog"
import { DeleteUserDialog } from "./delete-user-dialog"
import { Badge } from "@/components/ui/badge"
import { InviteUserDialog } from "./invite-user-dialog"

export type Organizer = {
  id: string
  name: string
}

export type User = {
  id: string
  email: string
  role: string
  created_at: string
  email_confirmed_at?: string | null
  organizer_id?: string | null
  organizer_name?: string | null
}

const ROLE_LABELS: Record<string, string> = {
  admin: "admin",
  editor: "editor",
  organizer: "organizace",
  user: "user",
}

export function getUserColumns(organizers: Organizer[]): ColumnDef<User>[] {
  return [
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
        const user = row.original
        const isConfirmed = !!user.email_confirmed_at

        return (
            <div className="flex items-center justify-between gap-3 w-full max-w-[300px] sm:max-w-none">
                <div className="flex flex-col min-w-0">
                    <span className="truncate">{user.email}</span>
                    {!isConfirmed && (
                        <span className="text-xs text-amber-500">Čeká na přijetí pozvánky</span>
                    )}
                </div>
            </div>
        )
    }
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const user = row.original
      const role = user.role
      return (
        <div className="flex items-center gap-2">
          <Badge variant={role === 'admin' ? 'destructive' : role === 'editor' ? 'default' : 'secondary'}>
              {ROLE_LABELS[role] ?? role}
          </Badge>
          {role === 'organizer' && user.organizer_name && (
            <span className="text-xs text-muted-foreground truncate">{user.organizer_name}</span>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: "created_at",
    header: () => <div className="hidden md:block">Vytvořeno</div>,
    cell: ({ row }) => {
        return <div className="hidden md:block">{new Date(row.getValue("created_at")).toLocaleDateString('cs-CZ', { timeZone: 'Europe/Prague' })}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original
      const isConfirmed = !!user.email_confirmed_at

      return (
        <div className="flex items-center justify-end gap-2">
            <InviteUserDialog
                organizers={organizers}
                variant="ghost"
                size="icon"
                iconOnly={true}
                defaultEmail={user.email}
                title={!isConfirmed ? "Znovu pozvat" : "Obnovit heslo"}
                className={`h-8 w-8 ${!isConfirmed ? "text-amber-500 hover:text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/20" : "text-muted-foreground hover:text-primary"}`}
            />

            <div className="sm:hidden">
                <UserRoleDialog
                    userId={user.id}
                    currentRole={user.role}
                    currentOrganizerId={user.organizer_id ?? null}
                    organizers={organizers}
                    email={user.email}
                    trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            <span className="sr-only">Upravit</span>
                        </Button>
                    }
                />
            </div>

            <div className="hidden sm:block">
                <UserRoleDialog
                    userId={user.id}
                    currentRole={user.role}
                    currentOrganizerId={user.organizer_id ?? null}
                    organizers={organizers}
                    email={user.email}
                    trigger={
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:bg-primary/10">
                            Upravit
                        </Button>
                    }
                />
            </div>
            <DeleteUserDialog userId={user.id} email={user.email} />
        </div>
      )
    },
  },
  ]
}
