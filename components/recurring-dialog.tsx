// Recurring transaction dialog for creating and editing
"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface RecurringDialogProps {
  open: boolean
  onClose: () => void
  recurring?: any
  categories: any[]
}

const DAYS_OF_WEEK = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
]

export function RecurringDialog({ open, onClose, recurring, categories }: RecurringDialogProps) {
  const t = useTranslations()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    type: "expense",
    frequency: "monthly",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    dayOfMonth: "1",
    dayOfWeek: "1",
    categoryId: "",
    notes: "",
  })

  useEffect(() => {
    if (recurring) {
      setFormData({
        amount: recurring.amount.toString(),
        description: recurring.description,
        type: recurring.type,
        frequency: recurring.frequency,
        startDate: new Date(recurring.startDate).toISOString().split('T')[0],
        endDate: recurring.endDate ? new Date(recurring.endDate).toISOString().split('T')[0] : "",
        dayOfMonth: recurring.dayOfMonth?.toString() || "1",
        dayOfWeek: recurring.dayOfWeek?.toString() || "1",
        categoryId: recurring.categoryId || "",
        notes: recurring.notes || "",
      })
    } else {
      setFormData({
        amount: "",
        description: "",
        type: "expense",
        frequency: "monthly",
        startDate: new Date().toISOString().split('T')[0],
        endDate: "",
        dayOfMonth: "1",
        dayOfWeek: "1",
        categoryId: "",
        notes: "",
      })
    }
  }, [recurring, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = recurring ? `/api/recurring/${recurring.id}` : '/api/recurring'
      const method = recurring ? 'PATCH' : 'POST'

      const dataToSend = {
        ...formData,
        dayOfMonth: formData.frequency === 'monthly' ? formData.dayOfMonth : null,
        dayOfWeek: formData.frequency === 'weekly' ? formData.dayOfWeek : null,
        categoryId: formData.categoryId || null,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      })

      if (response.ok) {
        toast({
          title: recurring ? t("recurring.updateSuccess") : t("recurring.createSuccess"),
        })
        onClose()
      } else {
        toast({
          title: t("errors.generic"),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t("errors.generic"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {recurring ? t("recurring.editRecurring") : t("recurring.addRecurring")}
          </DialogTitle>
          <DialogDescription>
            {recurring ? "Edit recurring transaction details" : "Create a new recurring transaction"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("transactions.type")}</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">{t("transactions.income")}</SelectItem>
                    <SelectItem value="expense">{t("transactions.expense")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">{t("transactions.amount")}</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("transactions.description")}</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("recurring.frequency")}</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">{t("recurring.daily")}</SelectItem>
                    <SelectItem value="weekly">{t("recurring.weekly")}</SelectItem>
                    <SelectItem value="monthly">{t("recurring.monthly")}</SelectItem>
                    <SelectItem value="yearly">{t("recurring.yearly")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("transactions.category")}</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("transactions.selectCategory")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => cat.type === formData.type).map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.frequency === 'monthly' && (
              <div className="space-y-2">
                <Label htmlFor="dayOfMonth">{t("recurring.dayOfMonth")}</Label>
                <Input
                  id="dayOfMonth"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dayOfMonth}
                  onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
                />
              </div>
            )}

            {formData.frequency === 'weekly' && (
              <div className="space-y-2">
                <Label>{t("recurring.dayOfWeek")}</Label>
                <Select
                  value={formData.dayOfWeek}
                  onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">{t("recurring.startDate")}</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">{t("recurring.endDate")} ({t("categories.optional")})</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t("transactions.notes")}</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("common.loading") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
