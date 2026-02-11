"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserRoleDialog } from "./user-role-dialog"
import { DeleteUserDialog } from "./delete-user-dialog"
import { Badge } from "@/components/ui/badge"

export type User = {
  id: string
  email: string
  role: string
  created_at: string
}

export const columns: ColumnDef<User>[] = [
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
        return (
            <div className="flex items-center justify-between gap-3 w-full max-w-[300px] sm:max-w-none">
                <div className="flex items-center gap-3 min-w-0">

                    <span className="truncate">{user.email}</span>
                </div>
            </div>
        )
    }
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      return (
        <Badge variant={role === 'admin' ? 'destructive' : role === 'editor' ? 'default' : 'secondary'}>
            {role}
        </Badge>
      )
    }
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <div className="hidden md:block">Vytvořeno</div>,
    cell: ({ row }) => {
        return <div className="hidden md:block">{new Date(row.getValue("created_at")).toLocaleDateString('cs-CZ')}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original
 
      return (
        <div className="flex items-center gap-0 sm:gap-2">
            <div className="sm:hidden">
                <UserRoleDialog 
                    userId={user.id} 
                    currentRole={user.role} 
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
