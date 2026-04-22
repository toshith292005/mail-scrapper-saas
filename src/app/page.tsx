import Link from "next/link"
import { Globe } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <header className="px-4 lg:px-6 h-16 flex items-center glass sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2 transition-transform hover:scale-105" href="/">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]">
            <Globe className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">Email Scrapper.io</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="#">
            About
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/login">
            Login
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center relative z-10">
        <section className="w-full py-24 md:py-32 lg:py-48 flex justify-center text-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8">
              <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                Now with AI Intelligence
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                  Supercharge Your <br className="hidden sm:inline" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                    Lead Generation
                  </span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl leading-relaxed">
                  Ethical scraping, AI-powered insights, and verified contact data. Build your pipeline faster than ever before.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all hover:bg-primary/90 hover:scale-105 hover:shadow-[0_0_25px_rgba(0,0,0,0.5)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  Start For Free
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-border/50 glass z-10">
        <p className="text-xs text-muted-foreground">
          © 2026 Email Scrapper.io. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:text-foreground transition-colors text-muted-foreground" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:text-foreground transition-colors text-muted-foreground" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
