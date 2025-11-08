// Savings Goals page - displays all goals with create/edit/delete functionality
"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Plus, Target } from "lucide-react"
import { formatCurrency, formatDateShort } from "@/lib/utils"
import { SavingsGoalDialog } from "@/components/savings-goal-dialog"
import { useToast } from "@/components/ui/use-toast"

export default function GoalsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations()
  const { toast } = useToast()
  const [goals, setGoals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<any>(null)

  useEffect(() => {
    fetchGoals()
  }, [])

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals')
      if (response.ok) {
        const data = await response.json()
        setGoals(data)
      }
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t("goals.deleteConfirm"))) return

    try {
      const response = await fetch(`/api/goals/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast({ title: t("goals.deleteSuccess") })
        fetchGoals()
      }
    } catch (error) {
      toast({ title: t("errors.generic"), variant: "destructive" })
    }
  }

  const handleEdit = (goal: any) => {
    setEditingGoal(goal)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingGoal(null)
    fetchGoals()
  }

  const handleAddContribution = async (goal: any) => {
    const amount = prompt(t("goals.addContributionPrompt"))
    if (!amount) return

    const newAmount = goal.currentAmount + parseFloat(amount)

    try {
      const response = await fetch(`/api/goals/${goal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...goal,
          currentAmount: newAmount,
        }),
      })

      if (response.ok) {
        toast({ title: t("goals.contributionSuccess") })
        fetchGoals()
      }
    } catch (error) {
      toast({ title: t("errors.generic"), variant: "destructive" })
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">{t("common.loading")}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("goals.title")}</h1>
          <p className="text-muted-foreground">{t("goals.subtitle")}</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t("goals.addGoal")}
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{t("goals.noGoals")}</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("goals.addGoal")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100
            const remaining = goal.targetAmount - goal.currentAmount
            const daysRemaining = goal.deadline
              ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              : null

            return (
              <Card key={goal.id} className="relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: goal.color }}
                />
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="text-2xl">{goal.icon}</span>
                      {goal.name}
                    </span>
                    {goal.isCompleted && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {t("goals.completed")}
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {goal.deadline && (
                      <span>
                        {daysRemaining !== null && daysRemaining > 0
                          ? `${daysRemaining} ${t("goals.daysRemaining")}`
                          : daysRemaining !== null && daysRemaining < 0
                          ? t("goals.overdue")
                          : t("goals.dueToday")}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">
                        {formatCurrency(goal.currentAmount, goal.currency, locale)}
                      </span>
                      <span className="text-muted-foreground">
                        {formatCurrency(goal.targetAmount, goal.currency, locale)}
                      </span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {progress.toFixed(1)}% {t("goals.complete")}
                    </p>
                  </div>

                  {remaining > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t("goals.remaining")}: </span>
                      <span className="font-semibold">
                        {formatCurrency(remaining, goal.currency, locale)}
                      </span>
                    </div>
                  )}

                  {goal.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {goal.notes}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    {!goal.isCompleted && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddContribution(goal)}
                        className="flex-1"
                      >
                        {t("goals.addContribution")}
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleEdit(goal)}>
                      {t("common.edit")}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(goal.id)}>
                      {t("common.delete")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <SavingsGoalDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        goal={editingGoal}
      />
    </div>
  )
}
