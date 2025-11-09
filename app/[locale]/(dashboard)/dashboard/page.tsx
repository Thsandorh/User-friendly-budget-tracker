// Dashboard page with overview and analytics
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { ensureDatabaseSchema } from "@/lib/auto-migrate"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { BudgetAlerts } from "@/components/budget-alerts"
import { DailyLimitCard } from "@/components/daily-limit-card"

export default async function DashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions)
  const t = await getTranslations()

  if (!session?.user?.id) {
    return null
  }

  // Ensure database schema is up to date
  await ensureDatabaseSchema()

  // Get current month start and end dates
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Get previous month dates for comparison
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  // Fetch user's transactions for the current month
  const transactions = await db.transaction.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      date: 'desc',
    },
  })

  // Fetch previous month's transactions for comparison
  const lastMonthTransactions = await db.transaction.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: startOfLastMonth,
        lte: endOfLastMonth,
      },
    },
  })

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  // Calculate previous month totals
  const lastMonthIncome = lastMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const lastMonthExpense = lastMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  // Calculate percentage changes
  const incomeChange = lastMonthIncome === 0
    ? (totalIncome > 0 ? 100 : 0)
    : ((totalIncome - lastMonthIncome) / lastMonthIncome) * 100

  const expenseChange = lastMonthExpense === 0
    ? (totalExpense > 0 ? 100 : 0)
    : ((totalExpense - lastMonthExpense) / lastMonthExpense) * 100

  // Fetch active budgets
  const budgets = await db.budget.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
    },
  })

  // Calculate budget alerts (budgets exceeding 80% of limit)
  const budgetAlerts = budgets.map(budget => {
    const budgetTransactions = transactions.filter(t =>
      t.type === 'expense' && t.budgetId === budget.id
    )
    const spent = budgetTransactions.reduce((sum, t) => sum + t.amount, 0)
    const percentage = (spent / budget.amount) * 100

    return {
      budgetName: budget.name,
      spent,
      limit: budget.amount,
      percentage,
      currency: budget.currency,
    }
  }).filter(alert => alert.percentage >= 80) // Only show alerts at 80% or more

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("dashboard.welcome", { name: session.user.name })}
        </h1>
        <p className="text-muted-foreground">{t("dashboard.overview")}</p>
      </div>

      {/* Budget Alerts */}
      <BudgetAlerts alerts={budgetAlerts} locale={locale} />

      {/* Daily Limit Card */}
      <DailyLimitCard />

      {/* Overview cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.totalIncome")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome, "HUF", locale)}
            </div>
            <p className="text-xs flex items-center gap-1">
              <span className="text-muted-foreground">{t("dashboard.thisMonth")}</span>
              {incomeChange !== 0 && (
                <span className={incomeChange > 0 ? "text-green-600" : "text-red-600"}>
                  {incomeChange > 0 ? "+" : ""}{incomeChange.toFixed(1)}%
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.totalExpense")}
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpense, "HUF", locale)}
            </div>
            <p className="text-xs flex items-center gap-1">
              <span className="text-muted-foreground">{t("dashboard.thisMonth")}</span>
              {expenseChange !== 0 && (
                <span className={expenseChange > 0 ? "text-red-600" : "text-green-600"}>
                  {expenseChange > 0 ? "+" : ""}{expenseChange.toFixed(1)}%
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("dashboard.balance")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(balance, "HUF", locale)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("dashboard.thisMonth")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("budgets.title")}
            </CardTitle>
            <Wallet className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {budgets.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("budgets.isActive")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.recentTransactions")}</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t("dashboard.noTransactions")}</p>
              <p className="text-sm">{t("dashboard.addFirstTransaction")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-600' : 'bg-red-600'
                    }`} />
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category?.name || t("categories.uncategorized")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount, "HUF", locale)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString(locale)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
