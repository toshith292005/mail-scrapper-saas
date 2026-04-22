import * as React from "react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { LeadsClient } from "@/components/leads/leads-client"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  // Fetch actual leads for the user
  const leads = await prisma.lead.findMany({
    where: {
      userId: session.user.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Leads</h1>
          <p className="text-muted-foreground">
            Manage and export your discovered leads.
          </p>
        </div>
      </div>
      
      <LeadsClient leads={leads} />
    </div>
  )
}
