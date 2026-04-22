"use client"

import * as React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardClientProps {
  metrics: {
    totalLeads: number;
    emailsVerified: number;
    domainsScanned: number;
    emailsSent: number;
  };
  chartData: { name: string, leads: number }[];
  recentLeads: any[];
}

export function DashboardClient({ metrics, chartData, recentLeads }: DashboardClientProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Leads", value: metrics.totalLeads.toString(), percent: "All time" },
          { label: "Emails Verified", value: metrics.emailsVerified.toString(), percent: "High confidence" },
          { label: "Domains Scanned", value: metrics.domainsScanned.toString(), percent: "All time" },
          { label: "Emails Sent", value: metrics.emailsSent.toString(), percent: "0% from last month" }
        ].map((metric) => (
          <div key={metric.label} className="rounded-xl border bg-card text-card-foreground shadow p-6 glass hover:border-primary/50 transition-colors">
            <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{metric.label}</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold">{metric.value}</span>
              <span className="text-xs text-muted-foreground">{metric.percent}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-7">
        <div className="rounded-xl border bg-card text-card-foreground shadow col-span-4 glass">
          <div className="p-6">
            <h3 className="font-semibold text-lg leading-none tracking-tight">Leads Generated (Last 7 Days)</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.1)' }} 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      borderRadius: '8px', 
                      border: '1px solid #27272a',
                      color: '#fafafa',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)'
                    }} 
                    itemStyle={{ color: '#fafafa' }}
                  />
                  <Bar dataKey="leads" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow col-span-3 glass">
          <div className="p-6">
            <h3 className="font-semibold text-lg leading-none tracking-tight">Recent Leads</h3>
            <p className="text-sm text-muted-foreground mt-2">
              You added {metrics.totalLeads} leads in total.
            </p>
          </div>
          <div className="p-6 pt-0">
            <div className="space-y-8">
              {recentLeads.length > 0 ? recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                    {(lead.firstName?.[0] || lead.email?.[0] || 'U').toUpperCase()}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{lead.firstName} {lead.lastName}</p>
                    <p className="text-sm text-muted-foreground">
                      {lead.email}
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-sm">
                    {Math.round((lead.score || 0) * 100)}%
                  </div>
                </div>
              )) : (
                <div className="text-sm text-muted-foreground text-center py-4">No recent leads.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
