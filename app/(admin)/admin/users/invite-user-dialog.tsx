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

export function InviteUserDialog() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("editor")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleInvite = async () => {
    if (!email) {
        toast.error("Zadejte email")
        return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: { email, role }
      })

      if (error) throw error
      
      // Edge function might return error in body with 200 OK? Usually invoking throws if non-200.
      // But let's check data just in case your function returns { error: ... }
      if (data?.error) throw new Error(data.error)

      toast.success(`Uživatel ${email} byl pozván`)
      setOpen(false)
      setEmail("")
      router.refresh()
      
    } catch (error: any) {
      toast.error(error.message || "Nepodařilo se pozvat uživatele")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Pozvat uživatele
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" id="invite-user-dialog-content">
        <DialogHeader>
          <DialogTitle>Pozvat nového uživatele</DialogTitle>
          <DialogDescription>
            Uživatel obdrží email s pozvánkou.
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
                    <SelectItem value="admin">Administrátor</SelectItem>
                </SelectContent>
            </Select>
          </div>
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
