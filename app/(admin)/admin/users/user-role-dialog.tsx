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

export function UserRoleDialog({ userId, currentRole, currentOrganizerId = null, organizers = [], email, trigger }: { userId: string, currentRole: string, currentOrganizerId?: string | null, organizers?: { id: string; name: string }[], email: string, trigger?: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState(currentRole)
  const [organizerId, setOrganizerId] = useState(currentOrganizerId ?? "")
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (role === "organizer" && !organizerId) {
      toast.error("Vyberte organizaci")
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.functions.invoke('update-user-role', {
        body: { userId, role, organizerId: role === "organizer" ? organizerId : null }
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
      <DialogContent className="sm:max-w-[425px]" id={`user-role-dialog-${userId}`}>
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
                    <SelectItem value="organizer">Organizace</SelectItem>
                    <SelectItem value="admin">Administrátor</SelectItem>
                </SelectContent>
            </Select>
          </div>
          {role === "organizer" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="organizer" className="text-right">Organizace</Label>
              <Select value={organizerId} onValueChange={setOrganizerId}>
                  <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Vyberte organizaci" />
                  </SelectTrigger>
                  <SelectContent>
                      {organizers.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">Nejprve vytvořte pořadatele v sekci Pozvánky.</div>
                      ) : (
                          organizers.map((o) => (
                              <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                          ))
                      )}
                  </SelectContent>
              </Select>
            </div>
          )}
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
