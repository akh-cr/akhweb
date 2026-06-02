'use client'

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"

interface InviteUserDialogProps {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    className?: string
    iconOnly?: boolean
    defaultEmail?: string
    title?: string
    organizers?: { id: string; name: string }[]
}

export function InviteUserDialog({
    variant = "default",
    size = "default",
    className,
    iconOnly = false,
    defaultEmail = "",
    title = "Pozvat uživatele",
    organizers = [],
}: InviteUserDialogProps = {}) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState(defaultEmail)
  const [role, setRole] = useState("editor")
  const [organizerId, setOrganizerId] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Reset email to default when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
      setOpen(newOpen)
      if (newOpen && defaultEmail) {
          setEmail(defaultEmail)
      }
      if (!newOpen && !defaultEmail) {
          setEmail("")
      }
  }

  const handleInvite = async () => {
    if (!email) {
        toast.error("Zadejte email")
        return
    }
    if (role === "organizer" && !organizerId) {
        toast.error("Vyberte organizaci")
        return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: { email, role, organizerId: role === "organizer" ? organizerId : null }
      })

      if (error) throw error
      
      // Edge function might return error in body with 200 OK? Usually invoking throws if non-200.
      // But let's check data just in case your function returns { error: ... }
      if (data?.error) throw new Error(data.error)

      toast.success(defaultEmail ? `Pozvánka pro ${email} byla znovu odeslána` : `Uživatel ${email} byl pozván`)
      setOpen(false)
      if (!defaultEmail) setEmail("")
      router.refresh()
      
    } catch (error: any) {
      toast.error(error.message || "Nepodařilo se pozvat uživatele")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className} title={title} suppressHydrationWarning>
          <UserPlus className={iconOnly ? "h-4 w-4" : "mr-2 h-4 w-4"} />
          {!iconOnly && title}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" id="invite-user-dialog-content">
        <DialogHeader>
          <DialogTitle>{defaultEmail ? "Znovu pozvat uživatele" : "Pozvat nového uživatele"}</DialogTitle>
          <DialogDescription>
            {defaultEmail 
                ? "Uživatel obdrží novou pozvánku emailem." 
                : "Uživatel obdrží email s pozvánkou."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid items-center gap-4">
            <Label htmlFor="email" className="">
              Email
            </Label>
            <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="email@example.com"
                disabled={!!defaultEmail}
            />
          </div>
          <div className="grid items-center gap-4">
            <Label htmlFor="role" className="">
              Role
            </Label>
            <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="">
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
            <div className="grid items-center gap-4">
              <Label htmlFor="organizer">Organizace</Label>
              <Select value={organizerId} onValueChange={setOrganizerId}>
                  <SelectTrigger>
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
          <Button type="submit" onClick={handleInvite} disabled={loading}>
            {loading ? "Odesílání..." : "Odeslat pozvánku"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
