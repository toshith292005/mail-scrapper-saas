import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { google } from "googleapis"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  
  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({ access_token: (session as any).accessToken })

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
    
    // Fetch a single message
    const response = await gmail.users.messages.get({
      userId: 'me',
      id: params.id,
    })

    return NextResponse.json({ message: response.data })
  } catch (error: any) {
    console.error("Gmail API Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
