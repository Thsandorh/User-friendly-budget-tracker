// API route for individual categorization rule
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// PUT update rule
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    // Verify ownership
    const existingRule = await db.categorizationRule.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingRule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 })
    }

    const rule = await db.categorizationRule.update({
      where: { id: params.id },
      data: {
        pattern: data.pattern.toLowerCase(),
        categoryId: data.categoryId,
        priority: data.priority,
        isActive: data.isActive,
      },
    })

    return NextResponse.json(rule)
  } catch (error) {
    console.error("Error updating categorization rule:", error)
    return NextResponse.json({ error: "Failed to update rule" }, { status: 500 })
  }
}

// DELETE rule
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify ownership
    const existingRule = await db.categorizationRule.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingRule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 })
    }

    await db.categorizationRule.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting categorization rule:", error)
    return NextResponse.json({ error: "Failed to delete rule" }, { status: 500 })
  }
}
