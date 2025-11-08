// Reports page with charts and export functionality
"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { exportToCSV, exportToPDF } from "@/lib/export"
import { useToast } from "@/components/ui/use-toast"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export default function ReportsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations()
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [transactionsRes, categoriesRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/categories')
      ])

      if (transactionsRes.ok && categoriesRes.ok) {
        const transactionsData = await transactionsRes.json()
        const categoriesData = await categoriesRes.json()
        setTransactions(transactionsData)
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate statistics
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense

  // Income vs Expense data
  const incomeVsExpenseData = [
    { name: t("transactions.income"), value: totalIncome, fill: '#10b981' },
    { name: t("transactions.expense"), value: totalExpense, fill: '#ef4444' }
  ]

  // Category breakdown
  const categoryBreakdown = categories.map((cat, index) => {
    const catTransactions = transactions.filter(t => t.categoryId === cat.id)
    const total = catTransactions.reduce((sum, t) => sum + t.amount, 0)
    return {
      name: `${cat.icon} ${cat.name}`,
      value: total,
      fill: COLORS[index % COLORS.length]
    }
  }).filter(cat => cat.value > 0)

  // Monthly trend
  const monthlyData = transactions.reduce((acc: any, t) => {
    const month = new Date(t.date).toLocaleDateString(locale, { year: 'numeric', month: 'short' })
    if (!acc[month]) {
      acc[month] = { month, income: 0, expense: 0 }
    }
    if (t.type === 'income') {
      acc[month].income += t.amount
    } else {
      acc[month].expense += t.amount
    }
    return acc
  }, {})

  const monthlyTrendData = Object.values(monthlyData).slice(-6) // Last 6 months

  const handleExportCSV = () => {
    try {
      exportToCSV(transactions, `transactions-${new Date().toISOString().split('T')[0]}.csv`)
      toast({ title: "Exported to CSV successfully!" })
    } catch (error) {
      toast({ title: t("errors.generic"), variant: "destructive" })
    }
  }

  const handleExportPDF = () => {
    try {
      exportToPDF(
        transactions,
        { income: totalIncome, expense: totalExpense, balance },
        `transactions-${new Date().toISOString().split('T')[0]}.pdf`
      )
      toast({ title: "Exported to PDF successfully!" })
    } catch (error) {
      toast({ title: t("errors.generic"), variant: "destructive" })
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">{t("common.loading")}</div>
  }

  if (transactions.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{t("reports.title")}</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t("reports.noData")}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("reports.title")}</h1>
          <p className="text-muted-foreground">View detailed financial reports and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t("reports.exportToCsv")}
          </Button>
          <Button onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            {t("reports.exportToPdf")}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t("dashboard.totalIncome")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome, "HUF", locale)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t("dashboard.totalExpense")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpense, "HUF", locale)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t("dashboard.balance")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(balance, "HUF", locale)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Income vs Expense Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t("reports.incomeVsExpense")}</CardTitle>
            <CardDescription>Total comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeVsExpenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {incomeVsExpenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value, "HUF", locale)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>{t("reports.categoryBreakdown")}</CardTitle>
            <CardDescription>By spending category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value, "HUF", locale)} />
                <Bar dataKey="value" fill="#3b82f6">
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle>{t("reports.monthlyTrend")}</CardTitle>
          <CardDescription>Last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value, "HUF", locale)} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name={t("transactions.income")} />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} name={t("transactions.expense")} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
