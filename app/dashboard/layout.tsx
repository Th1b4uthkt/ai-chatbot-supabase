"use client"

import { AdminSidebar } from "@/components/admin-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr]">
      <AdminSidebar />
      <main className="p-6">{children}</main>
    </div>
  )
}
