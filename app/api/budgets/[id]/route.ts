// API routes for individual budget operations
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET a specific budget
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const budget = await db.budget.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!budget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 })
    }

    return NextResponse.json(budget)
  } catch (error) {
    console.error("Error fetching budget:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH update a budget
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, amount, currency, period, startDate, endDate, isActive } = body

    // Verify budget belongs to user
    const existingBudget = await db.budget.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingBudget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 })
    }

    const budget = await db.budget.update({
      where: {
        id: params.id,
      },
      data: {
        ...(name && { name }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(currency && { currency }),
        ...(period && { period }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(budget)
  } catch (error) {
    console.error("Error updating budget:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE a budget
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify budget belongs to user
    const existingBudget = await db.budget.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingBudget) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 })
    }

    await db.budget.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting budget:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
