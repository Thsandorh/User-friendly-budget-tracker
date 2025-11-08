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
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  ComposedChart,
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("reports.title")}</h1>
          <p className="text-muted-foreground">View detailed financial reports and analytics</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={handleExportCSV} variant="outline" className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            {t("reports.exportToCsv")}
          </Button>
          <Button onClick={handleExportPDF} className="w-full sm:w-auto">
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

      {/* Charts - First Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Income vs Expense Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t("reports.incomeVsExpense")}</CardTitle>
            <CardDescription>Total comparison (Donut Chart)</CardDescription>
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
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {incomeVsExpenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value, "HUF", locale)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget Utilization Radial Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Utilization</CardTitle>
            <CardDescription>Current budget usage percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="20%"
                outerRadius="90%"
                barSize={20}
                data={categories.slice(0, 5).map((cat, index) => {
                  const catTransactions = transactions.filter(t => t.categoryId === cat.id && t.type === 'expense')
                  const spent = catTransactions.reduce((sum, t) => sum + t.amount, 0)
                  const limit = cat.budgetLimit || 100000
                  return {
                    name: `${cat.icon} ${cat.name}`,
                    value: Math.min((spent / limit) * 100, 100),
                    fill: COLORS[index % COLORS.length]
                  }
                }).filter(item => item.value > 0)}
              >
                <RadialBar
                  label={{ position: 'insideStart', fill: '#fff', fontSize: 12 }}
                  background
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Second Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Breakdown with Gradient */}
        <Card>
          <CardHeader>
            <CardTitle>{t("reports.categoryBreakdown")}</CardTitle>
            <CardDescription>By spending category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryBreakdown}>
                <defs>
                  {categoryBreakdown.map((entry, index) => (
                    <linearGradient key={`gradient-${index}`} id={`colorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={entry.fill} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={entry.fill} stopOpacity={0.3}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value, "HUF", locale)} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} animationBegin={0} animationDuration={800}>
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#colorGradient${index})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top 5 Categories Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Spending Categories</CardTitle>
            <CardDescription>Most expensive categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryBreakdown.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  labelLine
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {categoryBreakdown.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value, "HUF", locale)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend Area Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t("reports.monthlyTrend")}</CardTitle>
          <CardDescription>Last 6 months with area visualization</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyTrendData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value, "HUF", locale)} />
              <Legend />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorIncome)"
                name={t("transactions.income")}
                animationBegin={0}
                animationDuration={800}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorExpense)"
                name={t("transactions.expense")}
                animationBegin={0}
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Comprehensive Overview - Composed Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Comprehensive Financial Overview</CardTitle>
          <CardDescription>Combined visualization of income, expenses, and balance</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={monthlyTrendData}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value, "HUF", locale)} />
              <Legend />
              <Area
                type="monotone"
                dataKey="income"
                fill="url(#colorBalance)"
                stroke="#10b981"
                strokeWidth={1}
                name={t("transactions.income")}
                animationBegin={0}
                animationDuration={800}
              />
              <Bar
                dataKey="expense"
                fill="#ef4444"
                radius={[8, 8, 0, 0]}
                name={t("transactions.expense")}
                animationBegin={0}
                animationDuration={800}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
                name="Net Income"
                animationBegin={0}
                animationDuration={800}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
