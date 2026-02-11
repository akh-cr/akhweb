"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CouncilMemberDialog } from "./council-member-dialog"
import { deleteCouncilMember } from "./actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export type CouncilMember = {
  id: string
  name: string
  role: string
  bio: string | null
  image_url: string | null
  priority: number
  active: boolean
  created_at: string
}

export const columns: ColumnDef<CouncilMember>[] = [
  {
      id: "avatar",
      cell: ({ row }) => {
          const member = row.original
          return (
              <Avatar>
                  <AvatarImage src={member.image_url || ""} className="object-cover" />
                  <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
          )
      }
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Jméno
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "priority",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Priorita
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
  },
  {
    accessorKey: "active",
    header: "Stav",
    cell: ({ row }) => {
      const isActive = row.getValue("active") as boolean
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? "Aktivní" : "Neaktivní"}
        </Badge>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const member = row.original

      const handleDelete = async () => {
          if (confirm("Opravdu chcete smazat tohoto člena?")) {
              try {
                  await deleteCouncilMember(member.id)
                  toast.success("Člen smazán")
              } catch (e) {
                  toast.error("Chyba při mazání")
              }
          }
      }
 
      return (
        <div className="flex items-center gap-2">
            <CouncilMemberDialog member={member} />
            <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:text-destructive">
                <Trash className="h-4 w-4" />
            </Button>
        </div>
      )
    },
  },
]
