import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { emailExtractionQueue } from "@/lib/queue"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { linkedinUrl, name, company } = await req.json()
  if (!linkedinUrl || !name) {
    return NextResponse.json({ error: "LinkedIn URL and name are required" }, { status: 400 })
  }

  const job = await emailExtractionQueue.add('linkedin-enrich', {
    userId: (session.user as any).id,
    linkedinUrl,
    linkedinName: name,
    linkedinCompany: company || '',
    source: 'LinkedIn',
  })

  // Also generate a quick prediction inline for immediate feedback
  const firstName = (name.split(' ')[0] || 'contact').toLowerCase()
  const lastName = (name.split(' ')[1] || '').toLowerCase()
  const companyDomain = company
    ? company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'
    : null

  const predictions = companyDomain ? [
    `${firstName}.${lastName}@${companyDomain}`,
    `${firstName}@${companyDomain}`,
    `${firstName[0]}${lastName}@${companyDomain}`,
  ] : []

  return NextResponse.json({
    success: true,
    jobId: job.id,
    message: `LinkedIn profile queued for enrichment. Lead will appear in My Leads shortly.`,
    predictions,
  })
}
