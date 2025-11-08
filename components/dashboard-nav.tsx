// Dashboard navigation component
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Tags,
  RepeatIcon,
  FileText,
  Target,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { useState } from "react"

interface DashboardNavProps {
  locale: string
}

export function DashboardNav({ locale }: DashboardNavProps) {
  const pathname = usePathname()
  const t = useTranslations()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const routes = [
    {
      label: t("dashboard.title"),
      icon: LayoutDashboard,
      href: `/${locale}/dashboard`,
      active: pathname === `/${locale}/dashboard`,
    },
    {
      label: t("budgets.title"),
      icon: Wallet,
      href: `/${locale}/budgets`,
      active: pathname?.startsWith(`/${locale}/budgets`),
    },
    {
      label: t("transactions.title"),
      icon: ArrowLeftRight,
      href: `/${locale}/transactions`,
      active: pathname?.startsWith(`/${locale}/transactions`),
    },
    {
      label: t("categories.title"),
      icon: Tags,
      href: `/${locale}/categories`,
      active: pathname?.startsWith(`/${locale}/categories`),
    },
    {
      label: t("recurring.title"),
      icon: RepeatIcon,
      href: `/${locale}/recurring`,
      active: pathname?.startsWith(`/${locale}/recurring`),
    },
    {
      label: t("reports.title"),
      icon: FileText,
      href: `/${locale}/reports`,
      active: pathname?.startsWith(`/${locale}/reports`),
    },
    {
      label: t("goals.title"),
      icon: Target,
      href: `/${locale}/goals`,
      active: pathname?.startsWith(`/${locale}/goals`),
    },
  ]

  return (
    <>
      {/* Mobile menu button - only show when sidebar is closed */}
      {!mobileMenuOpen && (
        <div className="md:hidden fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Navigation sidebar */}
      <nav className={cn(
        "fixed left-0 top-0 z-40 h-full w-64 bg-card border-r flex flex-col transition-transform duration-200",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">{t("common.appName")}</h2>
          {/* Close button inside sidebar on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 px-3 py-2">
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-x-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors",
                  route.active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="p-3 border-t space-y-1">
          <Link
            href={`/${locale}/settings`}
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-x-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors",
              pathname?.startsWith(`/${locale}/settings`)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Settings className="h-5 w-5" />
            {t("common.settings")}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: `/${locale}/auth/signin` })}
            className="w-full flex items-center gap-x-2 text-sm font-medium px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {t("common.logout")}
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
