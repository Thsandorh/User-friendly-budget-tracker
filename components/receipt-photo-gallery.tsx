"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, X, Image as ImageIcon } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface ReceiptPhoto {
  id: string
  url: string
  fileName: string
  uploadedAt: string
  transactionId: string
  transaction?: {
    description: string
    amount: number
    date: string
  }
}

export function ReceiptPhotoGallery({ locale }: { locale: string }) {
  const [photos, setPhotos] = useState<ReceiptPhoto[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<ReceiptPhoto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/receipt-photos')
      if (response.ok) {
        const data = await response.json()
        setPhotos(data)
      }
    } catch (error) {
      console.error('Error fetching receipt photos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotos()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-purple-500" />
            {locale === 'hu' ? 'Nyugta Fotók' : 'Receipt Photos'}
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

  if (photos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-purple-500" />
            {locale === 'hu' ? 'Nyugta Fotók' : 'Receipt Photos'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{locale === 'hu' ? 'Nincs még feltöltött fotó' : 'No photos uploaded yet'}</p>
            <p className="text-sm mt-2">
              {locale === 'hu'
                ? 'Használd a "Nyugta Szkenner" funkciót fotók feltöltéséhez'
                : 'Use the "Receipt Scanner" to upload photos'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-purple-500" />
            {locale === 'hu' ? 'Nyugta Fotók' : 'Receipt Photos'}
            <span className="text-sm font-normal text-muted-foreground">
              ({photos.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-primary transition-all"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.url}
                  alt={photo.fileName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-white" />
                </div>
                {photo.transaction && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-white text-xs truncate">
                      {photo.transaction.description}
                    </p>
                    <p className="text-white/80 text-[10px]">
                      {photo.transaction.amount.toLocaleString('hu-HU')} Ft
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl">
          {selectedPhoto && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.fileName}
                  className="w-full rounded-lg"
                />
              </div>
              {selectedPhoto.transaction && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {locale === 'hu' ? 'Tranzakció:' : 'Transaction:'}
                    </span>
                    <span className="font-semibold">
                      {selectedPhoto.transaction.description}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {locale === 'hu' ? 'Összeg:' : 'Amount:'}
                    </span>
                    <span className="font-bold text-lg">
                      {selectedPhoto.transaction.amount.toLocaleString('hu-HU')} Ft
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {locale === 'hu' ? 'Dátum:' : 'Date:'}
                    </span>
                    <span>
                      {new Date(selectedPhoto.transaction.date).toLocaleDateString(locale)}
                    </span>
                  </div>
                </div>
              )}
              <div className="text-xs text-muted-foreground text-center">
                {selectedPhoto.fileName} • {new Date(selectedPhoto.uploadedAt).toLocaleString(locale)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
