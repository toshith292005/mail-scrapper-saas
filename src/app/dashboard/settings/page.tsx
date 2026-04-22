"use client"

import * as React from "react"
import { Key, User, CheckCircle2, XCircle, LogOut, Shield } from "lucide-react"
import { useSession, signOut, signIn } from "next-auth/react"

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const user = session?.user as any

  const [name, setName] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)
  const [toast, setToast] = React.useState<{msg: string, type: 'success'|'error'}|null>(null)
  const [apiKey, setApiKey] = React.useState<string|null>(null)

  // Password change state
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("")
  const [isChangingPassword, setIsChangingPassword] = React.useState(false)

  // Populate form with real user data once session loads
  React.useEffect(() => {
    if (user?.name) setName(user.name)
  }, [user?.name])

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      if (res.ok) {
        await update({ name })
        showToast('Profile updated successfully!')
      } else {
        showToast('Failed to save changes.', 'error')
      }
    } catch {
      showToast('Failed to save changes.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmNewPassword) {
      showToast("New passwords do not match", "error")
      return
    }
    
    setIsChangingPassword(true)
    try {
      const res = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Password changed successfully!')
        setCurrentPassword("")
        setNewPassword("")
        setConfirmNewPassword("")
      } else {
        showToast(data.error || 'Failed to change password.', 'error')
      }
    } catch {
      showToast('Failed to change password.', 'error')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleGenerateKey = () => {
    const key = `esio_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
    setApiKey(key)
    showToast('API key generated! Save it somewhere safe — it won\'t be shown again.')
  }

  // Check if user has Google account linked
  const hasGoogleLinked = user?.image?.includes('googleusercontent') || (session as any)?.provider === 'google'

  return (
    <div className="space-y-6 max-w-4xl">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium glass border ${toast.type === 'success' ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'}`}>
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and integrations.</p>
      </div>

      <div className="grid gap-6">
        {/* Profile */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm glass">
          <div className="p-6 border-b border-border/50 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Profile</h3>
          </div>
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold border-2 border-primary/20">
                {user?.image ? (
                  <img src={user.image} alt="Avatar" className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  (user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()
                )}
              </div>
              <div>
                <div className="font-semibold">{user?.name || 'User'}</div>
                <div className="text-sm text-muted-foreground">{user?.email}</div>
                <div className="text-xs text-primary mt-1 bg-primary/10 px-2 py-0.5 rounded-full inline-block">
                  {user?.role || 'USER'}
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
                placeholder="Your display name"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="flex h-10 w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Security / Password */}
        {!hasGoogleLinked && (
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm glass">
            <div className="p-6 border-b border-border/50 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Change Password</h3>
            </div>
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50 transition-colors"
              >
                {isChangingPassword ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}

        {/* Integrations */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm glass">
          <div className="p-6 border-b border-border/50 flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Integrations & API Keys</h3>
          </div>
          <div className="p-6 space-y-4">
            {/* Google Integration */}
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-4 bg-card/50">
              <div className="flex items-center gap-3">
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <div>
                  <label className="text-sm font-medium">Google Workspace</label>
                  <p className="text-xs text-muted-foreground">
                    {hasGoogleLinked ? 'Connected — Gmail sync is active.' : 'Not connected — link your Google account to use the Inbox.'}
                  </p>
                </div>
              </div>
              {hasGoogleLinked ? (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-semibold">
                  <CheckCircle2 className="h-3 w-3" /> Connected
                </div>
              ) : (
                <button
                  onClick={() => signIn("google", { callbackUrl: "/dashboard/settings" })}
                  className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
                >
                  Connect Google
                </button>
              )}
            </div>

            {/* API Key */}
            <div className="rounded-lg border border-border/50 p-4 bg-card/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium">Email Scrapper API Key</label>
                    <p className="text-xs text-muted-foreground">Use this key to authenticate external integrations.</p>
                  </div>
                </div>
                <button
                  onClick={handleGenerateKey}
                  className="text-xs px-3 py-1.5 rounded-md border border-input bg-background hover:bg-accent font-medium transition-colors"
                >
                  Generate Key
                </button>
              </div>
              {apiKey && (
                <div className="mt-2 p-3 bg-muted/50 rounded-md border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Your API Key — copy it now, it won't be shown again:</p>
                  <code className="text-xs text-primary font-mono break-all select-all">{apiKey}</code>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 text-card-foreground shadow-sm">
          <div className="p-6 border-b border-red-500/20 flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-400" />
            <h3 className="font-semibold text-lg text-red-400">Danger Zone</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Sign out of Email Scrapper.io</p>
                <p className="text-xs text-muted-foreground">You'll need to sign back in to access your dashboard.</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-2 text-xs px-4 py-2 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium transition-colors border border-red-500/20"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
