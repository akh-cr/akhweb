"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteEvent } from "./actions"
import { toast } from "sonner"

// This type definition matches your Supabase table
export type Event = {
  id: string
  title: string
  start_time: string
  city_id: string | null
  slug: string
  created_at: string
}

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Název
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "city_id",
    header: "Město",
    cell: ({ row }) => {
        const city = row.getValue("city_id") as string
        return <div className="uppercase font-medium text-xs text-muted-foreground">{city || "Celostátní"}</div>
    }
  },
  {
    accessorKey: "start_time",
    header: "Datum",
    cell: ({ row }) => {
        const date = new Date(row.getValue("start_time"))
        return <div>{date.toLocaleDateString('cs-CZ')}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const event = row.original
      return <ActionCell event={event} />
    },
  },
]

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

function ActionCell({ event }: { event: Event }) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Opravdu smazat?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tato akce je nevratná. Akce "{event.title}" bude navždy odstraněna.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Zrušit</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={async () => {
                                try {
                                    await deleteEvent(event.id)
                                    toast.success("Akce byla smazána")
                                } catch (error) {
                                    console.error(error)
                                    toast.error((error as Error).message)
                                }
                            }}
                        >
                            Smazat
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Akce</DropdownMenuLabel>
                    <DropdownMenuItem
                        onClick={() => navigator.clipboard.writeText(event.id)}
                    >
                        Kopírovat ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <Link href={`/admin/events/${event.id}`}>
                        <DropdownMenuItem>Upravit</DropdownMenuItem>
                    </Link>
                    <Link href={`/akce/${event.slug || '#'}`} target="_blank">
                        <DropdownMenuItem>Zobrazit na webu</DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => {
                            e.preventDefault()
                            setOpen(true)
                        }}
                    >
                        Smazat
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
