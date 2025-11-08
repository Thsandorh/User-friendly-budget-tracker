// API route for net worth - GET all assets and liabilities
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { ensureDatabaseSchema } from "@/lib/auto-migrate"

export async function GET() {
  await ensureDatabaseSchema()

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [assets, liabilities] = await Promise.all([
      db.asset.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' } }),
      db.liability.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: 'desc' } })
    ])

    const totalAssets = assets.reduce((sum, a) => sum + a.value, 0)
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.balance, 0)
    const netWorth = totalAssets - totalLiabilities

    return NextResponse.json({ assets, liabilities, totalAssets, totalLiabilities, netWorth })
  } catch (error) {
    console.error("Error fetching net worth:", error)
    return NextResponse.json({ error: "Failed to fetch net worth" }, { status: 500 })
  }
}
