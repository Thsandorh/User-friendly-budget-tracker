// Recurring transactions page - full implementation
"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Power, PowerOff } from "lucide-react"
import { formatCurrency, formatDateShort } from "@/lib/utils"
import { RecurringDialog } from "@/components/recurring-dialog"
import { useToast } from "@/components/ui/use-toast"

export default function RecurringPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations()
  const { toast } = useToast()
  const [recurringTransactions, setRecurringTransactions] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRecurring, setEditingRecurring] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [recurringRes, categoriesRes] = await Promise.all([
        fetch('/api/recurring'),
        fetch('/api/categories')
      ])

      if (recurringRes.ok && categoriesRes.ok) {
        const recurringData = await recurringRes.json()
        const categoriesData = await categoriesRes.json()
        setRecurringTransactions(recurringData)
        setCategories(categoriesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/recurring/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        toast({ title: t("recurring.updateSuccess") })
        fetchData()
      }
    } catch (error) {
      toast({ title: t("errors.generic"), variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t("recurring.deleteConfirm"))) return

    try {
      const response = await fetch(`/api/recurring/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast({ title: t("recurring.deleteSuccess") })
        fetchData()
      }
    } catch (error) {
      toast({ title: t("errors.generic"), variant: "destructive" })
    }
  }

  const handleEdit = (recurring: any) => {
    setEditingRecurring(recurring)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingRecurring(null)
    fetchData()
  }

  const getNextOccurrence = (recurring: any) => {
    const now = new Date()
    const startDate = new Date(recurring.startDate)

    if (startDate > now) return formatDateShort(startDate, locale)

    // Simple calculation for display purposes
    let nextDate = new Date(startDate)

    switch (recurring.frequency) {
      case 'daily':
        while (nextDate < now) {
          nextDate.setDate(nextDate.getDate() + 1)
        }
        break
      case 'weekly':
        while (nextDate < now) {
          nextDate.setDate(nextDate.getDate() + 7)
        }
        break
      case 'monthly':
        while (nextDate < now) {
          nextDate.setMonth(nextDate.getMonth() + 1)
        }
        break
      case 'yearly':
        while (nextDate < now) {
          nextDate.setFullYear(nextDate.getFullYear() + 1)
        }
        break
    }

    if (recurring.endDate && nextDate > new Date(recurring.endDate)) {
      return "Ended"
    }

    return formatDateShort(nextDate, locale)
  }

  const activeRecurring = recurringTransactions.filter(r => r.isActive)
  const inactiveRecurring = recurringTransactions.filter(r => !r.isActive)

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">{t("common.loading")}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("recurring.title")}</h1>
          <p className="text-muted-foreground">Manage recurring income and expenses</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t("recurring.addRecurring")}
        </Button>
      </div>

      {/* Active Recurring Transactions */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Power className="h-5 w-5 text-green-600" />
          Active ({activeRecurring.length})
        </h2>
        {activeRecurring.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No active recurring transactions yet
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeRecurring.map((recurring) => (
              <Card key={recurring.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {recurring.category?.icon} {recurring.description}
                    </span>
                    <span className={`text-lg ${recurring.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {recurring.type === 'income' ? '+' : '-'}
                      {formatCurrency(recurring.amount, "HUF", locale)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t("recurring.frequency")}</p>
                      <p className="font-medium">
                        {t(`recurring.${recurring.frequency}`)}
                        {recurring.frequency === 'weekly' && ` (Day ${recurring.dayOfWeek})`}
                        {recurring.frequency === 'monthly' && ` (Day ${recurring.dayOfMonth})`}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("recurring.nextOccurrence")}</p>
                      <p className="font-medium">{getNextOccurrence(recurring)}</p>
                    </div>
                  </div>

                  {recurring.category && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">{t("transactions.category")}</p>
                      <p className="font-medium">{recurring.category.name}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(recurring)} className="flex-1">
                      {t("common.edit")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(recurring.id, recurring.isActive)}
                      className="flex-1"
                    >
                      <PowerOff className="mr-1 h-3 w-3" />
                      Deactivate
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(recurring.id)}>
                      {t("common.delete")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Inactive Recurring Transactions */}
      {inactiveRecurring.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <PowerOff className="h-5 w-5 text-gray-600" />
            Inactive ({inactiveRecurring.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {inactiveRecurring.map((recurring) => (
              <Card key={recurring.id} className="opacity-60">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {recurring.category?.icon} {recurring.description}
                    </span>
                    <span className={`text-lg ${recurring.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {recurring.type === 'income' ? '+' : '-'}
                      {formatCurrency(recurring.amount, "HUF", locale)}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground">{t("recurring.frequency")}</p>
                    <p className="font-medium">{t(`recurring.${recurring.frequency}`)}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(recurring.id, recurring.isActive)}
                      className="flex-1"
                    >
                      <Power className="mr-1 h-3 w-3" />
                      Activate
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(recurring.id)}>
                      {t("common.delete")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <RecurringDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        recurring={editingRecurring}
        categories={categories}
      />
    </div>
  )
}
