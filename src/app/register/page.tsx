"use client"

import * as React from "react"
import { signIn } from "next-auth/react"
import { Globe, Mail, Lock, User, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
  })

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    await signIn("google", { callbackUrl: "/dashboard" })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        // Automatically sign them in after successful registration
        const signInRes = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })
        
        if (signInRes?.error) {
          setError("Failed to sign in after registration. Please try logging in manually.")
          setIsLoading(false)
        } else {
          window.location.href = "/dashboard"
        }
      } else {
        const data = await res.json()
        setError(data.message || "Something went wrong")
        setIsLoading(false)
      }
    } catch (err) {
      setError("Failed to connect to the server")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background glowing effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md px-8 py-10 z-10 glass rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.2)] border border-border/50">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center justify-center gap-2 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]">
              <Globe className="h-6 w-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight">Email Scrapper.io</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-center">Create an account</h1>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Sign up to start generating leads instantly
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-card hover:bg-secondary/80 text-foreground border border-border/50 rounded-lg px-4 py-3 text-sm font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Sign up with Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground rounded-full border border-border/50">
                Or sign up with email
              </span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleRegister}>
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="flex h-10 w-full rounded-md border border-input bg-background/50 pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors focus:bg-background"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="m@example.com"
                  className="flex h-10 w-full rounded-md border border-input bg-background/50 pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors focus:bg-background"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="flex h-10 w-full rounded-md border border-input bg-background/50 pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-colors focus:bg-background"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-4 h-10 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>
        </div>

        <p className="px-8 text-center text-sm text-muted-foreground mt-6">
          By clicking continue, you agree to our{" "}
          <Link href="#" className="underline underline-offset-4 hover:text-primary transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="underline underline-offset-4 hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          .
        </p>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
