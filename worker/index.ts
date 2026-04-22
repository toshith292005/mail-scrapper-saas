import { Worker, Job } from 'bullmq'
import { redis } from '../src/lib/redis'
import { GMAIL_SYNC_QUEUE, EMAIL_EXTRACTION_QUEUE } from '../src/lib/queue'
import { prisma } from '../src/lib/prisma'
import { scrapeDomainForEmails } from '../src/lib/scraper'

console.log('Worker is starting...')

const gmailSyncWorker = new Worker(GMAIL_SYNC_QUEUE, async (job: Job) => {
  console.log(`[Gmail Sync Worker] Processing job ${job.id}`)
  console.log(`[Gmail Sync Worker] Data:`, job.data)
  const { userId } = job.data
  if (!userId) throw new Error('UserId is required')
  console.log(`[Gmail Sync Worker] No-op for user ${userId} (handled by API route)`)
  return { success: true }
}, { connection: redis })

// Real domain scraper + LinkedIn processor
const emailExtractionWorker = new Worker(EMAIL_EXTRACTION_QUEUE, async (job: Job) => {
  console.log(`[Email Extraction Worker] Processing job ${job.id}`, job.data)
  const { userId, domain, source, linkedinUrl, linkedinName, linkedinCompany } = job.data

  try {
    // --- Domain Scraping ---
    if (domain && source === 'Domain Scraper') {
      console.log(`[Email Extraction Worker] Scraping domain: ${domain}`)
      const emails = await scrapeDomainForEmails(domain)
      console.log(`[Email Extraction Worker] Found ${emails.length} emails on ${domain}`)

      for (const email of emails) {
        const namePart = email.split('@')[0].replace(/[._]/g, ' ')
        await prisma.lead.upsert({
          where: { email },
          update: { updatedAt: new Date() },
          create: {
            userId,
            name: namePart,
            email,
            domain,
            source: 'Domain',
            confidenceScore: 0.75,
            status: 'NEW',
          }
        })
      }
      console.log(`[Email Extraction Worker] Saved ${emails.length} leads from ${domain}`)
      
      // Notify user
      await prisma.notification.create({
        data: {
          userId,
          title: "Domain Scan Complete",
          message: `Found ${emails.length} emails from ${domain}.`,
          type: "SUCCESS"
        }
      })

      return { success: true, leadsFound: emails.length }
    }

    // --- LinkedIn AI Enrichment ---
    if (linkedinUrl && linkedinName) {
      console.log(`[Email Extraction Worker] Processing LinkedIn: ${linkedinUrl}`)
      // Predict common email formats based on name + company domain
      const firstName = (linkedinName.split(' ')[0] || 'contact').toLowerCase()
      const lastName = (linkedinName.split(' ')[1] || '').toLowerCase()
      const companyDomain = linkedinCompany
        ? linkedinCompany.toLowerCase().replace(/\s+/g, '') + '.com'
        : 'unknown.com'

      const predictedEmail = `${firstName}.${lastName}@${companyDomain}`

      await prisma.lead.upsert({
        where: { email: predictedEmail },
        update: { updatedAt: new Date() },
        create: {
          userId,
          name: linkedinName,
          email: predictedEmail,
          domain: companyDomain,
          linkedinUrl,
          source: 'LinkedIn',
          confidenceScore: 0.6,
          status: 'NEW',
        }
      })
      console.log(`[Email Extraction Worker] LinkedIn lead saved: ${predictedEmail}`)

      // Notify user
      await prisma.notification.create({
        data: {
          userId,
          title: "LinkedIn Lead Processed",
          message: `Predicted email ${predictedEmail} for ${linkedinName}.`,
          type: "SUCCESS"
        }
      })

      return { success: true }
    }

    // Legacy from/body extraction (Gmail sync)
    const { from, body } = job.data
    if (from && userId) {
      const emailMatch = from.match(/<(.+)>/)
      const nameMatch = from.match(/(.+)</)
      const email = emailMatch ? emailMatch[1].trim() : from
      const name = nameMatch ? nameMatch[1].trim() : ''
      const emailDomain = email.split('@')[1]

      await prisma.lead.upsert({
        where: { email },
        update: { status: 'NEW', updatedAt: new Date() },
        create: {
          userId, name, email,
          domain: emailDomain,
          source: 'Gmail',
          confidenceScore: 0.95,
        }
      })
    }

    return { success: true }
  } catch (error) {
    console.error(`[Email Extraction Worker] Error:`, error)
    throw error
  }
}, { connection: redis })

gmailSyncWorker.on('completed', job => console.log(`[Gmail Sync] Job ${job.id} completed`))
gmailSyncWorker.on('failed', (job, err) => console.log(`[Gmail Sync] Job ${job?.id} failed: ${err.message}`))
emailExtractionWorker.on('completed', job => console.log(`[Email Extraction] Job ${job.id} completed`))
emailExtractionWorker.on('failed', (job, err) => console.log(`[Email Extraction] Job ${job?.id} failed: ${err.message}`))

console.log('Workers are running and listening to queues...')
