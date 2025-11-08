// Settings page
"use client"

import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings as SettingsIcon } from "lucide-react"

export default function SettingsPage() {
  const t = useTranslations()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("settings.title")}</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.profile")}</CardTitle>
          <CardDescription>Manage your profile information</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <SettingsIcon className="h-12 w-12 text-muted-foreground mb-4 mx-auto" />
            <p className="text-muted-foreground">Profile settings</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.language")}</CardTitle>
          <CardDescription>Change your preferred language</CardDescription>
        </CardHeader>
        <CardContent className="py-8">
          <p className="text-sm text-muted-foreground">Use the language switcher in the top right corner</p>
        </CardContent>
      </Card>
    </div>
  )
}
