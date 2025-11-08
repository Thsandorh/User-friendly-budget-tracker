// Dashboard layout with navigation
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { DashboardNav } from "@/components/dashboard-nav"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function DashboardLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/${locale}/auth/signin`)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav locale={locale} />
      <div className="md:pl-64">
        <div className="container mx-auto p-6">
          <div className="flex justify-end gap-2 mb-4">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
