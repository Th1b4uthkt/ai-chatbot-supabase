import { Activity, CreditCard, DollarSign, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-4 shadow-sm">
          <h2 className="text-lg font-medium">Total Users</h2>
          <p className="mt-2 text-3xl font-bold">1,247</p>
        </div>
        <div className="rounded-lg border p-4 shadow-sm">
          <h2 className="text-lg font-medium">Active Sessions</h2>
          <p className="mt-2 text-3xl font-bold">89</p>
        </div>
        <div className="rounded-lg border p-4 shadow-sm">
          <h2 className="text-lg font-medium">Revenue</h2>
          <p className="mt-2 text-3xl font-bold">$12,350</p>
        </div>
      </div>
    </div>
  )
}

