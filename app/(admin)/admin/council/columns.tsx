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
    cell: ({ row }) => {
        const member = row.original
        return (
            <div className="flex items-center justify-between gap-3 w-full max-w-[200px] sm:max-w-none">
                <div className="flex items-center gap-3 min-w-0">

                    <span className="truncate font-medium">{member.name}</span>
                </div>
            </div>
        )
    }
  },
  {
    accessorKey: "role",
    header: ({ column }) => <div className="hidden md:block">Role</div>,
    cell: ({ row }) => <div className="hidden md:block">{row.getValue("role")}</div>,
  },
  {
    accessorKey: "priority",
    header: ({ column }) => {
        return (
          <div className="hidden md:block">
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Priorita
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
    cell: ({ row }) => <div className="hidden md:block">{row.getValue("priority")}</div>,
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
        <div className="flex items-center gap-0 sm:gap-2">
            <div className="sm:hidden">
                <CouncilMemberDialog 
                    member={member}
                    trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            <span className="sr-only">Upravit</span>
                        </Button>
                    } 
                />
            </div>

            <div className="hidden sm:block">
                <CouncilMemberDialog 
                    member={member}
                    trigger={
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:bg-primary/10">
                            Upravit
                        </Button>
                    } 
                />
            </div>
            <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive hover:text-destructive">
                <Trash className="h-4 w-4" />
            </Button>
        </div>
      )
    },
  },
]
