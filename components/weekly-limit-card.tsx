"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2, XCircle, TrendingDown, Edit, Save, X, Calendar } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface WeeklyLimitData {
  limit: {
    id: string
    amount: number
    currency: string
  } | null
  spending: number
  remaining: number | null
  exceeded: boolean
}

export function WeeklyLimitCard() {
  const [data, setData] = useState<WeeklyLimitData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [limitAmount, setLimitAmount] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const fetchWeeklyLimit = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`/api/weekly-limits?date=${today}`)

      if (response.ok) {
        const result = await response.json()
        setData(result)
        if (result.limit) {
          setLimitAmount(result.limit.amount.toString())
        }
      }
    } catch (error) {
      console.error('Error fetching weekly limit:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWeeklyLimit()
  }, [])

  const handleSaveLimit = async () => {
    try {
      const amount = parseFloat(limitAmount)

      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Hiba",
          description: "Érvényes összeget adj meg!",
          variant: "destructive",
        })
        return
      }

      const response = await fetch('/api/weekly-limits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          date: new Date().toISOString(),
          currency: 'HUF',
        }),
      })

      if (response.ok) {
        toast({
          title: "Sikeres mentés",
          description: "Heti limit beállítva!",
        })
        setIsEditing(false)
        fetchWeeklyLimit()
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast({
        title: "Hiba",
        description: "Nem sikerült menteni a limitet",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Heti költségvetési limit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data?.limit && !isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Heti költségvetési limit</CardTitle>
          <CardDescription>Állíts be heti költési limitet</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsEditing(true)} className="w-full">
            <Edit className="mr-2 h-4 w-4" />
            Limit beállítása
          </Button>
        </CardContent>
      </Card>
    )
  }

  const spending = data?.spending || 0
  const limit = data?.limit?.amount || 0
  const remaining = data?.remaining || 0
  const exceeded = data?.exceeded || false
  const percentage = limit > 0 ? Math.min((spending / limit) * 100, 100) : 0

  return (
    <Card className={exceeded ? "border-red-500 border-2" : "border-blue-500 border-2"}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {exceeded ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Calendar className="h-5 w-5 text-blue-500" />
              )}
              Heti limit
            </CardTitle>
            <CardDescription>
              E heti költések követése
            </CardDescription>
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="weekly-limit-amount">Heti limit (Ft)</Label>
              <Input
                id="weekly-limit-amount"
                type="number"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                placeholder="pl. 30000"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveLimit} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Mentés
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  if (data?.limit) {
                    setLimitAmount(data.limit.amount.toString())
                  }
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Mégse
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Elköltve ezen a héten</span>
                <span className="font-medium">
                  {spending.toLocaleString('hu-HU')} Ft
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    exceeded ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Limit</span>
                <span>{limit.toLocaleString('hu-HU')} Ft</span>
              </div>
            </div>

            {/* Status */}
            <div className={`p-4 rounded-lg ${
              exceeded ? 'bg-red-50 dark:bg-red-950/20' : 'bg-blue-50 dark:bg-blue-950/20'
            }`}>
              {exceeded ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-semibold">
                    <TrendingDown className="h-5 w-5" />
                    <span>Túlléptél!</span>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-500">
                    {Math.abs(remaining).toLocaleString('hu-HU')} Ft-tal többet költöttél ezen a héten
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Jó úton jársz!</span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-500">
                    Még {remaining.toLocaleString('hu-HU')} Ft maradt ezen a héten
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
