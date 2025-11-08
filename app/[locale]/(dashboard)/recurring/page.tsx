// Recurring transactions page (placeholder)
"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { RepeatIcon } from "lucide-react"

export default function RecurringPage() {
  const t = useTranslations()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("recurring.title")}</h1>
        <p className="text-muted-foreground">Manage recurring income and expenses</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <RepeatIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">Recurring transactions feature</p>
          <p className="text-sm text-muted-foreground">Set up automatic recurring transactions for bills, salary, etc.</p>
        </CardContent>
      </Card>
    </div>
  )
}
