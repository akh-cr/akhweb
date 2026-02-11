'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Edit } from "lucide-react"

export function UserRoleDialog({ userId, currentRole, email, trigger }: { userId: string, currentRole: string, email: string, trigger?: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState(currentRole)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.functions.invoke('update-user-role', {
        body: { userId, role }
      })

      if (error) throw error

      toast.success("Role úspěšně aktualizována")
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error("Nepodařilo se aktualizovat roli")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
            <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upravit roli</DialogTitle>
          <DialogDescription>
            Změnit roli pro uživatele {email}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Vyberte roli" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="user">Uživatel</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Administrátor</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave} disabled={loading}>
            {loading ? "Ukládání..." : "Uložit změny"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
