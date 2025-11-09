// Automatic database migration on first request
import { db } from "./db"

let schemaEnsured = false

export async function ensureDatabaseSchema() {
  // If already ensured successfully, skip
  if (schemaEnsured) return

  console.log("🔧 Ensuring database schema (tables, columns, and constraints)...")

  try {
    // ALWAYS run CREATE TABLE IF NOT EXISTS - they are safe to run multiple times
    // The IF NOT EXISTS clause prevents errors if tables already exist
    await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "User_pkey" PRIMARY KEY ("id")
        )
      `)

      await db.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`)

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
        )
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
        )
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
          "parentTransactionId" TEXT,
          "splitPercentage" DOUBLE PRECISION,
          CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
        )
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
        )
      `)

      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "SavingsGoal" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "targetAmount" DOUBLE PRECISION NOT NULL,
          "currentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
          "currency" TEXT NOT NULL DEFAULT 'HUF',
          "deadline" TIMESTAMP(3),
          "icon" TEXT NOT NULL DEFAULT '🎯',
          "color" TEXT NOT NULL DEFAULT '#10b981',
          "isCompleted" BOOLEAN NOT NULL DEFAULT false,
          "notes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          "userId" TEXT NOT NULL,
          CONSTRAINT "SavingsGoal_pkey" PRIMARY KEY ("id")
        )
      `)

      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "BillReminder" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "amount" DOUBLE PRECISION NOT NULL,
          "currency" TEXT NOT NULL DEFAULT 'HUF',
          "dueDate" TIMESTAMP(3) NOT NULL,
          "isPaid" BOOLEAN NOT NULL DEFAULT false,
          "isRecurring" BOOLEAN NOT NULL DEFAULT false,
          "frequency" TEXT,
          "notes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          "userId" TEXT NOT NULL,
          "categoryId" TEXT,
          CONSTRAINT "BillReminder_pkey" PRIMARY KEY ("id")
        )
      `)

      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Asset" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "value" DOUBLE PRECISION NOT NULL,
          "currency" TEXT NOT NULL DEFAULT 'HUF',
          "icon" TEXT NOT NULL DEFAULT '💰',
          "notes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          "userId" TEXT NOT NULL,
          CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
        )
      `)

      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Liability" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "balance" DOUBLE PRECISION NOT NULL,
          "currency" TEXT NOT NULL DEFAULT 'HUF',
          "interestRate" DOUBLE PRECISION,
          "icon" TEXT NOT NULL DEFAULT '💳',
          "notes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          "userId" TEXT NOT NULL,
          CONSTRAINT "Liability_pkey" PRIMARY KEY ("id")
        )
      `)

      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "BudgetTemplate" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "categories" JSONB NOT NULL,
          "isPublic" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          "userId" TEXT,
          CONSTRAINT "BudgetTemplate_pkey" PRIMARY KEY ("id")
        )
      `)

      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "CategorizationRule" (
          "id" TEXT NOT NULL,
          "pattern" TEXT NOT NULL,
          "categoryId" TEXT NOT NULL,
          "priority" INTEGER NOT NULL DEFAULT 0,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          "userId" TEXT NOT NULL,
          CONSTRAINT "CategorizationRule_pkey" PRIMARY KEY ("id")
        )
      `)

      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "DailyLimit" (
          "id" TEXT NOT NULL,
          "amount" DOUBLE PRECISION NOT NULL,
          "currency" TEXT NOT NULL DEFAULT 'HUF',
          "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "notes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          "userId" TEXT NOT NULL,
          CONSTRAINT "DailyLimit_pkey" PRIMARY KEY ("id")
        )
      `)

      await db.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "DailyLimit_userId_date_key"
        ON "DailyLimit"("userId", "date")
      `)

      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "WeeklyLimit" (
          "id" TEXT NOT NULL,
          "amount" DOUBLE PRECISION NOT NULL,
          "currency" TEXT NOT NULL DEFAULT 'HUF',
          "weekStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "notes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          "userId" TEXT NOT NULL,
          CONSTRAINT "WeeklyLimit_pkey" PRIMARY KEY ("id")
        )
      `)

      await db.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "WeeklyLimit_userId_weekStart_key"
        ON "WeeklyLimit"("userId", "weekStart")
      `)

      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "MonthlyLimit" (
          "id" TEXT NOT NULL,
          "amount" DOUBLE PRECISION NOT NULL,
          "currency" TEXT NOT NULL DEFAULT 'HUF',
          "monthStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "notes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          "userId" TEXT NOT NULL,
          CONSTRAINT "MonthlyLimit_pkey" PRIMARY KEY ("id")
        )
      `)

      await db.$executeRawUnsafe(`
        CREATE UNIQUE INDEX IF NOT EXISTS "MonthlyLimit_userId_monthStart_key"
        ON "MonthlyLimit"("userId", "monthStart")
      `)

      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "TransactionTemplate" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "amount" DOUBLE PRECISION NOT NULL,
          "description" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "icon" TEXT NOT NULL DEFAULT '⭐',
          "color" TEXT NOT NULL DEFAULT '#3b82f6',
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "useCount" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          "userId" TEXT NOT NULL,
          "categoryId" TEXT,
          CONSTRAINT "TransactionTemplate_pkey" PRIMARY KEY ("id")
        )
      `)

      await db.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ReceiptPhoto" (
          "id" TEXT NOT NULL,
          "url" TEXT NOT NULL,
          "fileName" TEXT NOT NULL,
          "fileSize" INTEGER,
          "mimeType" TEXT NOT NULL DEFAULT 'image/jpeg',
          "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "transactionId" TEXT NOT NULL,
          CONSTRAINT "ReceiptPhoto_pkey" PRIMARY KEY ("id")
        )
      `)

    // STEP 1: Add new columns FIRST (before foreign keys that reference them)
    await db.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'Transaction' AND column_name = 'parentTransactionId'
        ) THEN
          ALTER TABLE "Transaction" ADD COLUMN "parentTransactionId" TEXT;
        END IF;
      END $$
    `)

    await db.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'Transaction' AND column_name = 'splitPercentage'
        ) THEN
          ALTER TABLE "Transaction" ADD COLUMN "splitPercentage" DOUBLE PRECISION;
        END IF;
      END $$
    `)

    // STEP 2: Add foreign keys - each in a separate transaction-safe block
      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Budget_userId_fkey') THEN
            ALTER TABLE "Budget" ADD CONSTRAINT "Budget_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$
      `)

      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Category_userId_fkey') THEN
            ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$
      `)

      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Category_budgetId_fkey') THEN
            ALTER TABLE "Category" ADD CONSTRAINT "Category_budgetId_fkey"
            FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$
      `)

      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Transaction_userId_fkey') THEN
            ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$
      `)

      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Transaction_budgetId_fkey') THEN
            ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_budgetId_fkey"
            FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;
          END IF;
        END $$
      `)

      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Transaction_categoryId_fkey') THEN
            ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_categoryId_fkey"
            FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
          END IF;
        END $$
      `)

      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Transaction_recurringTransactionId_fkey') THEN
            ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_recurringTransactionId_fkey"
            FOREIGN KEY ("recurringTransactionId") REFERENCES "RecurringTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
          END IF;
        END $$
      `)

      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Transaction_parentTransactionId_fkey') THEN
            ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_parentTransactionId_fkey"
            FOREIGN KEY ("parentTransactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$
      `)

      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RecurringTransaction_userId_fkey') THEN
            ALTER TABLE "RecurringTransaction" ADD CONSTRAINT "RecurringTransaction_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$
      `)

      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RecurringTransaction_categoryId_fkey') THEN
            ALTER TABLE "RecurringTransaction" ADD CONSTRAINT "RecurringTransaction_categoryId_fkey"
            FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
          END IF;
        END $$
      `)

      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SavingsGoal_userId_fkey') THEN
            ALTER TABLE "SavingsGoal" ADD CONSTRAINT "SavingsGoal_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$
      `)

      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BillReminder_userId_fkey') THEN
            ALTER TABLE "BillReminder" ADD CONSTRAINT "BillReminder_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$
      `)

      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BillReminder_categoryId_fkey') THEN
            ALTER TABLE "BillReminder" ADD CONSTRAINT "BillReminder_categoryId_fkey"
            FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
          END IF;
        END $$
      `)

      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Asset_userId_fkey') THEN
            ALTER TABLE "Asset" ADD CONSTRAINT "Asset_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$
      `)

      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Liability_userId_fkey') THEN
            ALTER TABLE "Liability" ADD CONSTRAINT "Liability_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$
      `)

      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BudgetTemplate_userId_fkey') THEN
            ALTER TABLE "BudgetTemplate" ADD CONSTRAINT "BudgetTemplate_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$
      `)

      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CategorizationRule_userId_fkey') THEN
            ALTER TABLE "CategorizationRule" ADD CONSTRAINT "CategorizationRule_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$
      `)

      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DailyLimit_userId_fkey') THEN
            ALTER TABLE "DailyLimit" ADD CONSTRAINT "DailyLimit_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$
      `)

      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'WeeklyLimit_userId_fkey') THEN
            ALTER TABLE "WeeklyLimit" ADD CONSTRAINT "WeeklyLimit_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$
      `)

      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'MonthlyLimit_userId_fkey') THEN
            ALTER TABLE "MonthlyLimit" ADD CONSTRAINT "MonthlyLimit_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$
      `)

      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TransactionTemplate_userId_fkey') THEN
            ALTER TABLE "TransactionTemplate" ADD CONSTRAINT "TransactionTemplate_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$
      `)

      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'TransactionTemplate_categoryId_fkey') THEN
            ALTER TABLE "TransactionTemplate" ADD CONSTRAINT "TransactionTemplate_categoryId_fkey"
            FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
          END IF;
        END $$
      `)

      await db.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ReceiptPhoto_transactionId_fkey') THEN
            ALTER TABLE "ReceiptPhoto" ADD CONSTRAINT "ReceiptPhoto_transactionId_fkey"
            FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$
      `)

    console.log("✅ Database schema ensured successfully!")
    schemaEnsured = true
  } catch (err) {
    console.error("❌ Failed to ensure database schema:", err)
    throw err // Re-throw to let caller know it failed
  }
}
