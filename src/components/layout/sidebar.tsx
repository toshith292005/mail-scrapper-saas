"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Mail, Search, Globe, Users, Settings } from "lucide-react"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Inbox", href: "/dashboard/inbox", icon: Mail },
  { name: "Lead Discovery", href: "/dashboard/discovery", icon: Search },
  { name: "My Leads", href: "/dashboard/leads", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Admin", href: "/dashboard/admin", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-background border-r">
      <div className="flex h-16 shrink-0 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Globe className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">Email Scrapper.io</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`) && item.href !== "/dashboard"
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
