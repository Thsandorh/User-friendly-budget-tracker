"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Coffee, ShoppingCart, Fuel, Pizza, Zap } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface QuickEntry {
  icon: any
  label: string
  labelHu: string
  amount: number
  category: string
  emoji: string
}

const quickEntries: QuickEntry[] = [
  {
    icon: Coffee,
    label: "Coffee",
    labelHu: "Kávé",
    amount: 450,
    category: "Food & Drinks",
    emoji: "☕"
  },
  {
    icon: ShoppingCart,
    label: "Groceries",
    labelHu: "Bevásárlás",
    amount: 5000,
    category: "Groceries",
    emoji: "🛒"
  },
  {
    icon: Fuel,
    label: "Gas",
    labelHu: "Benzin",
    amount: 8000,
    category: "Transportation",
    emoji: "⛽"
  },
  {
    icon: Pizza,
    label: "Lunch",
    labelHu: "Ebéd",
    amount: 1500,
    category: "Food & Drinks",
    emoji: "🍕"
  }
]

export function QuickEntryButtons({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<QuickEntry | null>(null)
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleQuickEntry = (entry: QuickEntry) => {
    setSelectedEntry(entry)
    setAmount(entry.amount.toString())
    setOpen(true)
  }

  const handleSubmit = async () => {
    if (!selectedEntry) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description: locale === 'hu' ? selectedEntry.labelHu : selectedEntry.label,
          type: 'expense',
          date: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        toast({
          title: locale === 'hu' ? "Sikeres rögzítés!" : "Transaction saved!",
          description: locale === 'hu'
            ? `${selectedEntry.labelHu} - ${amount} Ft hozzáadva`
            : `${selectedEntry.label} - ${amount} Ft added`,
        })
        setOpen(false)
        router.refresh()
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast({
        title: locale === 'hu' ? "Hiba" : "Error",
        description: locale === 'hu' ? "Nem sikerült menteni" : "Failed to save transaction",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            {locale === 'hu' ? 'Gyors Bevitel' : 'Quick Entry'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickEntries.map((entry, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-20 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-all"
                onClick={() => handleQuickEntry(entry)}
              >
                <entry.icon className="h-6 w-6" />
                <span className="text-xs font-medium">
                  {locale === 'hu' ? entry.labelHu : entry.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {entry.amount.toLocaleString('hu-HU')} Ft
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEntry && (
                <>
                  <selectedEntry.icon className="h-5 w-5" />
                  {locale === 'hu' ? selectedEntry.labelHu : selectedEntry.label}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {locale === 'hu'
                ? 'Módosítsd az összeget, majd mentsd el a tranzakciót'
                : 'Adjust the amount and save the transaction'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">
                {locale === 'hu' ? 'Összeg (Ft)' : 'Amount (Ft)'}
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {locale === 'hu' ? 'Mégse' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading || !amount}>
              {isLoading
                ? (locale === 'hu' ? 'Mentés...' : 'Saving...')
                : (locale === 'hu' ? 'Mentés' : 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
