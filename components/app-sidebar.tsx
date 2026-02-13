"use client"

import { Calendar, LogOut, Users, FileText, MapPin, Newspaper } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import { toast } from "sonner"

import { FEATURES } from "@/lib/features"

// Menu items.
const items = [
  {
    title: "Aktuality",
    url: "/admin/posts",
    icon: Newspaper,
  },
  {
    title: "Akce",
    url: "/admin/events",
    icon: Calendar,
  },
  {
    title: "Společenství",
    url: "/admin/cities",
    icon: MapPin,
  },

  {
    title: "Obsah webu",
    url: "/admin/content",
    icon: FileText,
  },
  {
    title: "Rada AKH",
    url: "/admin/council",
    icon: Users,
  },
  {
    title: "Uživatelé",
    url: "/admin/users",
    icon: Users,
  },
]

export function AppSidebar({ user }: { user?: { email?: string } | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success("Odhlášeno")
    router.push("/login")
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="mb-4 mt-2 h-auto py-2">
            <div className="flex items-center gap-2 px-1">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src="/logo.svg" alt="AKH Logo" className="h-4 w-auto object-contain dark:hidden" />
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src="/logo-white.svg" alt="AKH Logo" className="h-4 w-auto object-contain hidden dark:block" />
                 <span className="font-bold text-lg">Admin</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(item.url)}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        {user?.email && (
            <div className="mb-4 flex items-center gap-2 px-1 text-sm text-muted-foreground overflow-hidden">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="h-3 w-3 text-primary" />
                </div>
                <span className="truncate" title={user.email}>{user.email}</span>
            </div>
        )}
        <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Odhlásit se
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
