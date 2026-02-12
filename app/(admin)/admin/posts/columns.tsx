"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, EyeOff, Calendar, Newspaper, Users, Shield } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deletePost, Post, togglePostVisibility } from "./actions"
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
import { useState, useEffect } from "react"

export const columns: ColumnDef<Post>[] = [
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
        const post = row.original
        const isEvent = post.type === 'event'
        const isCommunity = post.type === 'community'


        return (
            <div className="flex items-center justify-between gap-3 w-full max-w-[300px] sm:max-w-none">
                <div className="flex items-center gap-3 min-w-0">

                    {!isEvent && !isCommunity && (
                        <Switch 
                            checked={!!post.is_hidden}
                            onCheckedChange={async (checked) => {
                                try {
                                    await togglePostVisibility(post.id, checked)
                                    toast.success(checked ? "Článek skryt" : "Článek zobrazen")
                                } catch (error) {
                                    toast.error("Nepodařilo se změnit viditelnost")
                                }
                            }}
                            className="data-[state=checked]:bg-muted-foreground scale-75 shrink-0"
                            aria-label="Skrýt článek"
                        />
                    )}
                    {isEvent && (
                        <Badge variant="outline" className="gap-1 font-normal text-muted-foreground shrink-0">
                            <Calendar className="h-3 w-3" /> Akce
                        </Badge>
                    )}
                    {isCommunity && (
                        <Badge variant="outline" className="gap-1 font-normal text-muted-foreground shrink-0">
                            <Users className="h-3 w-3" /> Společenství
                        </Badge>
                    )}
                    <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                        <span className={post.is_hidden ? "text-muted-foreground truncate opacity-60" : "truncate"}>
                            {post.title}
                        </span>
                        {post.is_hidden && (
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
    accessorKey: "published_at",
    header: ({ column }) => <div className="hidden md:block">Publikováno</div>,
    cell: ({ row }) => {
        const dateStr = row.getValue("published_at") as string | null
        if (!dateStr) return <span className="hidden md:block text-muted-foreground italic">Koncept</span>
        const date = new Date(dateStr)
        return <div className="hidden md:block">{date.toLocaleDateString('cs-CZ')}</div>
    }
  },
  {
    accessorKey: "slug",
    header: ({ column }) => <div className="hidden md:block">Slug</div>,
    cell: ({ row }) => {
        return <div className="hidden md:block text-muted-foreground text-sm">{row.getValue("slug")}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const post = row.original
      return <ActionCell post={post} />
    },
  },
]

function ActionCell({ post }: { post: Post }) {
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
                            Tato akce je nevratná. Příspěvek "{post.title}" bude navždy odstraněn.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Zrušit</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={async () => {
                                try {
                                    await deletePost(post.id)
                                    toast.success("Příspěvek byl smazán")
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
                <Link href={
                    post.type === 'event' ? `/admin/events/${post.id}` : 
                    post.type === 'community' ? `/admin/cities/${post.id}` :
                    `/admin/posts/${post.id}`
                } className="sm:hidden">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        <span className="sr-only">Upravit</span>
                    </Button>
                </Link>

                <Link href={
                    post.type === 'event' ? `/admin/events/${post.id}` : 
                    post.type === 'community' ? `/admin/cities/${post.id}` :
                    `/admin/posts/${post.id}`
                } className="hidden sm:block">
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
                            onClick={() => navigator.clipboard.writeText(post.id)}
                        >
                            Kopírovat ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <Link href={`/blog/${post.slug || '#'}`} target="_blank">
                            <DropdownMenuItem>Zobrazit na webu</DropdownMenuItem>
                        </Link>
                        {post.type !== 'event' && post.type !== 'community' && (
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setOpen(true)
                                }}
                            >
                                Smazat
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </>
    )
}
