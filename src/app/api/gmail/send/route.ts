import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { google } from "googleapis"

export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const accessToken = (session as any).accessToken
  if (!accessToken) {
    return NextResponse.json({ error: "Please connect your Google account to send emails." }, { status: 401 })
  }

  try {
    const { to, subject, message, threadId } = await req.json()

    if (!to || !message) {
      return NextResponse.json({ error: "To and message fields are required." }, { status: 400 })
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    )
    
    oauth2Client.setCredentials({
      access_token: accessToken,
    })

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
    
    // Construct email RFC 2822 format
    const str = [
      `To: ${to}`,
      `Subject: ${subject || 'Re:'}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      message
    ].join('\n')

    // Base64url encode the message
    const encodedEmail = Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    const sendOptions: any = {
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    }

    if (threadId) {
      sendOptions.requestBody.threadId = threadId
    }

    const res = await gmail.users.messages.send(sendOptions)

    return NextResponse.json({ success: true, messageId: res.data.id })
  } catch (error: any) {
    console.error("Gmail Send Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
