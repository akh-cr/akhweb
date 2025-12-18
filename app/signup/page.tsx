"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error("Chyba registrace: " + error.message)
    } else {
      toast.success("Registrace úspěšná! Zkontrolujte svůj email.")
      router.push("/login")
    }
    setLoading(false)
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 bg-white rounded-xl border shadow-sm space-y-6">
        <div className="text-center">
            <h1 className="text-2xl font-bold">Registrace</h1>
            <p className="text-sm text-muted-foreground mt-2">Vytvořte si účet pro správu obsahu.</p>
        </div>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
                id="email" 
                type="email" 
                placeholder="jan.novak@example.com" 
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
                minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registrace..." : "Zaregistrovat se"}
          </Button>
        </form>
        <div className="text-center text-sm">
            <Link href="/login" className="text-primary hover:underline">
                Již máte účet? Přihlaste se.
            </Link>
        </div>
      </div>
    </div>
  )
}
