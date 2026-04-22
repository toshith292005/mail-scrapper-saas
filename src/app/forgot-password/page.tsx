"use client"

import * as React from "react"
import Link from "next/link"
import { Shield, Loader2, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setSuccess(true)
      } else {
        setError(data.error || "Failed to process request")
      }
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8 glass p-8 rounded-2xl border shadow-xl">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
            <p className="text-sm text-muted-foreground">
              We sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
              Please check your inbox.
            </p>
          </div>
          <div className="text-center">
             <Link href="/login" className="text-sm text-primary hover:underline font-medium inline-flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
              </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 glass p-8 rounded-2xl border shadow-xl">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Shield className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Forgot Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we will send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium leading-none">Email</label>
            <input
              id="email"
              type="email"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 p-3 rounded-md border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? "Sending link..." : "Send reset link"}
          </button>
        </form>

        <div className="text-center">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
