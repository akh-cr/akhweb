import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { AdminAccessDenied } from "@/components/admin-access-denied"
import { isEventManager } from "@/lib/auth/roles"

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const role = roleData?.role
  if (!isEventManager(role)) {
     return <AdminAccessDenied email={user.email} />
  }

  // Organization users are confined to their own invitations section.
  if (role === 'organizer') {
    const pathname = (await headers()).get('x-pathname') || ''
    if (!pathname.startsWith('/admin/pozvanky')) {
      redirect('/admin/pozvanky')
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} role={role} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1 md:hidden" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 min-w-0 overflow-x-hidden">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
