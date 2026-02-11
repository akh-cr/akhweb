'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

function InviteVerificationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>({})

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout

    const handleInvite = async () => {
      const supabase = createClient()
      
      if (!mounted) return

      // Log initial state
      console.log('Invite Verification Started')
      console.log('URL:', window.location.href)
      console.log('Hash:', window.location.hash)
      setDebugInfo((prev: any) => ({ ...prev, url: window.location.href, hash: window.location.hash }))

      // 1. Check Session immediately
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      console.log('Initial Session Check:', session ? 'Found' : 'Null', sessionError)
      setDebugInfo((prev: any) => ({ ...prev, initialSession: session ? 'Found' : 'Null', sessionError }))

      if (session) {
        console.log('Relace nalezena (počáteční), přesměrovávám...')
        router.push('/auth/update-password')
        return
      }

      // 2. Manual Hash Parsing (Fallback for Implicit Flow)
      // Sometimes the client doesn't pick up the hash automatically if configured for PKCE
      const hash = window.location.hash
      if (hash && hash.includes('access_token')) {
        console.log('Detekován hash, pokouším se o manuální nastavení relace...')
        try {
          const params = new URLSearchParams(hash.substring(1)) // remove #
          const access_token = params.get('access_token')
          const refresh_token = params.get('refresh_token')

          if (access_token && refresh_token) {
            const { data, error: setSessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            })

            if (!setSessionError && data.session) {
               console.log('Manuální nastavení relace úspěšné, přesměrovávám...')
               router.push('/auth/update-password')
               return
            } else {
               console.error('Manuální nastavení relace selhalo:', setSessionError)
               setDebugInfo((prev: any) => ({ ...prev, manualSetError: setSessionError }))
            }
          }
        } catch (e) {
          console.error('Chyba při parsování hashe:', e)
        }
      }

      if (sessionError) {
        if (mounted) setError(sessionError.message)
        return
      }

      // 3. Listen for Auth State Changes (Supabase processing hash as backup)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth Event:', event, session?.user?.email)
        setDebugInfo((prev: any) => ({ ...prev, lastAuthEvent: event, user: session?.user?.email }))
        
        if (event === 'SIGNED_IN' || session) {
          console.log('Signed in via event, redirecting...')
          router.push('/auth/update-password')
        }
      })

      // 3. Set a Timeout
      timeoutId = setTimeout(() => {
        if (mounted) {
           console.warn('Verification timed out')
           setError('Časový limit vypršel. Nebylo možné ověřit vaši relaci. Zkuste prosím kliknout na odkaz znovu.')
           setDebugInfo((prev: any) => ({ ...prev, status: 'Timed Out' }))
        }
      }, 5000) // 5 seconds timeout

      return () => {
        subscription.unsubscribe()
        clearTimeout(timeoutId)
      }
    }

    handleInvite()

    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [router])

  return (
    <div className="flex flex-col h-screen w-full items-center justify-center px-4 gap-8">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Ověřování pozvánky</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {error ? (
            <div className="text-destructive text-center">
              <p>Chyba ověření:</p>
              <p className="font-semibold">{error}</p>
              <Button 
                onClick={() => router.push('/login')}
                className="mt-4"
                variant="outline"
              >
                Zpět na přihlášení
              </Button>
            </div>
          ) : (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Prosím čekejte, zpracováváme vaši pozvánku...
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Debug Info */}
      <div className="max-w-xl w-full p-4 bg-slate-100 rounded-md text-xs font-mono overflow-auto border border-slate-200">
        <p className="font-bold mb-2">Debug Info:</p>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>
    </div>
  )
}

export default function InviteVerificationPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <InviteVerificationContent />
    </Suspense>
  )
}
