import * as React from "react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { DashboardClient } from "@/components/dashboard/dashboard-client"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  // Fetch all leads for the user to calculate metrics
  const leads = await prisma.lead.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  })

  const totalLeads = leads.length
  const emailsVerified = leads.filter(l => l.score && l.score >= 0.8).length
  const domainsScanned = Array.from(new Set(leads.map(l => l.company).filter(Boolean))).length
  const emailsSent = 0 // Placeholder until email sending is implemented

  // Calculate chart data for last 7 days
  const chartData = []
  const today = new Date()
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    
    const nextDay = new Date(d)
    nextDay.setDate(nextDay.getDate() + 1)
    
    const dayLeads = leads.filter(l => l.createdAt >= d && l.createdAt < nextDay).length
    chartData.push({
      name: daysOfWeek[d.getDay()],
      leads: dayLeads
    })
  }

  const recentLeads = leads.slice(0, 3)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back to Email Scrapper.io. Here's an overview of your lead generation.
        </p>
      </div>

      <DashboardClient 
        metrics={{ totalLeads, emailsVerified, domainsScanned, emailsSent }}
        chartData={chartData}
        recentLeads={recentLeads}
      />
    </div>
  )
}
