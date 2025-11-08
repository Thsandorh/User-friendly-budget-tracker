// API routes for individual recurring transaction operations
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
    const { amount, description, type, frequency, startDate, endDate, dayOfMonth, dayOfWeek, isActive, categoryId, notes } = body

    const existingRecurring = await db.recurringTransaction.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!existingRecurring) {
      return NextResponse.json({ error: "Recurring transaction not found" }, { status: 404 })
    }

    const recurringTransaction = await db.recurringTransaction.update({
      where: { id: params.id },
      data: {
        ...(amount && { amount: parseFloat(amount) }),
        ...(description && { description }),
        ...(type && { type }),
        ...(frequency && { frequency }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(dayOfMonth !== undefined && { dayOfMonth: dayOfMonth ? parseInt(dayOfMonth) : null }),
        ...(dayOfWeek !== undefined && { dayOfWeek: dayOfWeek ? parseInt(dayOfWeek) : null }),
        ...(isActive !== undefined && { isActive }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(notes !== undefined && { notes: notes || null }),
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(recurringTransaction)
  } catch (error) {
    console.error("Error updating recurring transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const existingRecurring = await db.recurringTransaction.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!existingRecurring) {
      return NextResponse.json({ error: "Recurring transaction not found" }, { status: 404 })
    }

    await db.recurringTransaction.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting recurring transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
