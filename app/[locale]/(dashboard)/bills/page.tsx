// Bill Reminders page - displays upcoming bills with create/edit/delete functionality
"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Receipt, CheckCircle2, AlertCircle } from "lucide-react"
import { formatCurrency, formatDateShort } from "@/lib/utils"
import { BillReminderDialog } from "@/components/bill-reminder-dialog"
import { useToast } from "@/components/ui/use-toast"

export default function BillsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations()
  const { toast } = useToast()
  const [bills, setBills] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBill, setEditingBill] = useState<any>(null)
  const [filter, setFilter] = useState<"all" | "unpaid" | "paid">("all")

  useEffect(() => {
    fetchBills()
    fetchCategories()
  }, [])

  const fetchBills = async () => {
    try {
      const response = await fetch('/api/bills')
      if (response.ok) {
        const data = await response.json()
        setBills(data)
      }
    } catch (error) {
      console.error('Error fetching bills:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.filter((c: any) => c.type === 'expense'))
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t("bills.deleteConfirm"))) return

    try {
      const response = await fetch(`/api/bills/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast({ title: t("bills.deleteSuccess") })
        fetchBills()
      }
    } catch (error) {
      toast({ title: t("errors.generic"), variant: "destructive" })
    }
  }

  const handleEdit = (bill: any) => {
    setEditingBill(bill)
    setIsDialogOpen(true)
  }

  const handleMarkPaid = async (bill: any) => {
    try {
      const response = await fetch(`/api/bills/${bill.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bill,
          isPaid: !bill.isPaid,
        }),
      })

      if (response.ok) {
        toast({ title: bill.isPaid ? t("bills.markedUnpaid") : t("bills.markedPaid") })
        fetchBills()
      }
    } catch (error) {
      toast({ title: t("errors.generic"), variant: "destructive" })
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingBill(null)
    fetchBills()
  }

  const filteredBills = bills.filter(bill => {
    if (filter === "paid") return bill.isPaid
    if (filter === "unpaid") return !bill.isPaid
    return true
  })

  const upcomingBills = filteredBills.filter(b => !b.isPaid && new Date(b.dueDate) >= new Date())
  const overdueBills = filteredBills.filter(b => !b.isPaid && new Date(b.dueDate) < new Date())
  const paidBills = filteredBills.filter(b => b.isPaid)

  const totalUpcoming = upcomingBills.reduce((sum, b) => sum + b.amount, 0)
  const totalOverdue = overdueBills.reduce((sum, b) => sum + b.amount, 0)

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">{t("common.loading")}</div>
  }

  const BillCard = ({ bill }: { bill: any }) => {
    const dueDate = new Date(bill.dueDate)
    const today = new Date()
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const isOverdue = daysUntilDue < 0 && !bill.isPaid
    const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 7 && !bill.isPaid

    return (
      <Card className={`${isOverdue ? 'border-red-300 dark:border-red-800' : isDueSoon ? 'border-yellow-300 dark:border-yellow-800' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {bill.category?.icon && <span className="text-xl">{bill.category.icon}</span>}
              {bill.name}
            </span>
            <div className="flex items-center gap-2">
              {bill.isPaid ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {t("bills.paid")}
                </Badge>
              ) : isOverdue ? (
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {t("bills.overdue")}
                </Badge>
              ) : isDueSoon ? (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  {t("bills.dueSoon")}
                </Badge>
              ) : null}
              {bill.isRecurring && (
                <Badge variant="outline">{t("bills." + bill.frequency)}</Badge>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            {t("bills.due")}: {formatDateShort(bill.dueDate, locale)}
            {!bill.isPaid && daysUntilDue >= 0 && ` (${daysUntilDue} ${t("bills.daysLeft")})`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-2xl font-bold">
            {formatCurrency(bill.amount, bill.currency, locale)}
          </div>

          {bill.category && (
            <div className="text-sm text-muted-foreground">
              {t("transactions.category")}: {bill.category.icon} {bill.category.name}
            </div>
          )}

          {bill.notes && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {bill.notes}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            {!bill.isPaid && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkPaid(bill)}
                className="flex-1"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                {t("bills.markPaid")}
              </Button>
            )}
            {bill.isPaid && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkPaid(bill)}
                className="flex-1"
              >
                {t("bills.markUnpaid")}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => handleEdit(bill)}>
              {t("common.edit")}
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleDelete(bill.id)}>
              {t("common.delete")}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("bills.title")}</h1>
          <p className="text-muted-foreground">{t("bills.subtitle")}</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t("bills.addBill")}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("bills.upcomingBills")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalUpcoming, "HUF", locale)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {upcomingBills.length} {t("bills.bills")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("bills.overdueBills")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOverdue, "HUF", locale)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overdueBills.length} {t("bills.bills")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("bills.paidBills")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paidBills.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("bills.thisMonth")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          {t("bills.all")}
        </Button>
        <Button
          variant={filter === "unpaid" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unpaid")}
        >
          {t("bills.unpaid")}
        </Button>
        <Button
          variant={filter === "paid" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("paid")}
        >
          {t("bills.paid")}
        </Button>
      </div>

      {/* Bills List */}
      {filteredBills.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{t("bills.noBills")}</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("bills.addBill")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBills.map((bill) => (
            <BillCard key={bill.id} bill={bill} />
          ))}
        </div>
      )}

      <BillReminderDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        bill={editingBill}
        categories={categories}
      />
    </div>
  )
}
