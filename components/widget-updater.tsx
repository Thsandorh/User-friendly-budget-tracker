"use client"

import { useEffect } from "react"
import { updateBudgetWidget } from "@/lib/widget-updater"

interface WidgetUpdaterProps {
  dailyLimit: number
  spentToday: number
}

/**
 * Component that automatically updates Android widget when budget data changes
 * This is a client component that runs on mount and when data changes
 */
export function WidgetUpdater({ dailyLimit, spentToday }: WidgetUpdaterProps) {
  useEffect(() => {
    // Update widget when component mounts or data changes
    updateBudgetWidget(dailyLimit, spentToday)
  }, [dailyLimit, spentToday])

  // This component doesn't render anything
  return null
}
