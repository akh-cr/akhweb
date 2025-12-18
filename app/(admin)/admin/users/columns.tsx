"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserRoleDialog } from "./user-role-dialog"
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
    header: "Vytvořeno",
    cell: ({ row }) => {
        return new Date(row.getValue("created_at")).toLocaleDateString('cs-CZ')
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original
 
      return (
        <UserRoleDialog 
            userId={user.id} 
            currentRole={user.role} 
            email={user.email} 
        />
      )
    },
  },
]
