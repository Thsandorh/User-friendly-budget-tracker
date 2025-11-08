// API routes for transaction management
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { ensureDatabaseSchema } from "@/lib/auto-migrate"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await ensureDatabaseSchema()

    const { searchParams } = new URL(req.url)
    const budgetId = searchParams.get('budgetId')
    const categoryId = searchParams.get('categoryId')
    const type = searchParams.get('type')

    const transactions = await db.transaction.findMany({
      where: {
        userId: session.user.id,
        ...(budgetId && { budgetId }),
        ...(categoryId && { categoryId }),
        ...(type && { type }),
      },
      include: {
        category: true,
        budget: true,
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await ensureDatabaseSchema()

    const body = await req.json()
    const { amount, description, type, date, categoryId, budgetId, notes } = body

    if (!amount || !description || !type || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const transaction = await db.transaction.create({
      data: {
        amount: parseFloat(amount),
        description,
        type,
        date: new Date(date),
        notes,
        userId: session.user.id,
        categoryId: categoryId || null,
        budgetId: budgetId || null,
      },
      include: {
        category: true,
        budget: true,
      },
    })

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
