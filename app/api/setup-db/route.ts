// Database setup endpoint - run this once to create tables
import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST() {
  try {
    // Try to create tables using raw SQL
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    `)

    await db.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    `)

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Budget" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "currency" TEXT NOT NULL DEFAULT 'HUF',
        "period" TEXT NOT NULL,
        "startDate" TIMESTAMP(3) NOT NULL,
        "endDate" TIMESTAMP(3),
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "userId" TEXT NOT NULL,
        CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
      );
    `)

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Category" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "icon" TEXT NOT NULL DEFAULT '📁',
        "color" TEXT NOT NULL DEFAULT '#3b82f6',
        "type" TEXT NOT NULL,
        "budgetLimit" DOUBLE PRECISION,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "userId" TEXT NOT NULL,
        "budgetId" TEXT,
        CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
      );
    `)

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Transaction" (
        "id" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "description" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "userId" TEXT NOT NULL,
        "budgetId" TEXT,
        "categoryId" TEXT,
        "recurringTransactionId" TEXT,
        CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
      );
    `)

    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "RecurringTransaction" (
        "id" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "description" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "frequency" TEXT NOT NULL,
        "startDate" TIMESTAMP(3) NOT NULL,
        "endDate" TIMESTAMP(3),
        "dayOfMonth" INTEGER,
        "dayOfWeek" INTEGER,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "lastProcessed" TIMESTAMP(3),
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "userId" TEXT NOT NULL,
        "categoryId" TEXT,
        CONSTRAINT "RecurringTransaction_pkey" PRIMARY KEY ("id")
      );
    `)

    // Add foreign keys if they don't exist
    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `)
    } catch (e) {
      // Foreign key might already exist
    }

    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `)
    } catch (e) {
      // Foreign key might already exist
    }

    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "Category" ADD CONSTRAINT "Category_budgetId_fkey"
        FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `)
    } catch (e) {
      // Foreign key might already exist
    }

    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `)
    } catch (e) {
      // Foreign key might already exist
    }

    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_budgetId_fkey"
        FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      `)
    } catch (e) {
      // Foreign key might already exist
    }

    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey"
        FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      `)
    } catch (e) {
      // Foreign key might already exist
    }

    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_recurringTransactionId_fkey"
        FOREIGN KEY ("recurringTransactionId") REFERENCES "RecurringTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      `)
    } catch (e) {
      // Foreign key might already exist
    }

    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "RecurringTransaction" ADD CONSTRAINT "RecurringTransaction_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `)
    } catch (e) {
      // Foreign key might already exist
    }

    try {
      await db.$executeRawUnsafe(`
        ALTER TABLE "RecurringTransaction" ADD CONSTRAINT "RecurringTransaction_categoryId_fkey"
        FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      `)
    } catch (e) {
      // Foreign key might already exist
    }

    return NextResponse.json({
      success: true,
      message: "Database tables created successfully!",
      tables: ["User", "Budget", "Category", "Transaction", "RecurringTransaction"]
    })
  } catch (error) {
    console.error("Database setup error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create database tables",
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
