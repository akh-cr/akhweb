'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

export function DeleteUserDialog({ userId, email }: { userId: string, email: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId }
      })

      if (error) throw error

      toast.success(`Uživatel ${email} byl smazán`)
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("Nepodařilo se smazat uživatele")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent id={`delete-user-dialog-${userId}`}>
        <AlertDialogHeader>
          <AlertDialogTitle>Opravdu smazat uživatele?</AlertDialogTitle>
          <AlertDialogDescription>
            Tato akce je nevratná. Uživatel <strong>{email}</strong> bude trvale odstraněn ze systému.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Zrušit</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
                e.preventDefault()
                handleDelete()
            }} 
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Mazání..." : "Smazat"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
