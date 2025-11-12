// Dialog for splitting a transaction into multiple categories
"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Trash2 } from "lucide-react"

interface SplitItem {
  categoryId: string
  percentage: number
  amount: number
}

interface SplitTransactionDialogProps {
  open: boolean
  onClose: () => void
  transaction: any
  categories: any[]
}

export function SplitTransactionDialog({ open, onClose, transaction, categories }: SplitTransactionDialogProps) {
  const t = useTranslations()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [splits, setSplits] = useState<SplitItem[]>([
    { categoryId: "", percentage: 50, amount: transaction?.amount * 0.5 || 0 },
    { categoryId: "", percentage: 50, amount: transaction?.amount * 0.5 || 0 },
  ])

  const handleAddSplit = () => {
    const remainingPercentage = 100 - splits.reduce((sum, s) => sum + s.percentage, 0)
    setSplits([
      ...splits,
      {
        categoryId: "",
        percentage: Math.max(remainingPercentage, 0),
        amount: (transaction?.amount || 0) * Math.max(remainingPercentage, 0) / 100,
      },
    ])
  }

  const handleRemoveSplit = (index: number) => {
    if (splits.length > 2) {
      setSplits(splits.filter((_, i) => i !== index))
    }
  }

  const handlePercentageChange = (index: number, percentage: number) => {
    const newSplits = [...splits]
    newSplits[index].percentage = percentage
    newSplits[index].amount = (transaction?.amount || 0) * percentage / 100
    setSplits(newSplits)
  }

  const handleCategoryChange = (index: number, categoryId: string) => {
    const newSplits = [...splits]
    newSplits[index].categoryId = categoryId
    setSplits(newSplits)
  }

  const totalPercentage = splits.reduce((sum, s) => sum + s.percentage, 0)
  const isValid = Math.abs(totalPercentage - 100) < 0.01 && splits.every(s => s.categoryId)

  const handleSubmit = async () => {
    if (!isValid) {
      toast({
        title: t("errors.generic"),
        description: "Percentages must total 100% and all categories must be selected",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/transactions/${transaction.id}/split`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ splits }),
      })

      if (response.ok) {
        toast({ title: "Transaction split successfully" })
        onClose()
      } else {
        const error = await response.json()
        toast({ title: error.error || t("errors.generic"), variant: "destructive" })
      }
    } catch (error) {
      toast({ title: t("errors.generic"), variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  if (!transaction) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Split Transaction</DialogTitle>
          <DialogDescription>
            Split "{transaction.description}" ({transaction.amount.toFixed(2)}) into multiple categories
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {splits.map((split, index) => (
            <div key={index} className="flex gap-3 items-end p-4 border rounded">
              <div className="flex-1 space-y-2">
                <Label>Category</Label>
                <Select
                  value={split.categoryId}
                  onValueChange={(value) => handleCategoryChange(index, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-24 space-y-2">
                <Label>Percentage</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={split.percentage}
                  onChange={(e) => handlePercentageChange(index, parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="w-32 space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={split.amount.toFixed(2)}
                  disabled
                  className="bg-muted"
                />
              </div>

              {splits.length > 2 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveSplit(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={handleAddSplit}
            className="w-full"
            disabled={totalPercentage >= 100}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Split
          </Button>

          <div className="flex justify-between items-center p-4 bg-muted rounded">
            <span className="font-semibold">Total:</span>
            <span className={`font-bold ${Math.abs(totalPercentage - 100) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isLoading}>
            {isLoading ? t("common.saving") : "Split Transaction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
