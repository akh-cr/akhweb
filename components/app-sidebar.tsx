"use client"

import { Calendar, LogOut, Users, FileText, MapPin } from "lucide-react"
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
    title: "Akce",
    url: "/admin/events",
    icon: Calendar,
  },
  ...(FEATURES.BLOGS_ENABLED ? [{
    title: "Blog",
    url: "/admin/blog",
    icon: FileText,
  }] : []),
  {
    title: "Společenství",
    url: "/admin/cities",
    icon: MapPin,
  },
  {
    title: "Uživatelé",
    url: "/admin/users",
    icon: Users,
  },
]

export function AppSidebar() {
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
                 <img src="/logo.svg" alt="AKH Logo" className="h-4 w-auto object-contain dark:hidden" />
                 <img src="/logo-white.svg" alt="AKH Logo" className="h-4 w-auto object-contain hidden dark:block" />
                 <span className="font-bold text-lg">Admin</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
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
        <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Odhlásit se
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
