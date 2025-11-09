"use client"

import { useState, useEffect } from "react"
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
import { Star, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface TransactionTemplate {
  id: string
  name: string
  amount: number
  description: string
  type: string
  icon: string
  color: string
  useCount: number
  category?: {
    id: string
    name: string
  }
}

export function FavoriteTransactions({ locale }: { locale: string }) {
  const [templates, setTemplates] = useState<TransactionTemplate[]>([])
  const [open, setOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TransactionTemplate | null>(null)
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/transaction-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleUseTemplate = (template: TransactionTemplate) => {
    setSelectedTemplate(template)
    setAmount(template.amount.toString())
    setOpen(true)
  }

  const handleSubmit = async () => {
    if (!selectedTemplate) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/transaction-templates/use', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          amount: parseFloat(amount),
        }),
      })

      if (response.ok) {
        toast({
          title: locale === 'hu' ? "Sikeres rögzítés!" : "Transaction saved!",
          description: locale === 'hu'
            ? `${selectedTemplate.name} - ${amount} Ft hozzáadva`
            : `${selectedTemplate.name} - ${amount} Ft added`,
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

  const handleDelete = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm(locale === 'hu' ? 'Biztosan törölni szeretnéd?' : 'Are you sure you want to delete?')) {
      return
    }

    try {
      const response = await fetch(`/api/transaction-templates?id=${templateId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: locale === 'hu' ? "Törölve" : "Deleted",
          description: locale === 'hu' ? "Sablon törölve" : "Template deleted",
        })
        fetchTemplates()
      }
    } catch (error) {
      toast({
        title: locale === 'hu' ? "Hiba" : "Error",
        description: locale === 'hu' ? "Nem sikerült törölni" : "Failed to delete",
        variant: "destructive",
      })
    }
  }

  if (templates.length === 0) {
    return null
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            {locale === 'hu' ? 'Kedvenc Tranzakciók' : 'Favorite Transactions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {templates.slice(0, 6).map((template) => (
              <Button
                key={template.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-primary/10 hover:border-primary transition-all relative group"
                onClick={() => handleUseTemplate(template)}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDelete(template.id, e)}
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>

                <div className="flex items-center gap-2 w-full">
                  <span className="text-2xl">{template.icon}</span>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-sm">{template.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {template.category?.name || (locale === 'hu' ? 'Kategória nélkül' : 'No category')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-bold">
                    {template.amount.toLocaleString('hu-HU')} Ft
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {locale === 'hu' ? `${template.useCount}× használva` : `Used ${template.useCount}×`}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedTemplate && (
                <>
                  <span className="text-2xl">{selectedTemplate.icon}</span>
                  {selectedTemplate.name}
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
              <Label htmlFor="template-amount">
                {locale === 'hu' ? 'Összeg (Ft)' : 'Amount (Ft)'}
              </Label>
              <Input
                id="template-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                autoFocus
              />
            </div>
            {selectedTemplate && (
              <div className="text-sm text-muted-foreground">
                {selectedTemplate.description}
              </div>
            )}
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
