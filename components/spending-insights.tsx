"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, TrendingUp, Lightbulb, Calendar, PieChart } from "lucide-react"

interface InsightData {
  weeklyChange: number
  monthlyChange: number
  topSpendingDay: string
  topCategory: string
  topCategoryAmount: number
  avgDailySpending: number
}

export function SpendingInsights({ data, locale }: { data: InsightData; locale: string }) {
  const insights = []

  // Weekly trend insight
  if (data.weeklyChange !== 0) {
    const isPositive = data.weeklyChange < 0 // Less spending is positive
    const absChange = Math.abs(data.weeklyChange)
    insights.push({
      icon: isPositive ? TrendingDown : TrendingUp,
      color: isPositive ? "text-green-600" : "text-red-600",
      bgColor: isPositive ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20",
      message: locale === 'hu'
        ? `Ezen a héten ${absChange.toLocaleString('hu-HU')} Ft-tal ${isPositive ? 'kevesebbet' : 'többet'} költöttél!`
        : `This week you spent ${absChange.toLocaleString('hu-HU')} Ft ${isPositive ? 'less' : 'more'}!`
    })
  }

  // Top spending day insight
  if (data.topSpendingDay) {
    insights.push({
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      message: locale === 'hu'
        ? `Legtöbbet ${data.topSpendingDay} szoktál költeni`
        : `You spend most on ${data.topSpendingDay}`
    })
  }

  // Top category insight
  if (data.topCategory && data.topCategoryAmount > 0) {
    insights.push({
      icon: PieChart,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      message: locale === 'hu'
        ? `${data.topCategory} kategóriában átlagosan ${data.topCategoryAmount.toLocaleString('hu-HU')} Ft/hét`
        : `${data.topCategory} averages ${data.topCategoryAmount.toLocaleString('hu-HU')} Ft/week`
    })
  }

  // Daily average insight
  if (data.avgDailySpending > 0) {
    insights.push({
      icon: Lightbulb,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
      message: locale === 'hu'
        ? `Napi átlagos költésed: ${data.avgDailySpending.toLocaleString('hu-HU')} Ft`
        : `Your daily average: ${data.avgDailySpending.toLocaleString('hu-HU')} Ft`
    })
  }

  if (insights.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          {locale === 'hu' ? 'Költési Trendek' : 'Spending Insights'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg ${insight.bgColor}`}
            >
              <insight.icon className={`h-5 w-5 mt-0.5 ${insight.color}`} />
              <p className="text-sm font-medium">{insight.message}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
