// Dialog component for creating/editing bill reminders
"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface BillReminderDialogProps {
  open: boolean
  onClose: () => void
  bill?: any
  categories: any[]
}

export function BillReminderDialog({ open, onClose, bill, categories }: BillReminderDialogProps) {
  const t = useTranslations()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    currency: "HUF",
    dueDate: "",
    isPaid: false,
    isRecurring: false,
    frequency: "",
    categoryId: "",
    notes: "",
  })

  useEffect(() => {
    if (bill) {
      setFormData({
        name: bill.name,
        amount: bill.amount.toString(),
        currency: bill.currency,
        dueDate: new Date(bill.dueDate).toISOString().split('T')[0],
        isPaid: bill.isPaid,
        isRecurring: bill.isRecurring,
        frequency: bill.frequency || "",
        categoryId: bill.categoryId || "",
        notes: bill.notes || "",
      })
    } else {
      setFormData({
        name: "",
        amount: "",
        currency: "HUF",
        dueDate: "",
        isPaid: false,
        isRecurring: false,
        frequency: "",
        categoryId: "",
        notes: "",
      })
    }
  }, [bill, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = bill ? `/api/bills/${bill.id}` : "/api/bills"
      const method = bill ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({ title: bill ? t("bills.updateSuccess") : t("bills.createSuccess") })
        onClose()
      } else {
        toast({ title: t("errors.generic"), variant: "destructive" })
      }
    } catch (error) {
      toast({ title: t("errors.generic"), variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{bill ? t("bills.editBill") : t("bills.addBill")}</DialogTitle>
          <DialogDescription>
            {bill ? t("bills.editDescription") : t("bills.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("bills.name")}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t("bills.namePlaceholder")}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{t("bills.amount")}</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="10000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">{t("common.currency")}</Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                placeholder="HUF"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">{t("bills.dueDate")}</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">{t("transactions.category")}</Label>
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("transactions.selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="isRecurring" className="cursor-pointer">
                {t("bills.isRecurring")}
              </Label>
            </div>
          </div>

          {formData.isRecurring && (
            <div className="space-y-2">
              <Label htmlFor="frequency">{t("bills.frequency")}</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("bills.selectFrequency")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{t("bills.monthly")}</SelectItem>
                  <SelectItem value="quarterly">{t("bills.quarterly")}</SelectItem>
                  <SelectItem value="yearly">{t("bills.yearly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">{t("common.notes")}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t("bills.notesPlaceholder")}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("common.saving") : bill ? t("common.update") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
