import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import nodemailer from "nodemailer"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Don't leak whether the email exists or not
      return NextResponse.json({ success: true, message: "If an account with that email exists, we sent a reset link." })
    }

    // Generate a secure token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600000) // 1 hour from now

    // Save token to database
    await prisma.passwordResetToken.upsert({
      where: {
        email_token: {
          email,
          token
        }
      },
      update: {
        token,
        expires
      },
      create: {
        email,
        token,
        expires
      }
    })

    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`

    // Setup nodemailer
    // If no real SMTP config is provided, we use a mock transporter that just logs to console
    const transporter = nodemailer.createTransport((
      process.env.SMTP_SERVER ? {
        host: process.env.SMTP_SERVER,
        port: parseInt(process.env.SMTP_PORT || '587'),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      } : {
        streamTransport: true,
        newline: 'windows'
      }
    ) as any)

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@emailscrapper.io',
      to: email,
      subject: 'Reset your password - Email Scrapper.io',
      text: `You requested a password reset. Please click the link below to set a new password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
      html: `<p>You requested a password reset. Please click the link below to set a new password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, please ignore this email.</p>`
    }

    if (process.env.SMTP_SERVER) {
      await transporter.sendMail(mailOptions)
    } else {
      console.log('\n=============================================')
      console.log('MOCK EMAIL SENT: Forgot Password')
      console.log(`To: ${email}`)
      console.log(`Reset URL: ${resetUrl}`)
      console.log('=============================================\n')
    }

    return NextResponse.json({ success: true, message: "If an account with that email exists, we sent a reset link." })

  } catch (error: any) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "An error occurred while processing your request." }, { status: 500 })
  }
}
