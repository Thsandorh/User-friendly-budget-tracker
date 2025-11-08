// API route for receipt scanning - processes uploaded receipt images with Tesseract OCR
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Tesseract from "tesseract.js"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('receipt') as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 })
    }

    // Convert file to buffer for OCR processing
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Process receipt with OCR
    const extractedData = await processReceiptWithOCR(buffer)

    return NextResponse.json(extractedData)
  } catch (error) {
    console.error("Error processing receipt:", error)
    return NextResponse.json({ error: "Failed to process receipt" }, { status: 500 })
  }
}

// Process receipt image with Tesseract OCR
async function processReceiptWithOCR(imageBuffer: Buffer) {
  try {
    // Perform OCR on the image
    const { data: { text } } = await Tesseract.recognize(
      imageBuffer,
      'hun+eng', // Hungarian and English language support
      {
        logger: (m) => {
          // Optional: log OCR progress
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
          }
        }
      }
    )

    console.log('OCR extracted text:', text)

    // Extract structured data from OCR text
    const merchant = extractMerchant(text)
    const amount = extractAmount(text)
    const date = extractDate(text)
    const items = extractItems(text)

    return {
      merchant: merchant || 'Unknown Store',
      amount: amount || 0,
      date: date || new Date().toISOString(),
      items: items.length > 0 ? items : ['Receipt items'],
      categoryId: null, // Will be selected by user
      confidence: 0.85,
      rawText: text, // Include raw text for debugging
    }
  } catch (error) {
    console.error('OCR processing error:', error)
    throw new Error('Failed to extract text from receipt')
  }
}

// Extract merchant name from receipt text
function extractMerchant(text: string): string | null {
  // Merchant name is usually in the first few lines
  const lines = text.split('\n').filter(line => line.trim().length > 0)

  // Try to find merchant - typically one of the first 3 lines
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i].trim()
    // Skip lines that look like addresses, phone numbers, or very short lines
    if (line.length >= 3 &&
        !line.match(/^\d+/) &&
        !line.match(/^tel/i) &&
        !line.match(/^\+?\d{1,4}[\s-]?\d/)) {
      return line
    }
  }

  return lines[0]?.trim() || null
}

// Extract total amount from receipt text
function extractAmount(text: string): number | null {
  const lines = text.split('\n')

  // Common patterns for total amount
  const totalPatterns = [
    /(?:total|összesen|osszesen|vegosszeg|végösszeg|fizetendo|fizetendő|sum)[\s:]*(\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/i,
    /(\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})?)\s*(?:ft|huf|forint)/i,
    /(?:^|\s)(\d{1,3}(?:[.,\s]\d{3})*[.,]\d{2})(?:\s|$)/
  ]

  // Try to find total amount
  for (const line of lines) {
    for (const pattern of totalPatterns) {
      const match = line.match(pattern)
      if (match && match[1]) {
        // Clean up the number: remove spaces, replace comma with dot
        const cleanNumber = match[1]
          .replace(/\s/g, '')
          .replace(/,/g, '.')
          .replace(/\.(?=.*\.)/g, '') // Remove all dots except the last one

        const amount = parseFloat(cleanNumber)
        if (!isNaN(amount) && amount > 0 && amount < 1000000) {
          return amount
        }
      }
    }
  }

  // Fallback: try to find any large number that could be a total
  const amounts: number[] = []
  for (const line of lines) {
    const matches = line.matchAll(/(\d{1,3}(?:[.,\s]\d{3})*(?:[.,]\d{2})?)/g)
    for (const match of matches) {
      const cleanNumber = match[1]
        .replace(/\s/g, '')
        .replace(/,/g, '.')
        .replace(/\.(?=.*\.)/g, '')

      const amount = parseFloat(cleanNumber)
      if (!isNaN(amount) && amount > 100 && amount < 1000000) {
        amounts.push(amount)
      }
    }
  }

  // Return the largest amount found (likely the total)
  return amounts.length > 0 ? Math.max(...amounts) : null
}

// Extract date from receipt text
function extractDate(text: string): string | null {
  const datePatterns = [
    // YYYY-MM-DD or YYYY.MM.DD
    /(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/,
    // DD-MM-YYYY or DD.MM.YYYY
    /(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})/,
    // DD/MM/YY
    /(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2})/,
  ]

  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      try {
        let year, month, day

        if (match[1].length === 4) {
          // YYYY-MM-DD format
          year = parseInt(match[1])
          month = parseInt(match[2])
          day = parseInt(match[3])
        } else if (match[3].length === 4) {
          // DD-MM-YYYY format
          day = parseInt(match[1])
          month = parseInt(match[2])
          year = parseInt(match[3])
        } else {
          // DD-MM-YY format
          day = parseInt(match[1])
          month = parseInt(match[2])
          year = 2000 + parseInt(match[3])
        }

        // Validate date
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2000 && year <= 2100) {
          const date = new Date(year, month - 1, day)
          return date.toISOString()
        }
      } catch (error) {
        console.error('Date parsing error:', error)
      }
    }
  }

  return null
}

// Extract line items from receipt text
function extractItems(text: string): string[] {
  const lines = text.split('\n')
  const items: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip empty lines, headers, totals, and very short lines
    if (trimmed.length < 3) continue
    if (/^(?:total|összesen|sum|fizetendo|fizetendő|vegosszeg|tax|afa)/i.test(trimmed)) continue
    if (/^[\d.,\s]+$/.test(trimmed)) continue // Skip lines with only numbers

    // Line likely contains an item if it has text followed by a number/price
    if (/^[a-záéíóöőúüű\s-]+\s+\d+/i.test(trimmed) ||
        /^[a-záéíóöőúüű\s-]+.*\d+[.,]\d{2}/i.test(trimmed)) {
      // Extract just the item name (before the price)
      const itemMatch = trimmed.match(/^([a-záéíóöőúüű\s-]+)/i)
      if (itemMatch && itemMatch[1]) {
        items.push(itemMatch[1].trim())
      }
    }
  }

  // Limit to first 10 items
  return items.slice(0, 10)
}
