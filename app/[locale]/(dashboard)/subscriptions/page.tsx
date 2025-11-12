// Subscriptions page - specialized view for tracking recurring subscriptions
"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Tv, Wifi, Music, Film, Smartphone, Cloud, BookOpen } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

// Common subscription icons
const SUBSCRIPTION_ICONS: Record<string, any> = {
  netflix: Film,
  spotify: Music,
  youtube: Tv,
  internet: Wifi,
  mobile: Smartphone,
  cloud: Cloud,
  default: BookOpen,
}

export default function SubscriptionsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations()
  const { toast } = useToast()
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSubscriptions()
  }, [])

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/recurring')
      if (response.ok) {
        const data = await response.json()
        // Filter only expenses (subscriptions are expenses)
        setSubscriptions(data.filter((r: any) => r.type === 'expense' && r.isActive))
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateMonthlyTotal = () => {
    return subscriptions.reduce((total, sub) => {
      if (sub.frequency === 'monthly') return total + sub.amount
      if (sub.frequency === 'yearly') return total + (sub.amount / 12)
      if (sub.frequency === 'weekly') return total + (sub.amount * 4.33) // avg weeks per month
      if (sub.frequency === 'daily') return total + (sub.amount * 30)
      return total
    }, 0)
  }

  const calculateYearlyTotal = () => {
    return subscriptions.reduce((total, sub) => {
      if (sub.frequency === 'monthly') return total + (sub.amount * 12)
      if (sub.frequency === 'yearly') return total + sub.amount
      if (sub.frequency === 'weekly') return total + (sub.amount * 52)
      if (sub.frequency === 'daily') return total + (sub.amount * 365)
      return total
    }, 0)
  }

  const getNextBillingDate = (sub: any) => {
    const today = new Date()
    const startDate = new Date(sub.startDate)

    if (sub.frequency === 'monthly' && sub.dayOfMonth) {
      const nextDate = new Date(today.getFullYear(), today.getMonth(), sub.dayOfMonth)
      if (nextDate < today) {
        nextDate.setMonth(nextDate.getMonth() + 1)
      }
      return nextDate
    }

    if (sub.frequency === 'yearly') {
      const nextDate = new Date(startDate)
      nextDate.setFullYear(today.getFullYear())
      if (nextDate < today) {
        nextDate.setFullYear(nextDate.getFullYear() + 1)
      }
      return nextDate
    }

    return null
  }

  const getSubscriptionIcon = (name: string) => {
    const lowerName = name.toLowerCase()
    for (const [key, Icon] of Object.entries(SUBSCRIPTION_ICONS)) {
      if (lowerName.includes(key)) return Icon
    }
    return SUBSCRIPTION_ICONS.default
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">{t("common.loading")}</div>
  }

  const monthlyTotal = calculateMonthlyTotal()
  const yearlyTotal = calculateYearlyTotal()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("subscriptions.title")}</h1>
          <p className="text-muted-foreground">{t("subscriptions.subtitle")}</p>
        </div>
        <Link href={`/${locale}/recurring`}>
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            {t("subscriptions.addSubscription")}
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("subscriptions.activeSubscriptions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("subscriptions.total")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("subscriptions.monthlyTotal")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyTotal, "HUF", locale)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("subscriptions.perMonth")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("subscriptions.yearlyTotal")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(yearlyTotal, "HUF", locale)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("subscriptions.perYear")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscriptions List */}
      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tv className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{t("subscriptions.noSubscriptions")}</p>
            <Link href={`/${locale}/recurring`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("subscriptions.addSubscription")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subscriptions.map((sub) => {
            const Icon = getSubscriptionIcon(sub.description)
            const nextBilling = getNextBillingDate(sub)
            const daysUntilBilling = nextBilling
              ? Math.ceil((nextBilling.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              : null

            const monthlyEquivalent =
              sub.frequency === 'monthly' ? sub.amount :
              sub.frequency === 'yearly' ? sub.amount / 12 :
              sub.frequency === 'weekly' ? sub.amount * 4.33 :
              sub.amount * 30

            return (
              <Card key={sub.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {sub.description}
                    </span>
                    {sub.category && (
                      <span className="text-xl">{sub.category.icon}</span>
                    )}
                  </CardTitle>
                  <CardDescription>
                    <Badge variant="outline">
                      {t(`recurring.${sub.frequency}`)}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(sub.amount, "HUF", locale)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(monthlyEquivalent, "HUF", locale)} / {t("subscriptions.month")}
                    </p>
                  </div>

                  {nextBilling && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t("subscriptions.nextBilling")}: </span>
                      <span className="font-semibold">
                        {nextBilling.toLocaleDateString(locale)}
                      </span>
                      {daysUntilBilling !== null && daysUntilBilling <= 7 && (
                        <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-300">
                          {daysUntilBilling} {t("bills.daysLeft")}
                        </Badge>
                      )}
                    </div>
                  )}

                  {sub.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {sub.notes}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Link href={`/${locale}/recurring`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        {t("common.edit")}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {subscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("subscriptions.savingsTip")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("subscriptions.savingsTipDescription", {
                monthly: formatCurrency(monthlyTotal, "HUF", locale),
                yearly: formatCurrency(yearlyTotal, "HUF", locale)
              })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
