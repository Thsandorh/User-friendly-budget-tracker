// Widget updater for Android home screen widget
import { Capacitor } from '@capacitor/core'

interface BudgetWidgetPlugin {
  updateWidget(options: { dailyLimit: number; spentToday: number }): Promise<{ success: boolean; message: string }>
  isWidgetAdded(): Promise<{ added: boolean; count: number }>
}

// Only load plugin on Android
const getBudgetWidgetPlugin = (): BudgetWidgetPlugin | null => {
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
    try {
      const { registerPlugin } = require('@capacitor/core')
      return registerPlugin('BudgetWidget') as BudgetWidgetPlugin
    } catch (e) {
      console.warn('BudgetWidget plugin not available:', e)
      return null
    }
  }
  return null
}

/**
 * Update Android home screen widget with current budget data
 */
export async function updateBudgetWidget(dailyLimit: number, spentToday: number): Promise<boolean> {
  const plugin = getBudgetWidgetPlugin()

  if (!plugin) {
    // Not on Android or plugin not available
    return false
  }

  try {
    const result = await plugin.updateWidget({ dailyLimit, spentToday })
    console.log('Widget updated:', result.message)
    return result.success
  } catch (error) {
    console.error('Failed to update widget:', error)
    return false
  }
}

/**
 * Check if widget is added to home screen
 */
export async function isWidgetAdded(): Promise<boolean> {
  const plugin = getBudgetWidgetPlugin()

  if (!plugin) {
    return false
  }

  try {
    const result = await plugin.isWidgetAdded()
    return result.added
  } catch (error) {
    console.error('Failed to check widget status:', error)
    return false
  }
}
