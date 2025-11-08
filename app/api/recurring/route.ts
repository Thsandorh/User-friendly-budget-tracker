// API routes for recurring transaction management
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const recurringTransactions = await db.recurringTransaction.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(recurringTransactions)
  } catch (error) {
    console.error("Error fetching recurring transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { amount, description, type, frequency, startDate, endDate, dayOfMonth, dayOfWeek, categoryId, notes } = body

    if (!amount || !description || !type || !frequency || !startDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const recurringTransaction = await db.recurringTransaction.create({
      data: {
        amount: parseFloat(amount),
        description,
        type,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        dayOfMonth: dayOfMonth ? parseInt(dayOfMonth) : null,
        dayOfWeek: dayOfWeek ? parseInt(dayOfWeek) : null,
        isActive: true,
        userId: session.user.id,
        categoryId: categoryId || null,
        notes: notes || null,
      },
      include: {
        category: true,
      },
    })

    return NextResponse.json(recurringTransaction)
  } catch (error) {
    console.error("Error creating recurring transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
