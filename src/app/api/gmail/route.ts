import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { google } from "googleapis"

export async function GET(req: Request) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const accessToken = (session as any).accessToken
  if (!accessToken) {
    return NextResponse.json({ error: "Please connect your Google account to view your Inbox." }, { status: 401 })
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )
    
    oauth2Client.setCredentials({
      access_token: accessToken,
    })

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
    
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
    })

    const messageIds = response.data.messages || []
    
    const messages = await Promise.all(
      messageIds.map(async (msg) => {
        try {
          const detail = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id as string,
            format: 'metadata',
            metadataHeaders: ['Subject', 'From', 'Date'],
          })
          
          const headers = detail.data.payload?.headers || []
          const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject'
          const from = headers.find(h => h.name === 'From')?.value || 'Unknown Sender'
          const date = headers.find(h => h.name === 'Date')?.value || new Date().toISOString()
          
          return {
            id: msg.id,
            threadId: msg.threadId,
            snippet: detail.data.snippet,
            subject,
            from,
            date,
            read: !detail.data.labelIds?.includes('UNREAD')
          }
        } catch (e) {
          return null
        }
      })
    )
    
    return NextResponse.json({ messages: messages.filter(Boolean) })
  } catch (error: any) {
    console.error("Gmail API Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
