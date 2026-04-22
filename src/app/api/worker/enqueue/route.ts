import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { emailExtractionQueue } from "@/lib/queue"

export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { domain } = await req.json()

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 })
    }

    // Enqueue the scraping job
    const job = await emailExtractionQueue.add('extract-emails', {
      domain,
      userId: session.user.id,
      source: 'Domain Scraper'
    })

    return NextResponse.json({ 
      success: true, 
      message: `Scraper job started for ${domain}`,
      jobId: job.id
    })
  } catch (error: any) {
    console.error("Worker Enqueue Error:", error)
    return NextResponse.json({ error: error.message || "Failed to enqueue job" }, { status: 500 })
  }
}
