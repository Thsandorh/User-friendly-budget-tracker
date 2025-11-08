// API route for splitting transactions into multiple categories
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

interface SplitItem {
  categoryId: string
  amount: number
  percentage: number
}

// POST create split transactions
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { splits }: { splits: SplitItem[] } = await req.json()

    // Verify ownership of parent transaction
    const parentTransaction = await db.transaction.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!parentTransaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Validate splits total to 100%
    const totalPercentage = splits.reduce((sum, split) => sum + split.percentage, 0)
    if (Math.abs(totalPercentage - 100) > 0.01) {
      return NextResponse.json({ error: "Split percentages must total 100%" }, { status: 400 })
    }

    // Create split transactions
    const splitTransactions = await Promise.all(
      splits.map((split) =>
        db.transaction.create({
          data: {
            amount: split.amount,
            description: `${parentTransaction.description} (split)`,
            type: parentTransaction.type,
            date: parentTransaction.date,
            notes: parentTransaction.notes,
            userId: session.user.id,
            budgetId: parentTransaction.budgetId,
            categoryId: split.categoryId,
            parentTransactionId: params.id,
            splitPercentage: split.percentage,
          },
          include: {
            category: true,
          },
        })
      )
    )

    return NextResponse.json({ success: true, splits: splitTransactions }, { status: 201 })
  } catch (error) {
    console.error("Error creating split transactions:", error)
    return NextResponse.json({ error: "Failed to create split transactions" }, { status: 500 })
  }
}

// GET fetch split transactions for a parent
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const splits = await db.transaction.findMany({
      where: {
        parentTransactionId: params.id,
        userId: session.user.id,
      },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(splits)
  } catch (error) {
    console.error("Error fetching split transactions:", error)
    return NextResponse.json({ error: "Failed to fetch split transactions" }, { status: 500 })
  }
}
