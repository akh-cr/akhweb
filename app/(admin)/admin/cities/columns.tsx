"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, EyeOff } from "lucide-react"
import { Switch } from "@/components/ui/switch"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteCity, toggleCityVisibility } from "./actions"
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
  is_hidden: boolean
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
    cell: ({ row }) => {
        const city = row.original
        return (
            <div className="flex items-center justify-between gap-3 w-full max-w-[300px] sm:max-w-none">
                <div className="flex items-center gap-3 min-w-0">
                    <Switch 
                        checked={!!city.is_hidden}
                        onCheckedChange={async (checked) => {
                            try {
                                await toggleCityVisibility(city.id, checked)
                                toast.success(checked ? "Město skryto" : "Město zobrazeno")
                            } catch (error) {
                                toast.error("Nepodařilo se změnit viditelnost")
                            }
                        }}
                        className="data-[state=checked]:bg-muted-foreground scale-75 shrink-0"
                        aria-label="Skrýt město"
                    />
                    <span className={city.is_hidden ? "text-muted-foreground truncate" : "truncate"}>{city.name}</span>
                </div>

            </div>
        )
    }
  },
  {
    accessorKey: "slug",
    header: ({ column }) => <div className="hidden md:block">Slug</div>,
    cell: ({ row }) => <div className="hidden md:block">{row.getValue("slug")}</div>,
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
            <div className="flex items-center gap-0 sm:gap-2">
                <Link href={`/admin/cities/${city.id}`} className="sm:hidden">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        <span className="sr-only">Upravit</span>
                    </Button>
                </Link>
                <Link href={`/admin/cities/${city.id}`} className="hidden sm:block">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:bg-primary/10">
                        Upravit
                    </Button>
                </Link>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Otevřít menu</span>
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
