import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()
    
    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Find the token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    })

    if (!resetToken) {
      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    // Check expiration
    if (new Date(resetToken.expires) < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } })
      return NextResponse.json({ error: "Reset token has expired" }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Update user password
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword }
    })

    // Delete the token
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } })

    return NextResponse.json({ success: true, message: "Password updated successfully" })

  } catch (error: any) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "An error occurred while resetting your password." }, { status: 500 })
  }
}
