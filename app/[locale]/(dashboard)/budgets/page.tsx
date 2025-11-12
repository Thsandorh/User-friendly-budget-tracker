// Budgets page - displays all budgets with create/edit/delete functionality
"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { formatCurrency, formatDateShort } from "@/lib/utils"
import { BudgetDialog } from "@/components/budget-dialog"
import { useToast } from "@/components/ui/use-toast"
import { DailyLimitCard } from "@/components/daily-limit-card"
import { WeeklyLimitCard } from "@/components/weekly-limit-card"
import { MonthlyLimitCard } from "@/components/monthly-limit-card"

export default function BudgetsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations()
  const { toast } = useToast()
  const [budgets, setBudgets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<any>(null)

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/budgets')
      if (response.ok) {
        const data = await response.json()
        setBudgets(data)
      }
    } catch (error) {
      console.error('Error fetching budgets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t("budgets.deleteConfirm"))) return

    try {
      const response = await fetch(`/api/budgets/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast({ title: t("budgets.deleteSuccess") })
        fetchBudgets()
      }
    } catch (error) {
      toast({ title: t("errors.generic"), variant: "destructive" })
    }
  }

  const handleEdit = (budget: any) => {
    setEditingBudget(budget)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingBudget(null)
    fetchBudgets()
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">{t("common.loading")}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("budgets.title")}</h1>
          <p className="text-muted-foreground">Manage your budgets</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t("budgets.addBudget")}
        </Button>
      </div>

      {/* Spending Limit Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{locale === 'hu' ? 'Költési Limitek' : 'Spending Limits'}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <DailyLimitCard />
          <WeeklyLimitCard />
          <MonthlyLimitCard />
        </div>
      </div>

      {/* Budget List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{locale === 'hu' ? 'Költségvetések' : 'Budgets'}</h2>
      {budgets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">{t("dashboard.noBudgets")}</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("budgets.addBudget")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <Card key={budget.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {budget.name}
                  {budget.isActive && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {t("budgets.isActive")}
                    </span>
                  )}
                </CardTitle>
                <CardDescription>{budget.period === 'monthly' ? t("budgets.monthly") : budget.period}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(budget.amount, budget.currency, locale)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDateShort(budget.startDate, locale)} - {budget.endDate ? formatDateShort(budget.endDate, locale) : '∞'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(budget)} className="flex-1">
                    {t("common.edit")}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(budget.id)} className="flex-1">
                    {t("common.delete")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>

      <BudgetDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        budget={editingBudget}
      />
    </div>
  )
}
