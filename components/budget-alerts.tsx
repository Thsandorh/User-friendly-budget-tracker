"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface BudgetAlert {
  budgetName: string
  spent: number
  limit: number
  percentage: number
  currency: string
}

interface BudgetAlertsProps {
  alerts: BudgetAlert[]
  locale: string
}

export function BudgetAlerts({ alerts, locale }: BudgetAlertsProps) {
  if (alerts.length === 0) return null

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => {
        const isOverLimit = alert.percentage >= 100
        const isWarning = alert.percentage >= 80 && alert.percentage < 100

        if (!isOverLimit && !isWarning) return null

        return (
          <Alert
            key={index}
            variant={isOverLimit ? "destructive" : "default"}
            className={isWarning ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950" : ""}
          >
            {isOverLimit ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
            <AlertTitle>
              {isOverLimit
                ? `Budget Exceeded: ${alert.budgetName}`
                : `Budget Warning: ${alert.budgetName}`}
            </AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>
                {isOverLimit
                  ? `You've exceeded your budget by ${formatCurrency(
                      alert.spent - alert.limit,
                      alert.currency,
                      locale
                    )}`
                  : `You've used ${alert.percentage.toFixed(0)}% of your budget`}
              </span>
              <span className="font-semibold">
                {formatCurrency(alert.spent, alert.currency, locale)} /{" "}
                {formatCurrency(alert.limit, alert.currency, locale)}
              </span>
            </AlertDescription>
          </Alert>
        )
      })}
    </div>
  )
}
