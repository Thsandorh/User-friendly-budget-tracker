// Reports page (placeholder)
"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default function ReportsPage() {
  const t = useTranslations()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("reports.title")}</h1>
        <p className="text-muted-foreground">View detailed financial reports and analytics</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">Reports and analytics</p>
          <p className="text-sm text-muted-foreground">Export reports to CSV and PDF formats</p>
        </CardContent>
      </Card>
    </div>
  )
}
