// Net Worth page - track assets and liabilities
"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"

export default function NetWorthPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations()
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchNetWorth()
  }, [])

  const fetchNetWorth = async () => {
    try {
      const response = await fetch('/api/networth')
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching net worth:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">{t("common.loading")}</div>
  }

  if (!data) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Net Worth</h1>
        <p className="text-muted-foreground">Track your assets and liabilities</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.totalAssets, "HUF", locale)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.assets.length} assets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(data.totalLiabilities, "HUF", locale)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.liabilities.length} liabilities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.netWorth >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(data.netWorth, "HUF", locale)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.netWorth >= 0 ? 'Positive' : 'Negative'} balance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assets List */}
      <Card>
        <CardHeader>
          <CardTitle>Assets</CardTitle>
        </CardHeader>
        <CardContent>
          {data.assets.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No assets yet</p>
          ) : (
            <div className="space-y-2">
              {data.assets.map((asset: any) => (
                <div key={asset.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{asset.icon}</span>
                    <div>
                      <p className="font-medium">{asset.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{asset.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {formatCurrency(asset.value, asset.currency, locale)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Liabilities List */}
      <Card>
        <CardHeader>
          <CardTitle>Liabilities</CardTitle>
        </CardHeader>
        <CardContent>
          {data.liabilities.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No liabilities yet</p>
          ) : (
            <div className="space-y-2">
              {data.liabilities.map((liability: any) => (
                <div key={liability.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{liability.icon}</span>
                    <div>
                      <p className="font-medium">{liability.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{liability.type.replace('_', ' ')}</p>
                      {liability.interestRate && (
                        <p className="text-xs text-muted-foreground">{liability.interestRate}% interest</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">
                      {formatCurrency(liability.balance, liability.currency, locale)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
