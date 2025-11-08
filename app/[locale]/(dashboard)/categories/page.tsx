// Categories page
"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { CategoryDialog } from "@/components/category-dialog"
import { useToast } from "@/components/ui/use-toast"

export default function CategoriesPage() {
  const t = useTranslations()
  const { toast } = useToast()
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t("categories.deleteConfirm"))) return

    try {
      const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast({ title: t("categories.deleteSuccess") })
        fetchCategories()
      }
    } catch (error) {
      toast({ title: t("errors.generic"), variant: "destructive" })
    }
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingCategory(null)
    fetchCategories()
  }

  const incomeCategories = categories.filter(c => c.type === 'income')
  const expenseCategories = categories.filter(c => c.type === 'expense')

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">{t("common.loading")}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("categories.title")}</h1>
          <p className="text-muted-foreground">Organize your transactions with categories</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("categories.addCategory")}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Income Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-green-600">💰</span>
              {t("transactions.income")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {incomeCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No income categories yet
              </p>
            ) : (
              incomeCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                  style={{ borderColor: category.color + '40' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      {category.budgetLimit && (
                        <p className="text-xs text-muted-foreground">
                          Limit: {category.budgetLimit}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                      {t("common.edit")}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)}>
                      {t("common.delete")}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-red-600">💸</span>
              {t("transactions.expense")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {expenseCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No expense categories yet
              </p>
            ) : (
              expenseCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                  style={{ borderColor: category.color + '40' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      {category.budgetLimit && (
                        <p className="text-xs text-muted-foreground">
                          Limit: {category.budgetLimit}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                      {t("common.edit")}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)}>
                      {t("common.delete")}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <CategoryDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        category={editingCategory}
      />
    </div>
  )
}
