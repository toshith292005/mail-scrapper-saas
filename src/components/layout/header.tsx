"use client"

import * as React from "react"
import { useSession, signOut } from "next-auth/react"
import { Bell, Menu, User, LogOut, Settings as SettingsIcon, Check, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export function Header() {
  const [isProfileOpen, setIsProfileOpen] = React.useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false)
  const [notifications, setNotifications] = React.useState<any[]>([])

  const fetchNotifications = React.useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      const data = await res.json()
      if (res.ok && data.notifications) {
        setNotifications(data.notifications)
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  React.useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 15000) // Poll every 15s
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = async (id?: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(id ? { id } : {})
      })
      fetchNotifications()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button type="button" className="-m-2.5 p-2.5 text-muted-foreground lg:hidden">
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-border lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6 relative">
          
          {/* Notifications dropdown */}
          <div className="relative">
            <button 
              type="button" 
              className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground relative"
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen)
                setIsProfileOpen(false)
              }}
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" aria-hidden="true" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-background"></span>
              )}
            </button>

            {isNotificationsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                <div className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-md bg-card shadow-lg ring-1 ring-border focus:outline-none glass animate-in fade-in zoom-in-95 duration-100 max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 border-b border-border/50 flex justify-between items-center sticky top-0 bg-card/95 backdrop-blur z-10">
                    <p className="text-sm font-semibold">Notifications</p>
                    {unreadCount > 0 && (
                      <button onClick={() => markAsRead()} className="text-xs text-primary hover:underline flex items-center">
                        <Check className="h-3 w-3 mr-1" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="py-1">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={`px-4 py-3 hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0 ${notification.read ? 'opacity-70' : ''}`}
                          onClick={() => {
                            if (!notification.read) markAsRead(notification.id)
                          }}
                        >
                          <div className="flex gap-3 cursor-pointer">
                            <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${notification.read ? 'bg-transparent' : 'bg-primary'}`}></div>
                            <div>
                              <p className={`text-sm ${notification.read ? 'text-muted-foreground' : 'font-medium text-foreground'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">{notification.message}</p>
                              <p className="text-[10px] text-muted-foreground/70 mt-1">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-x-2 rounded-full p-1 hover:bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              onClick={() => {
                setIsProfileOpen(!isProfileOpen)
                setIsNotificationsOpen(false)
              }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors shadow-[0_0_10px_rgba(var(--primary),0.3)]">
                <User className="h-5 w-5" />
              </div>
            </button>
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-card py-1 shadow-lg ring-1 ring-border focus:outline-none glass animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-border/50">
                    <p className="text-sm font-medium">My Account</p>
                  </div>
                  <Link
                    href="/dashboard/settings"
                    className="flex w-full items-center px-4 py-2 text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
