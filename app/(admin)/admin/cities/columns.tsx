"use client"

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
import { deleteCity } from "./actions"
import { toast } from "sonner"
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
import Link from "next/link"

export type City = {
  id: string
  name: string
  slug: string
}

export const columns: ColumnDef<City>[] = [
  {
    accessorKey: "name",
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
    accessorKey: "slug",
    header: "Slug",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const city = row.original
      return <ActionCell city={city} />
    },
  },
]

function ActionCell({ city }: { city: City }) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Opravdu smazat?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tato akce je nevratná. Město "{city.name}" bude smazáno.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Zrušit</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={async () => {
                                try {
                                    await deleteCity(city.id)
                                    toast.success("Město bylo smazáno")
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
            <div className="flex items-center gap-2">
                <Link href={`/admin/cities/${city.id}`}>
                    <Button variant="outline" size="sm">Upravit</Button>
                </Link>
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
                        onClick={() => navigator.clipboard.writeText(city.id)}
                    >
                        Kopírovat ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <Link href={`/admin/cities/${city.id}`}>
                        <DropdownMenuItem>Upravit</DropdownMenuItem>
                    </Link>
                    <Link href={`/spolecenstvi/${city.slug}`} target="_blank">
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
            </div>
        </>
    )
}
