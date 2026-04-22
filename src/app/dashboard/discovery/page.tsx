"use client"

import * as React from "react"
import { Upload, Globe, UserPlus, Play, CheckCircle, Loader2, Sparkles, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function LeadDiscoveryPage() {
  const [domain, setDomain] = React.useState("")
  const [isScanning, setIsScanning] = React.useState(false)
  const [scanMessage, setScanMessage] = React.useState("")
  const [scanSuccess, setScanSuccess] = React.useState(false)

  const [linkedinUrl, setLinkedinUrl] = React.useState("")
  const [linkedinName, setLinkedinName] = React.useState("")
  const [linkedinCompany, setLinkedinCompany] = React.useState("")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [linkedinResult, setLinkedinResult] = React.useState<any>(null)
  const [linkedinError, setLinkedinError] = React.useState("")

  const handleDomainScan = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsScanning(true)
    setScanMessage("")
    setScanSuccess(false)
    
    try {
      const res = await fetch("/api/worker/enqueue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain })
      })
      
      if (res.ok) {
        setScanSuccess(true)
        setScanMessage(`Scraper job queued for "${domain}". Results will appear in My Leads within 30–60 seconds as emails are discovered.`)
        setDomain("")
      } else {
        const data = await res.json()
        setScanMessage(`Error: ${data.error || "Failed to start job"}`)
      }
    } catch (err) {
      setScanMessage("Error: Failed to connect to server")
    } finally {
      setIsScanning(false)
    }
  }

  const handleLinkedinProcess = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setLinkedinResult(null)
    setLinkedinError("")

    try {
      const res = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedinUrl, name: linkedinName, company: linkedinCompany })
      })
      const data = await res.json()
      if (res.ok) {
        setLinkedinResult(data)
        setLinkedinUrl("")
        setLinkedinName("")
        setLinkedinCompany("")
      } else {
        setLinkedinError(data.error || "Failed to process profile")
      }
    } catch (err) {
      setLinkedinError("Failed to connect to server")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lead Discovery Engine</h1>
        <p className="text-muted-foreground">
          Find and verify leads using our ethical scraping and AI enrichment tools.
        </p>
      </div>

      <Tabs defaultValue="domain" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="domain">Domain Scraper</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn Enrichment</TabsTrigger>
        </TabsList>
        
        <TabsContent value="domain" className="mt-6 space-y-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow glass">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Scan Domain</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter a company domain. We will ethically crawl public pages respecting robots.txt to find contact emails.
                  </p>
                </div>
              </div>
              <form onSubmit={handleDomainScan} className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <label htmlFor="domain" className="text-sm font-medium leading-none">Target Domain</label>
                  <Input 
                    id="domain" 
                    placeholder="e.g. stripe.com" 
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isScanning}
                  className="h-10 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium flex items-center shadow hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isScanning ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="mr-2 h-4 w-4" />
                  )}
                  {isScanning ? "Queuing..." : "Start Scan"}
                </button>
              </form>
              {scanMessage && (
                <div className={`mt-4 p-4 rounded-lg text-sm flex items-start gap-3 ${scanSuccess ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {scanSuccess && <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />}
                  <div>
                    <p>{scanMessage}</p>
                    {scanSuccess && (
                      <Link href="/dashboard/leads" className="inline-flex items-center gap-1 mt-2 text-primary underline-offset-4 hover:underline text-xs font-medium">
                        View My Leads <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card/50 p-5 glass">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> How it works
            </h4>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Your domain scan job is pushed to the Redis queue via BullMQ.</li>
              <li>The background worker crawls the target domain, respecting robots.txt.</li>
              <li>All discovered emails are automatically saved to <strong className="text-foreground">My Leads</strong>.</li>
              <li>You can then export, filter, and enrich those leads anytime.</li>
            </ol>
          </div>
        </TabsContent>

        <TabsContent value="linkedin" className="mt-6 space-y-4">
          <div className="rounded-xl border bg-card text-card-foreground shadow glass">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                  <UserPlus className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">LinkedIn Profile Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter a public LinkedIn profile. We predict corporate email formats and save the lead automatically.
                  </p>
                </div>
              </div>
              <form onSubmit={handleLinkedinProcess} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="linkedin-name" className="text-sm font-medium">Full Name *</label>
                    <Input 
                      id="linkedin-name"
                      placeholder="e.g. John Smith" 
                      value={linkedinName}
                      onChange={(e) => setLinkedinName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="linkedin-company" className="text-sm font-medium">Company Name *</label>
                    <Input 
                      id="linkedin-company"
                      placeholder="e.g. Stripe" 
                      value={linkedinCompany}
                      onChange={(e) => setLinkedinCompany(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="linkedin-url" className="text-sm font-medium">LinkedIn Profile URL *</label>
                  <Input 
                    id="linkedin-url"
                    placeholder="https://linkedin.com/in/username" 
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="h-10 px-6 py-2 bg-blue-600 text-white rounded-md font-medium flex items-center shadow hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  {isProcessing ? "Processing..." : "Process Profile"}
                </button>
              </form>

              {linkedinError && (
                <div className="mt-4 p-4 rounded-lg text-sm bg-red-500/10 text-red-400 border border-red-500/20">
                  {linkedinError}
                </div>
              )}

              {linkedinResult && (
                <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 space-y-3">
                  <p className="text-sm font-semibold text-green-400 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" /> Lead queued successfully!
                  </p>
                  {linkedinResult.predictions?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Predicted email formats:</p>
                      <div className="space-y-1">
                        {linkedinResult.predictions.map((pred: string, i: number) => (
                          <div key={i} className="flex items-center justify-between text-sm bg-card/50 px-3 py-2 rounded-md border border-border/50">
                            <span className="font-mono text-primary">{pred}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${i === 0 ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                              {i === 0 ? 'Most likely' : `Pattern ${i + 1}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <Link href="/dashboard/leads" className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline text-xs font-medium">
                    View in My Leads <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
