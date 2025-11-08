// Utility functions for the application
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and tailwind-merge
 * This is useful for conditional class names with Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (e.g., "HUF", "USD", "EUR")
 * @param locale - The locale to use for formatting (e.g., "hu-HU", "en-US")
 */
export function formatCurrency(amount: number, currency: string = "HUF", locale: string = "hu-HU") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount)
}

/**
 * Formats a date
 * @param date - The date to format
 * @param locale - The locale to use for formatting
 */
export function formatDate(date: Date | string, locale: string = "hu-HU") {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj)
}

/**
 * Formats a date as a short string
 * @param date - The date to format
 * @param locale - The locale to use for formatting
 */
export function formatDateShort(date: Date | string, locale: string = "hu-HU") {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(dateObj)
}
