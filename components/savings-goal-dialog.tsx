// Dialog component for creating/editing savings goals
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
import { useToast } from "@/components/ui/use-toast"

interface SavingsGoalDialogProps {
  open: boolean
  onClose: () => void
  goal?: any
}

const GOAL_ICONS = ["🎯", "💰", "🏠", "🚗", "✈️", "🎓", "💍", "🏖️", "📱", "💻"]
const GOAL_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4"]

export function SavingsGoalDialog({ open, onClose, goal }: SavingsGoalDialogProps) {
  const t = useTranslations()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "0",
    currency: "HUF",
    deadline: "",
    icon: "🎯",
    color: "#10b981",
    notes: "",
  })

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount.toString(),
        currentAmount: goal.currentAmount.toString(),
        currency: goal.currency,
        deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : "",
        icon: goal.icon,
        color: goal.color,
        notes: goal.notes || "",
      })
    } else {
      setFormData({
        name: "",
        targetAmount: "",
        currentAmount: "0",
        currency: "HUF",
        deadline: "",
        icon: "🎯",
        color: "#10b981",
        notes: "",
      })
    }
  }, [goal, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = goal ? `/api/goals/${goal.id}` : "/api/goals"
      const method = goal ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({ title: goal ? t("goals.updateSuccess") : t("goals.createSuccess") })
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
          <DialogTitle>{goal ? t("goals.editGoal") : t("goals.addGoal")}</DialogTitle>
          <DialogDescription>
            {goal ? t("goals.editDescription") : t("goals.createDescription")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("goals.name")}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t("goals.namePlaceholder")}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">{t("goals.targetAmount")}</Label>
              <Input
                id="targetAmount"
                type="number"
                step="0.01"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                placeholder="100000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentAmount">{t("goals.currentAmount")}</Label>
              <Input
                id="currentAmount"
                type="number"
                step="0.01"
                value={formData.currentAmount}
                onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">{t("common.currency")}</Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                placeholder="HUF"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">{t("goals.deadline")}</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("goals.icon")}</Label>
            <div className="flex gap-2 flex-wrap">
              {GOAL_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`text-2xl p-2 rounded border-2 transition-all ${
                    formData.icon === icon ? "border-primary scale-110" : "border-transparent hover:border-gray-300"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("goals.color")}</Label>
            <div className="flex gap-2 flex-wrap">
              {GOAL_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color ? "border-gray-900 dark:border-white scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">{t("common.notes")}</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t("goals.notesPlaceholder")}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t("common.saving") : goal ? t("common.update") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
