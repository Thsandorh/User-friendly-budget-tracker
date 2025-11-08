// API route for auto-categorization rules
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { ensureDatabaseSchema } from "@/lib/auto-migrate"

// GET all categorization rules
export async function GET() {
  await ensureDatabaseSchema()

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rules = await db.categorizationRule.findMany({
      where: { userId: session.user.id },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json(rules)
  } catch (error) {
    console.error("Error fetching categorization rules:", error)
    return NextResponse.json({ error: "Failed to fetch rules" }, { status: 500 })
  }
}

// POST create new categorization rule
export async function POST(req: Request) {
  await ensureDatabaseSchema()

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    const rule = await db.categorizationRule.create({
      data: {
        pattern: data.pattern.toLowerCase(),
        categoryId: data.categoryId,
        priority: data.priority || 0,
        isActive: data.isActive !== false,
        userId: session.user.id,
      },
    })

    return NextResponse.json(rule, { status: 201 })
  } catch (error) {
    console.error("Error creating categorization rule:", error)
    return NextResponse.json({ error: "Failed to create rule" }, { status: 500 })
  }
}
