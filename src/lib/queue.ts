import { Queue } from 'bullmq'
import { redis } from './redis'

export const GMAIL_SYNC_QUEUE = 'gmail-sync'
export const EMAIL_EXTRACTION_QUEUE = 'email-extraction'

export const gmailSyncQueue = new Queue(GMAIL_SYNC_QUEUE, {
  connection: redis
})

export const emailExtractionQueue = new Queue(EMAIL_EXTRACTION_QUEUE, {
  connection: redis
})
