"use client"

import { BarChart3, LayoutDashboard, Settings, Users, CalendarDays, BookOpen, Handshake } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"


import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Events",
    href: "/dashboard/events",
    icon: CalendarDays,
  },
  {
    title: "Guides",
    href: "/dashboard/guides",
    icon: BookOpen,
  },
  {
    title: "Partners",
    href: "/dashboard/partners",
    icon: Handshake,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  }
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex size-full flex-col bg-muted/40">
      <div className="flex h-14 items-center border-b px-2">
        <Link href="/dashboard" className="flex items-center gap-1">
          <span className="font-semibold">Admin</span>
        </Link>
      </div>
      <nav className="grid gap-1 px-2 pt-2">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted",
                isActive ? "bg-muted text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="size-4" />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
