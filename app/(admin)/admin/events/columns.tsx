"use client"

import Link from "next/link"
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
import { deleteEvent } from "./actions"
import { toggleEventVisibility } from "./actions"
import { toast } from "sonner"

// This type definition matches your Supabase table
export type Event = {
  id: string
  title: string
  start_time: string
  city_id: string | null
  location: string | null
  slug: string
  created_at: string
  is_hidden: boolean
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
    cell: ({ row }) => {
        const event = row.original
        return (
            <div className="flex items-center justify-between gap-3 w-full max-w-[300px] sm:max-w-none">
                <div className="flex items-center gap-3 min-w-0">
                    <Switch 
                        checked={!!event.is_hidden}
                        onCheckedChange={async (checked) => {
                            try {
                                await toggleEventVisibility(event.id, checked)
                                toast.success(checked ? "Akce skryta" : "Akce zobrazena")
                            } catch (error) {
                                toast.error("Nepodařilo se změnit viditelnost")
                            }
                        }}
                        className="data-[state=checked]:bg-muted-foreground scale-75 shrink-0"
                        aria-label="Skrýt akci"
                    />
                    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                         <span className={event.is_hidden ? "text-muted-foreground truncate opacity-60" : "truncate"}>{event.title}</span>
                         {event.is_hidden && (
                             <div className="flex items-center gap-1 rounded bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:text-amber-200 shrink-0">
                                 <EyeOff className="h-3 w-3" />
                                 <span className="hidden xs:inline">Skryto</span>
                             </div>
                         )}
                    </div>
                </div>

            </div>
        )
    }
  },
  {
    accessorKey: "location",
    header: ({ column }) => <div className="hidden md:block">Místo</div>,
    cell: ({ row }) => {
        const location = row.getValue("location") as string
        return <div className="hidden md:block font-medium text-sm text-muted-foreground">{location || "-"}</div>
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
import { useState, useEffect } from "react"

function ActionCell({ event }: { event: Event }) {
    const [open, setOpen] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return <div className="h-8 w-8" />
    }

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
            <div className="flex items-center gap-0 sm:gap-2">
                <Link href={`/admin/events/${event.id}`} className="sm:hidden">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        <span className="sr-only">Upravit</span>
                    </Button>
                </Link>
                <Link href={`/admin/events/${event.id}`} className="hidden sm:block">
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
                            onClick={() => navigator.clipboard.writeText(event.id)}
                        >
                            Kopírovat ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
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
            </div>
        </>
    )
}
