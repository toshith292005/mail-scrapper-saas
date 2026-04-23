import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { GoogleGenAI } from "@google/genai"

export const dynamic = 'force-dynamic'
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { subject, from, snippet } = await req.json()
  if (!snippet && !subject) {
    return NextResponse.json({ error: "Email content is required" }, { status: 400 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey === 'dummy_key') {
    // Return a sensible fallback if no API key
    return NextResponse.json({
      draft: `Hi,\n\nThank you for your email regarding "${subject}". I appreciate you reaching out and will get back to you shortly.\n\nBest regards`
    })
  }

  try {
    const ai = new GoogleGenAI({ apiKey })
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `You are a professional email assistant. Write a concise, friendly, and professional reply to the following email. Just write the reply body, no subject line, no greeting header (start directly with "Hi" or similar). Keep it under 100 words.

From: ${from}
Subject: ${subject}
Email Preview: ${snippet}

Write the reply:`,
    })

    return NextResponse.json({ draft: response.text?.trim() || '' })
  } catch (error: any) {
    console.error("AI Draft Error:", error)
    
    // Handle quota exhaustion gracefully
    const isQuotaError = error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED') || error?.status === 429
    if (isQuotaError) {
      const senderName = from?.split('<')[0]?.trim() || 'there'
      const fallback = `Hi ${senderName},\n\nThank you for your email regarding "${subject}". I appreciate you reaching out and will review this shortly.\n\nI'll get back to you with more details soon.\n\nBest regards`
      return NextResponse.json({ 
        draft: fallback,
        notice: 'AI quota exceeded — using smart template instead. Your quota resets daily.'
      })
    }
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
