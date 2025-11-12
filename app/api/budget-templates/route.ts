// API route for budget templates - predefined and custom templates
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { ensureDatabaseSchema } from "@/lib/auto-migrate"

// Predefined public templates
const PUBLIC_TEMPLATES = [
  {
    id: "50-30-20",
    name: "50/30/20 Rule",
    description: "50% needs, 30% wants, 20% savings",
    categories: [
      { name: "Needs (Housing, Food, Transport)", percentage: 50, type: "expense" },
      { name: "Wants (Entertainment, Dining)", percentage: 30, type: "expense" },
      { name: "Savings & Debt", percentage: 20, type: "income" },
    ],
    isPublic: true,
  },
  {
    id: "70-20-10",
    name: "70/20/10 Budget",
    description: "70% living expenses, 20% savings, 10% fun",
    categories: [
      { name: "Living Expenses", percentage: 70, type: "expense" },
      { name: "Savings", percentage: 20, type: "income" },
      { name: "Fun Money", percentage: 10, type: "expense" },
    ],
    isPublic: true,
  },
  {
    id: "zero-based",
    name: "Zero-Based Budget",
    description: "Every dollar has a purpose",
    categories: [
      { name: "Housing", percentage: 30, type: "expense" },
      { name: "Food", percentage: 15, type: "expense" },
      { name: "Transportation", percentage: 15, type: "expense" },
      { name: "Savings", percentage: 20, type: "income" },
      { name: "Debt Payment", percentage: 10, type: "expense" },
      { name: "Personal", percentage: 10, type: "expense" },
    ],
    isPublic: true,
  },
]

// GET all templates (public + user's custom)
export async function GET() {
  await ensureDatabaseSchema()

  try {
    const session = await getServerSession(authOptions)

    // Return public templates for non-authenticated users
    if (!session?.user?.id) {
      return NextResponse.json({ templates: PUBLIC_TEMPLATES })
    }

    // Fetch user's custom templates
    const customTemplates = await db.budgetTemplate.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      templates: [...PUBLIC_TEMPLATES, ...customTemplates]
    })
  } catch (error) {
    console.error("Error fetching budget templates:", error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}

// POST create custom template
export async function POST(req: Request) {
  await ensureDatabaseSchema()

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    const template = await db.budgetTemplate.create({
      data: {
        name: data.name,
        description: data.description || null,
        categories: data.categories,
        isPublic: false,
        userId: session.user.id,
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error("Error creating budget template:", error)
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
  }
}
