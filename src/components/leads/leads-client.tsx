"use client"

import * as React from "react"
import { Filter, Download, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export function LeadsClient({ leads }: { leads: any[] }) {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleExport = () => {
    // Basic CSV export logic
    const headers = ["Name", "Email", "Company", "Source", "Confidence Score", "Status"];
    const csvContent = [
      headers.join(","),
      ...leads.map(lead => [
        `"${lead.firstName || ''} ${lead.lastName || ''}"`.trim(), 
        `"${lead.email || ''}"`, 
        `"${lead.company || ''}"`, 
        `"${lead.source || ''}"`, 
        lead.score || 0, 
        lead.status || 'NEW'
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "my_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (leads.length === 0) {
    return (
      <div className="text-center p-12 border rounded-xl glass">
        <h3 className="text-lg font-medium">No leads found</h3>
        <p className="text-muted-foreground mt-2">Start a discovery job to find your first leads.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
        <div className="flex gap-2">
          <button className="flex items-center px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden glass">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border/50">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Company</th>
                <th className="px-6 py-4 font-medium">Source</th>
                <th className="px-6 py-4 font-medium">Confidence</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {(lead.firstName?.[0] || lead.email?.[0] || 'U').toUpperCase()}
                    </div>
                    {lead.firstName} {lead.lastName}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{lead.email}</td>
                  <td className="px-6 py-4 text-muted-foreground">{lead.company || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium border border-border/50">
                      {lead.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-16 bg-muted rounded-full overflow-hidden border border-border/50">
                        <div className="h-full bg-green-500" style={{ width: `${(lead.score || 0) * 100}%` }}></div>
                      </div>
                      <span className="text-xs">{Math.round((lead.score || 0) * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        lead.status === 'NEW' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                        lead.status === 'CONTACTED' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-green-500/10 text-green-500 border-green-500/20'
                     }`}>
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
