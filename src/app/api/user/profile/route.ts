import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 })

  const updated = await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { name: name.trim() }
  })

  return NextResponse.json({ success: true, name: updated.name })
}
