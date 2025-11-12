// API route for individual savings goal - GET, PUT, DELETE
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET single savings goal
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const goal = await db.savingsGoal.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    return NextResponse.json(goal)
  } catch (error) {
    console.error("Error fetching savings goal:", error)
    return NextResponse.json({ error: "Failed to fetch savings goal" }, { status: 500 })
  }
}

// PUT update savings goal
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
    const existingGoal = await db.savingsGoal.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    // Check if goal should be marked as completed
    const currentAmount = parseFloat(data.currentAmount)
    const targetAmount = parseFloat(data.targetAmount)
    const isCompleted = currentAmount >= targetAmount

    const goal = await db.savingsGoal.update({
      where: { id: params.id },
      data: {
        name: data.name,
        targetAmount: targetAmount,
        currentAmount: currentAmount,
        currency: data.currency,
        deadline: data.deadline ? new Date(data.deadline) : null,
        icon: data.icon,
        color: data.color,
        notes: data.notes || null,
        isCompleted,
      },
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error("Error updating savings goal:", error)
    return NextResponse.json({ error: "Failed to update savings goal" }, { status: 500 })
  }
}

// DELETE savings goal
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
    const existingGoal = await db.savingsGoal.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    await db.savingsGoal.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting savings goal:", error)
    return NextResponse.json({ error: "Failed to delete savings goal" }, { status: 500 })
  }
}
