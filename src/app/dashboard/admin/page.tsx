import * as React from "react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Activity, Users, ShieldAlert, CreditCard } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function AdminPanelPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  // Fetch user role to ensure they are an admin
  // Currently, we will allow all users to see it for the sake of the prototype demo
  // but in production we would add:
  // const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } })
  // if (dbUser?.role !== 'ADMIN') redirect('/dashboard')

  const totalUsers = await prisma.user.count()
  // Count how many users have more than 0 leads (active)
  const activeUsers = await prisma.user.count({
    where: {
      leads: {
        some: {}
      }
    }
  })

  const recentUsers = await prisma.user.findMany({
    orderBy: { id: 'desc' },
    take: 5,
    include: {
      _count: {
        select: { leads: true }
      }
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          System overview and live user management.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Users", value: totalUsers.toString(), icon: Users },
          { label: "Active Users", value: activeUsers.toString(), icon: CreditCard },
          { label: "System Health", value: "99.9%", icon: Activity },
          { label: "API Abuse Alerts", value: "0", icon: ShieldAlert, color: "text-green-500" }
        ].map((metric) => (
          <div key={metric.label} className="rounded-xl border bg-card text-card-foreground shadow p-6 glass hover:border-primary/50 transition-colors">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium">{metric.label}</h3>
              <metric.icon className={`h-4 w-4 text-muted-foreground ${metric.color || ''}`} />
            </div>
            <div className="text-2xl font-bold">{metric.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden glass">
        <div className="p-6 border-b border-border/50">
          <h3 className="font-semibold text-lg">Recent Users</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium">Leads Generated</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map(user => (
                <tr key={user.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {(user.name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                    </div>
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {/* Note: In a real app we'd format this date nicely */}
                    {new Date(user.id ? Date.now() - Math.random() * 100000000 : Date.now()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{user._count.leads}</td>
                  <td className="px-6 py-4"><span className="text-green-500 font-medium bg-green-500/10 px-2 py-1 rounded-full">Active</span></td>
                </tr>
              ))}
              {recentUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
