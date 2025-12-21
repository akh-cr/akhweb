"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error("Chyba přihlášení: " + error.message)
    } else {
      toast.success("Přihlášeno")
      router.push("/admin")
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-background">
      <div className="w-full max-w-sm p-8 bg-white dark:bg-card rounded-xl border shadow-sm space-y-6">
        <div className="text-center">
            <h1 className="text-2xl font-bold">Přihlášení do administrace</h1>
            <p className="text-sm text-muted-foreground mt-2">Vstup pouze pro redaktory AKH.</p>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-sm rounded-lg text-left">
                <strong>Registrace:</strong> Je určena pro členy společenství. O přístup požádejte předsedu na <a href="mailto:info@akhcr.cz" className="underline">info@akhcr.cz</a>.
            </div>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
                id="email" 
                type="email" 
                placeholder="admin@akhcr.cz" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Heslo</Label>
            <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Přihlašování..." : "Přihlásit se"}
          </Button>
        </form>
        <div className="text-center text-sm">
            <Link href="/signup" className="text-primary hover:underline">
                Nemáte účet? Zaregistrujte se.
            </Link>
        </div>
      </div>
    </div>
  )
}
