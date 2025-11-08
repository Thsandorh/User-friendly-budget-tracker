"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Download } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    console.log('[PWA] Component mounted')

    // Check if PWA is supported
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppiOS = (window.navigator as any).standalone === true
    const isInstalled = isStandalone || isInWebAppiOS

    console.log('[PWA] Is installed:', isInstalled)
    console.log('[PWA] Is standalone:', isStandalone)
    console.log('[PWA] User agent:', navigator.userAgent)

    if (isInstalled) {
      console.log('[PWA] App already installed, not showing prompt')
      return
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] Service Worker registered:', registration.scope)
          })
          .catch((error) => {
            console.error('[PWA] Service Worker registration failed:', error)
          })
      })
    } else {
      console.warn('[PWA] Service Worker not supported')
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[PWA] beforeinstallprompt event fired!')
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsSupported(true)

      // Check if user has previously dismissed the prompt
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      console.log('[PWA] Previously dismissed:', dismissed)

      if (!dismissed) {
        console.log('[PWA] Showing prompt in 3 seconds...')
        setTimeout(() => {
          console.log('[PWA] Displaying install prompt')
          setShowInstallPrompt(true)
        }, 3000)
      } else {
        console.log('[PWA] Prompt was dismissed before, not showing')
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For testing: Check if event will ever fire
    setTimeout(() => {
      if (!isSupported && !deferredPrompt) {
        console.warn('[PWA] beforeinstallprompt event did not fire after 5 seconds')
        console.warn('[PWA] This could mean:')
        console.warn('  1. App is already installed')
        console.warn('  2. PWA criteria not met (HTTPS, manifest, service worker)')
        console.warn('  3. Browser does not support PWA installation')
        console.warn('  4. User has already dismissed install prompt too many times')
      }
    }, 5000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
    console.log('[PWA] Install prompt dismissed by user')
  }

  const handleResetDismissed = () => {
    localStorage.removeItem('pwa-install-dismissed')
    console.log('[PWA] Dismissed flag cleared from localStorage')
    alert('PWA install prompt reset! Refresh the page to see it again.')
  }

  // Show install prompt card
  if (showInstallPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
        <Card className="shadow-lg border-2">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Install Budget Tracker</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -mr-2 -mt-2"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Install our app for a better experience and offline access
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button onClick={handleInstallClick} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Install Now
            </Button>
            <Button variant="outline" onClick={handleDismiss}>
              Not Now
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Debug button - only visible in development or if PWA was dismissed
  const isDismissed = typeof window !== 'undefined' && localStorage.getItem('pwa-install-dismissed')

  if (isDismissed) {
    return (
      <button
        onClick={handleResetDismissed}
        className="fixed bottom-4 left-4 z-50 text-xs bg-muted px-2 py-1 rounded opacity-50 hover:opacity-100"
        title="Click to reset PWA install prompt"
      >
        Reset PWA Prompt
      </button>
    )
  }

  return null
}
