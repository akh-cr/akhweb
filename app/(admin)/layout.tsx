import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminAccessDenied } from "@/components/admin-access-denied"

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: roleData, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!roleData || !['admin', 'editor'].includes(roleData.role)) {
     return <AdminAccessDenied email={user.email} />
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1 md:hidden" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
