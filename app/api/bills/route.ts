// API route for bill reminders - GET all bills, POST new bill
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { ensureDatabaseSchema } from "@/lib/auto-migrate"

// GET all bill reminders for the authenticated user
export async function GET() {
  await ensureDatabaseSchema()

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bills = await db.billReminder.findMany({
      where: { userId: session.user.id },
      include: { category: true },
      orderBy: { dueDate: 'asc' }
    })

    return NextResponse.json(bills)
  } catch (error) {
    console.error("Error fetching bill reminders:", error)
    return NextResponse.json({ error: "Failed to fetch bill reminders" }, { status: 500 })
  }
}

// POST create new bill reminder
export async function POST(req: Request) {
  await ensureDatabaseSchema()

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    const bill = await db.billReminder.create({
      data: {
        name: data.name,
        amount: parseFloat(data.amount),
        currency: data.currency || "HUF",
        dueDate: new Date(data.dueDate),
        isPaid: data.isPaid || false,
        isRecurring: data.isRecurring || false,
        frequency: data.frequency || null,
        notes: data.notes || null,
        userId: session.user.id,
        categoryId: data.categoryId || null,
      },
    })

    return NextResponse.json(bill, { status: 201 })
  } catch (error) {
    console.error("Error creating bill reminder:", error)
    return NextResponse.json({ error: "Failed to create bill reminder" }, { status: 500 })
  }
}
