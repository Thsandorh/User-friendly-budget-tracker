// API routes for individual transaction operations
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { amount, description, type, date, categoryId, budgetId, notes } = body

    const existingTransaction = await db.transaction.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    const transaction = await db.transaction.update({
      where: { id: params.id },
      data: {
        ...(amount && { amount: parseFloat(amount) }),
        ...(description && { description }),
        ...(type && { type }),
        ...(date && { date: new Date(date) }),
        ...(notes !== undefined && { notes }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(budgetId !== undefined && { budgetId: budgetId || null }),
      },
      include: {
        category: true,
        budget: true,
      },
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Error updating transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existingTransaction = await db.transaction.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    await db.transaction.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
