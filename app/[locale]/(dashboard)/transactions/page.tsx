// Transactions page
"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Filter, Search, Camera } from "lucide-react"
import { formatCurrency, formatDateShort } from "@/lib/utils"
import { TransactionDialog } from "@/components/transaction-dialog"
import { ReceiptScanner } from "@/components/receipt-scanner"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function TransactionsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations()
  const { toast } = useToast()
  const [transactions, setTransactions] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [filterType, setFilterType] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  useEffect(() => {
    fetchTransactions()
    fetchCategories()
  }, [filterType, filterCategory])

  const fetchTransactions = async () => {
    try {
      let url = '/api/transactions'
      const params = new URLSearchParams()
      if (filterType !== 'all') params.append('type', filterType)
      if (filterCategory !== 'all') params.append('categoryId', filterCategory)
      if (params.toString()) url += `?${params.toString()}`

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setTransactions(data)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t("transactions.deleteConfirm"))) return

    try {
      const response = await fetch(`/api/transactions/${id}`, { method: 'DELETE' })
      if (response.ok) {
        toast({ title: t("transactions.deleteSuccess") })
        fetchTransactions()
      }
    } catch (error) {
      toast({ title: t("errors.generic"), variant: "destructive" })
    }
  }

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingTransaction(null)
    fetchTransactions()
  }

  const handleReceiptScanSuccess = () => {
    setIsReceiptScannerOpen(false)
    fetchTransactions()
  }

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter(transaction => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    const description = transaction.description.toLowerCase()
    const amount = transaction.amount.toString()
    const notes = transaction.notes?.toLowerCase() || ""

    return description.includes(query) || amount.includes(query) || notes.includes(query)
  })

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">{t("common.loading")}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("transactions.title")}</h1>
          <p className="text-muted-foreground">Track your income and expenses</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={() => setIsReceiptScannerOpen(!isReceiptScannerOpen)} variant="outline" className="flex-1 sm:flex-none">
            <Camera className="mr-2 h-4 w-4" />
            Scan Receipt
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="flex-1 sm:flex-none">
            <Plus className="mr-2 h-4 w-4" />
            {t("transactions.addTransaction")}
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t("transactions.filterByType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("transactions.all")}</SelectItem>
                  <SelectItem value="income">{t("transactions.income")}</SelectItem>
                  <SelectItem value="expense">{t("transactions.expense")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder={t("transactions.filterByCategory")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("transactions.all")}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipt Scanner */}
      {isReceiptScannerOpen && (
        <ReceiptScanner
          categories={categories}
          onSuccess={handleReceiptScanSuccess}
        />
      )}

      {/* Transactions list */}
      <Card>
        <CardContent className="pt-6">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {transactions.length === 0 ? (
                <>
                  <p>{t("dashboard.noTransactions")}</p>
                  <p className="text-sm">{t("dashboard.addFirstTransaction")}</p>
                </>
              ) : (
                <p>No transactions match your search</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-600' : 'bg-red-600'
                    }`} />
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category?.icon} {transaction.category?.name || t("categories.uncategorized")} • {formatDateShort(transaction.date, locale)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className={`font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount, "HUF", locale)}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(transaction)}>
                        {t("common.edit")}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(transaction.id)}>
                        {t("common.delete")}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        transaction={editingTransaction}
        categories={categories}
      />
    </div>
  )
}
