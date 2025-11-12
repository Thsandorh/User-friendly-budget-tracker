// User registration API endpoint
import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { db } from "@/lib/db"
import { ensureDatabaseSchema } from "@/lib/auto-migrate"

export async function POST(req: Request) {
  // Auto-create database tables on first request
  await ensureDatabaseSchema()

  try {
    const { email, password, name } = await req.json()

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      }
    })

    // Return user without password
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    })
  } catch (error) {
    console.error("Registration error:", error)
    // Return detailed error in development/staging
    const errorMessage = error instanceof Error ? error.message : "Internal server error"
    const errorDetails = process.env.NODE_ENV === "production"
      ? { error: "Internal server error" }
      : { error: "Internal server error", details: errorMessage }

    return NextResponse.json(errorDetails, { status: 500 })
  }
}
