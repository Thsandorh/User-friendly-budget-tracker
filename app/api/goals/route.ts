// API route for savings goals - GET all goals, POST new goal
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { ensureDatabaseSchema } from "@/lib/auto-migrate"

// GET all savings goals for the authenticated user
export async function GET() {
  await ensureDatabaseSchema()

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const goals = await db.savingsGoal.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(goals)
  } catch (error) {
    console.error("Error fetching savings goals:", error)
    return NextResponse.json({ error: "Failed to fetch savings goals" }, { status: 500 })
  }
}

// POST create new savings goal
export async function POST(req: Request) {
  await ensureDatabaseSchema()

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    const goal = await db.savingsGoal.create({
      data: {
        name: data.name,
        targetAmount: parseFloat(data.targetAmount),
        currentAmount: parseFloat(data.currentAmount || 0),
        currency: data.currency || "HUF",
        deadline: data.deadline ? new Date(data.deadline) : null,
        icon: data.icon || "🎯",
        color: data.color || "#10b981",
        notes: data.notes || null,
        userId: session.user.id,
      },
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    console.error("Error creating savings goal:", error)
    return NextResponse.json({ error: "Failed to create savings goal" }, { status: 500 })
  }
}
