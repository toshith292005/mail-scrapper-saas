import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: (session.user as any).id },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return NextResponse.json({ notifications })
  } catch (error: any) {
    console.error("Fetch notifications error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await req.json()
    
    if (id) {
      // Mark single as read
      await prisma.notification.update({
        where: { id, userId: (session.user as any).id },
        data: { read: true }
      })
    } else {
      // Mark all as read
      await prisma.notification.updateMany({
        where: { userId: (session.user as any).id, read: false },
        data: { read: true }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Update notifications error:", error)
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
  }
}
