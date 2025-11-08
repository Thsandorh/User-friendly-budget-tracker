// Export utility functions for CSV and PDF
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Export transactions to CSV format
 */
export function exportToCSV(transactions: any[], filename: string = 'transactions.csv') {
  // Create CSV header
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Notes']

  // Create CSV rows
  const rows = transactions.map(t => [
    new Date(t.date).toLocaleDateString(),
    t.description,
    t.category?.name || 'Uncategorized',
    t.type,
    t.amount.toString(),
    t.notes || ''
  ])

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export transactions to PDF format
 */
export function exportToPDF(
  transactions: any[],
  summary: { income: number; expense: number; balance: number },
  filename: string = 'transactions.pdf'
) {
  const doc = new jsPDF()

  // Add title
  doc.setFontSize(18)
  doc.text('Transaction Report', 14, 22)

  // Add summary
  doc.setFontSize(12)
  doc.text(`Total Income: ${summary.income.toLocaleString()}`, 14, 35)
  doc.text(`Total Expense: ${summary.expense.toLocaleString()}`, 14, 42)
  doc.text(`Balance: ${summary.balance.toLocaleString()}`, 14, 49)

  // Add transactions table
  const tableData = transactions.map(t => [
    new Date(t.date).toLocaleDateString(),
    t.description,
    t.category?.name || 'Uncategorized',
    t.type,
    t.amount.toLocaleString()
  ])

  autoTable(doc, {
    head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
    body: tableData,
    startY: 60,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
  })

  // Save PDF
  doc.save(filename)
}

/**
 * Export categories summary to PDF
 */
export function exportCategoriesToPDF(
  categories: any[],
  categoryTotals: Record<string, number>,
  filename: string = 'categories-report.pdf'
) {
  const doc = new jsPDF()

  // Add title
  doc.setFontSize(18)
  doc.text('Categories Report', 14, 22)

  // Add categories table
  const tableData = categories.map(cat => [
    cat.icon + ' ' + cat.name,
    cat.type,
    (categoryTotals[cat.id] || 0).toLocaleString(),
    cat.budgetLimit ? cat.budgetLimit.toLocaleString() : 'N/A'
  ])

  autoTable(doc, {
    head: [['Category', 'Type', 'Total', 'Budget Limit']],
    body: tableData,
    startY: 35,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] },
  })

  // Save PDF
  doc.save(filename)
}
