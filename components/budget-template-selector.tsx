// Component for selecting budget templates when creating a new budget
"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, FileText } from "lucide-react"

interface BudgetTemplateProps {
  onSelect: (template: any) => void
  onSkip: () => void
}

export function BudgetTemplateSelector({ onSelect, onSkip }: BudgetTemplateProps) {
  const t = useTranslations()
  const [templates, setTemplates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/budget-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates)
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (template: any) => {
    setSelectedId(template.id)
    onSelect(template)
  }

  if (isLoading) {
    return <div className="text-center py-8">{t("common.loading")}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose a Budget Template</h3>
        <p className="text-sm text-muted-foreground">
          Start with a proven budgeting strategy or create your own from scratch
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedId === template.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleSelect(template)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                {template.name}
                {selectedId === template.id && (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                )}
              </CardTitle>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {template.categories.map((cat: any, index: number) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{cat.name}</span>
                    <Badge variant="outline">{cat.percentage}%</Badge>
                  </div>
                ))}
              </div>
              {template.isPublic && (
                <Badge variant="secondary" className="mt-3">
                  <FileText className="h-3 w-3 mr-1" />
                  Popular
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onSkip}>
          Skip - Create Manually
        </Button>
        <Button onClick={() => selectedId && onSelect(templates.find(t => t.id === selectedId))} disabled={!selectedId}>
          Use Selected Template
        </Button>
      </div>
    </div>
  )
}
