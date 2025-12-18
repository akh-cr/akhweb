"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function AdminAccessDenied({ email }: { email: string | undefined }) {
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 flex-col gap-6 p-4 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-destructive">Přístup odepřen</h1>
        <p className="text-muted-foreground">
          Uživatel <strong>{email}</strong> nemá oprávnění pro vstup do administrace.
        </p>
        <p className="text-sm text-muted-foreground">
            Váš účet musí být schválen administrátorem a musí mu být přidělena role <strong>admin</strong> nebo <strong>editor</strong>.
        </p>
        <div className="pt-4">
            <Button onClick={handleLogout} variant="outline">
                Odhlásit se
            </Button>
        </div>
      </div>
    </div>
  )
}
