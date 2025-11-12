// API route for individual bill reminder - GET, PUT, DELETE
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET single bill reminder
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bill = await db.billReminder.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: { category: true },
    })

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    return NextResponse.json(bill)
  } catch (error) {
    console.error("Error fetching bill reminder:", error)
    return NextResponse.json({ error: "Failed to fetch bill reminder" }, { status: 500 })
  }
}

// PUT update bill reminder
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
    const existingBill = await db.billReminder.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingBill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    const bill = await db.billReminder.update({
      where: { id: params.id },
      data: {
        name: data.name,
        amount: parseFloat(data.amount),
        currency: data.currency,
        dueDate: new Date(data.dueDate),
        isPaid: data.isPaid,
        isRecurring: data.isRecurring,
        frequency: data.frequency || null,
        notes: data.notes || null,
        categoryId: data.categoryId || null,
      },
    })

    return NextResponse.json(bill)
  } catch (error) {
    console.error("Error updating bill reminder:", error)
    return NextResponse.json({ error: "Failed to update bill reminder" }, { status: 500 })
  }
}

// DELETE bill reminder
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
    const existingBill = await db.billReminder.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingBill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 })
    }

    await db.billReminder.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting bill reminder:", error)
    return NextResponse.json({ error: "Failed to delete bill reminder" }, { status: 500 })
  }
}
