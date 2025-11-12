"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar as CalendarIcon } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns"

interface DaySpending {
  date: string
  amount: number
}

interface SpendingCalendarProps {
  data: DaySpending[]
  dailyLimit?: number
  locale: string
}

export function SpendingCalendar({ data, dailyLimit = 5000, locale }: SpendingCalendarProps) {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getColorForAmount = (amount: number) => {
    if (amount === 0) return "bg-gray-100 dark:bg-gray-800 text-gray-400"
    const percentage = (amount / dailyLimit) * 100

    if (percentage >= 100) return "bg-red-500 text-white font-bold"
    if (percentage >= 80) return "bg-orange-400 text-white font-semibold"
    if (percentage >= 50) return "bg-yellow-300 text-gray-900"
    return "bg-green-400 text-white"
  }

  const getSpending = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const dayData = data.find(d => d.date === dateStr)
    return dayData?.amount || 0
  }

  const weekDays = locale === 'hu'
    ? ['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V']
    : ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  const firstDayOfWeek = monthStart.getDay()
  const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-blue-500" />
          {locale === 'hu' ? 'Havi Naptár' : 'Monthly Calendar'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day, i) => (
              <div key={i} className="text-center text-xs font-semibold text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: paddingDays }).map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}

            {days.map((day) => {
              const spending = getSpending(day)
              const colorClass = getColorForAmount(spending)
              const isCurrentDay = isToday(day)

              return (
                <div
                  key={day.toISOString()}
                  className={`aspect-square flex flex-col items-center justify-center rounded-lg text-xs transition-all hover:scale-105 ${colorClass} ${
                    isCurrentDay ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                  }`}
                  title={`${format(day, 'MMM d')}: ${spending.toLocaleString('hu-HU')} Ft`}
                >
                  <div className="text-[10px] opacity-75">{format(day, 'd')}</div>
                  {spending > 0 && (
                    <div className="text-[8px] font-bold">
                      {spending >= 1000 ? `${Math.round(spending / 1000)}k` : spending}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-400" />
              <span className="text-muted-foreground">
                {locale === 'hu' ? 'Jó' : 'Good'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-300" />
              <span className="text-muted-foreground">
                {locale === 'hu' ? 'Közepes' : 'Moderate'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-400" />
              <span className="text-muted-foreground">
                {locale === 'hu' ? 'Magas' : 'High'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-muted-foreground">
                {locale === 'hu' ? 'Túllépve' : 'Over'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
