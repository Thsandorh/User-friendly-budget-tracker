// Professional receipt scanner component with image upload
"use client"

import { useState, useRef } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Upload, Camera, FileText, CheckCircle2, Loader2 } from "lucide-react"
import Image from "next/image"

interface ReceiptScannerProps {
  categories: any[]
  onSuccess: () => void
}

export function ReceiptScanner({ categories, onSuccess }: ReceiptScannerProps) {
  const t = useTranslations()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<any>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive"
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      })
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Process receipt
    await processReceipt(file)
  }

  const processReceipt = async (file: File) => {
    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append('receipt', file)

      const response = await fetch('/api/receipts/scan', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setExtractedData(data)
        toast({
          title: "Receipt scanned successfully",
          description: "Review and confirm the extracted data below",
        })
      } else {
        throw new Error('Failed to process receipt')
      }
    } catch (error) {
      console.error('Error processing receipt:', error)
      toast({
        title: "Error processing receipt",
        description: "Please try again or enter details manually",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCreateTransaction = async () => {
    if (!extractedData) return

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: extractedData.amount,
          description: extractedData.merchant || 'Receipt scan',
          type: 'expense',
          date: extractedData.date || new Date().toISOString(),
          categoryId: extractedData.categoryId,
          notes: `Scanned from receipt${extractedData.items ? `: ${extractedData.items.join(', ')}` : ''}`,
        }),
      })

      if (response.ok) {
        toast({ title: "Transaction created successfully" })
        setUploadedImage(null)
        setExtractedData(null)
        onSuccess()
      } else {
        throw new Error('Failed to create transaction')
      }
    } catch (error) {
      toast({ title: t("errors.generic"), variant: "destructive" })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Receipt Scanner
        </CardTitle>
        <CardDescription>
          Upload a receipt photo to automatically extract transaction details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        {!uploadedImage && (
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Click to upload receipt</p>
            <p className="text-sm text-muted-foreground mb-4">
              or drag and drop your receipt image here
            </p>
            <p className="text-xs text-muted-foreground">
              Supports JPG, PNG, HEIC • Max 5MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-lg font-medium mb-2">Processing receipt...</p>
            <p className="text-sm text-muted-foreground">
              Extracting data from your receipt
            </p>
          </div>
        )}

        {/* Image Preview & Extracted Data */}
        {uploadedImage && !isProcessing && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image Preview */}
            <div className="space-y-4">
              <Label>Receipt Image</Label>
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden border">
                <Image
                  src={uploadedImage}
                  alt="Receipt"
                  fill
                  className="object-contain"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setUploadedImage(null)
                  setExtractedData(null)
                  fileInputRef.current?.click()
                }}
                className="w-full"
              >
                Upload Different Image
              </Button>
            </div>

            {/* Extracted Data Form */}
            {extractedData && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 mb-4">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Data extracted successfully</span>
                </div>

                <div className="space-y-2">
                  <Label>Merchant</Label>
                  <Input
                    value={extractedData.merchant || ''}
                    onChange={(e) => setExtractedData({ ...extractedData, merchant: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={extractedData.amount || ''}
                    onChange={(e) => setExtractedData({ ...extractedData, amount: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={extractedData.date?.split('T')[0] || ''}
                    onChange={(e) => setExtractedData({ ...extractedData, date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={extractedData.categoryId || ''}
                    onValueChange={(value) => setExtractedData({ ...extractedData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c.type === 'expense').map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {extractedData.items && extractedData.items.length > 0 && (
                  <div className="space-y-2">
                    <Label>Items</Label>
                    <div className="border rounded p-3 max-h-32 overflow-y-auto">
                      <ul className="text-sm space-y-1">
                        {extractedData.items.map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-muted-foreground">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleCreateTransaction}
                  disabled={!extractedData.amount || !extractedData.categoryId}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Create Transaction
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
