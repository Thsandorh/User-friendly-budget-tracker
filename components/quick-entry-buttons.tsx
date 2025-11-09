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
import { Zap, Settings, Plus, X, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface QuickEntryPreset {
  id: string
  name: string
  nameHu: string
  amount: number
  icon: string
  sortOrder: number
}

export function QuickEntryButtons({ locale }: { locale: string }) {
  const [presets, setPresets] = useState<QuickEntryPreset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<QuickEntryPreset | null>(null)
  const [transactionAmount, setTransactionAmount] = useState("")
  const [editingPresets, setEditingPresets] = useState<QuickEntryPreset[]>([])
  const { toast } = useToast()
  const router = useRouter()

  const fetchPresets = async () => {
    try {
      const response = await fetch('/api/quick-entry-presets')
      if (response.ok) {
        const data = await response.json()
        setPresets(data)
      }
    } catch (error) {
      console.error('Error fetching presets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPresets()
  }, [])

  const handleQuickEntry = (preset: QuickEntryPreset) => {
    setSelectedPreset(preset)
    setTransactionAmount(preset.amount.toString())
    setTransactionDialogOpen(true)
  }

  const handleSubmitTransaction = async () => {
    if (!selectedPreset) return

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(transactionAmount),
          description: locale === 'hu' ? selectedPreset.nameHu : selectedPreset.name,
          type: 'expense',
          date: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        toast({
          title: locale === 'hu' ? "Sikeres rögzítés!" : "Transaction saved!",
          description: locale === 'hu'
            ? `${selectedPreset.nameHu} - ${transactionAmount} Ft hozzáadva`
            : `${selectedPreset.name} - ${transactionAmount} Ft added`,
        })
        setTransactionDialogOpen(false)
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
    }
  }

  const openEditDialog = () => {
    setEditingPresets([...presets])
    setEditDialogOpen(true)
  }

  const handleAddPreset = () => {
    const newPreset: QuickEntryPreset = {
      id: `new-${Date.now()}`,
      name: '',
      nameHu: '',
      amount: 0,
      icon: '⚡',
      sortOrder: editingPresets.length,
    }
    setEditingPresets([...editingPresets, newPreset])
  }

  const handleRemovePreset = (index: number) => {
    setEditingPresets(editingPresets.filter((_, i) => i !== index))
  }

  const handleUpdatePreset = (index: number, field: keyof QuickEntryPreset, value: any) => {
    const updated = [...editingPresets]
    updated[index] = { ...updated[index], [field]: value }
    setEditingPresets(updated)
  }

  const handleSavePresets = async () => {
    try {
      // Save each preset
      const savePromises = editingPresets.map(async (preset, index) => {
        if (!preset.name || !preset.nameHu || !preset.amount) {
          return null // Skip incomplete presets
        }

        const data = {
          id: preset.id.startsWith('new-') ? undefined : preset.id,
          name: preset.name,
          nameHu: preset.nameHu,
          amount: preset.amount,
          icon: preset.icon,
          sortOrder: index,
        }

        const response = await fetch('/api/quick-entry-presets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) throw new Error('Failed to save preset')
        return response.json()
      })

      // Delete removed presets
      const removedPresets = presets.filter(
        (p) => !editingPresets.find((ep) => ep.id === p.id)
      )

      const deletePromises = removedPresets.map(async (preset) => {
        if (preset.id.startsWith('new-')) return null

        const response = await fetch(`/api/quick-entry-presets?id=${preset.id}`, {
          method: 'DELETE',
        })

        if (!response.ok) throw new Error('Failed to delete preset')
        return response.json()
      })

      await Promise.all([...savePromises, ...deletePromises])

      toast({
        title: locale === 'hu' ? "Beállítások mentve!" : "Settings saved!",
        description: locale === 'hu'
          ? "Gyors bevitel gombok frissítve"
          : "Quick entry buttons updated",
      })

      setEditDialogOpen(false)
      fetchPresets()
      router.refresh()
    } catch (error) {
      toast({
        title: locale === 'hu' ? "Hiba" : "Error",
        description: locale === 'hu'
          ? "Nem sikerült menteni a beállításokat"
          : "Failed to save settings",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            {locale === 'hu' ? 'Gyors Bevitel' : 'Quick Entry'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              {locale === 'hu' ? 'Gyors Bevitel' : 'Quick Entry'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={openEditDialog}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {presets.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                className="h-20 flex flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-all"
                onClick={() => handleQuickEntry(preset)}
              >
                <span className="text-2xl">{preset.icon}</span>
                <span className="text-xs font-medium">
                  {locale === 'hu' ? preset.nameHu : preset.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {preset.amount.toLocaleString('hu-HU')} Ft
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Dialog */}
      <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedPreset && (
                <>
                  <span className="text-2xl">{selectedPreset.icon}</span>
                  {locale === 'hu' ? selectedPreset.nameHu : selectedPreset.name}
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
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
                placeholder="0"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTransactionDialogOpen(false)}>
              {locale === 'hu' ? 'Mégse' : 'Cancel'}
            </Button>
            <Button onClick={handleSubmitTransaction} disabled={!transactionAmount}>
              {locale === 'hu' ? 'Mentés' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Presets Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {locale === 'hu' ? 'Gyors Bevitel Gombok Szerkesztése' : 'Edit Quick Entry Buttons'}
            </DialogTitle>
            <DialogDescription>
              {locale === 'hu'
                ? 'Állítsd be a gombok nevét, ikonját és alapértelmezett összegét'
                : 'Customize button names, icons, and default amounts'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {editingPresets.map((preset, index) => (
              <div key={preset.id} className="border rounded-lg p-4 space-y-3 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => handleRemovePreset(index)}
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>
                      {locale === 'hu' ? 'Név (Magyar)' : 'Name (Hungarian)'}
                    </Label>
                    <Input
                      value={preset.nameHu}
                      onChange={(e) => handleUpdatePreset(index, 'nameHu', e.target.value)}
                      placeholder={locale === 'hu' ? 'pl. Kávé' : 'e.g. Kávé'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      {locale === 'hu' ? 'Név (Angol)' : 'Name (English)'}
                    </Label>
                    <Input
                      value={preset.name}
                      onChange={(e) => handleUpdatePreset(index, 'name', e.target.value)}
                      placeholder={locale === 'hu' ? 'pl. Coffee' : 'e.g. Coffee'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>
                      {locale === 'hu' ? 'Összeg (Ft)' : 'Amount (Ft)'}
                    </Label>
                    <Input
                      type="number"
                      value={preset.amount}
                      onChange={(e) => handleUpdatePreset(index, 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      {locale === 'hu' ? 'Ikon (emoji)' : 'Icon (emoji)'}
                    </Label>
                    <Input
                      value={preset.icon}
                      onChange={(e) => handleUpdatePreset(index, 'icon', e.target.value)}
                      placeholder="⚡"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" className="w-full" onClick={handleAddPreset}>
              <Plus className="h-4 w-4 mr-2" />
              {locale === 'hu' ? 'Új Gomb Hozzáadása' : 'Add New Button'}
            </Button>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {locale === 'hu' ? 'Mégse' : 'Cancel'}
            </Button>
            <Button onClick={handleSavePresets}>
              <Save className="h-4 w-4 mr-2" />
              {locale === 'hu' ? 'Mentés' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
