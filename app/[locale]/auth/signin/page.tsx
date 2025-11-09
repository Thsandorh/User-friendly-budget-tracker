// Sign in page with landing page
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import {
  Wallet,
  TrendingUp,
  Target,
  Receipt,
  PieChart,
  Smartphone,
  CheckCircle2,
  Calendar,
  Shield,
  Zap,
  Download,
  Globe
} from "lucide-react"

export default function SignInPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter()
  const t = useTranslations()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    try {
      if (isSignUp) {
        // Sign up
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        })

        if (!response.ok) {
          throw new Error("Signup failed")
        }

        // Auto sign in after signup
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          toast({
            title: t("errors.generic"),
            description: t("auth.invalidCredentials"),
            variant: "destructive",
          })
        } else {
          router.push(`/${locale}/dashboard`)
          router.refresh()
        }
      } else {
        // Sign in
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          toast({
            title: t("errors.generic"),
            description: t("auth.invalidCredentials"),
            variant: "destructive",
          })
        } else {
          router.push(`/${locale}/dashboard`)
          router.refresh()
        }
      }
    } catch (error) {
      toast({
        title: t("errors.generic"),
        description: t("errors.networkError"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: Wallet,
      title: locale === 'hu' ? "Költségvetés kezelés" : "Budget Management",
      description: locale === 'hu' ? "Hozz létre több költségvetést és kövesd őket valós időben" : "Create multiple budgets and track them in real-time"
    },
    {
      icon: Receipt,
      title: locale === 'hu' ? "Nyugta szkennelés" : "Receipt Scanning",
      description: locale === 'hu' ? "OCR technológia a nyugták automatikus rögzítéséhez" : "OCR technology for automatic receipt capture"
    },
    {
      icon: Target,
      title: locale === 'hu' ? "Napi limit" : "Daily Limit",
      description: locale === 'hu' ? "Állíts be napi költési limitet és kövesd a haladást" : "Set daily spending limits and track progress"
    },
    {
      icon: PieChart,
      title: locale === 'hu' ? "Részletes riportok" : "Detailed Reports",
      description: locale === 'hu' ? "Vizuális grafikonok és összesítők" : "Visual charts and summaries"
    },
    {
      icon: Calendar,
      title: locale === 'hu' ? "Ismétlődő kiadások" : "Recurring Expenses",
      description: locale === 'hu' ? "Előfizetések és számlák nyomon követése" : "Track subscriptions and bills"
    },
    {
      icon: Smartphone,
      title: locale === 'hu' ? "Mobil App" : "Mobile App",
      description: locale === 'hu' ? "Androidos natív alkalmazás" : "Native Android application"
    }
  ]

  const benefits = [
    locale === 'hu' ? "100% ingyenes, nincs rejtett költség" : "100% free, no hidden costs",
    locale === 'hu' ? "Offline támogatás" : "Offline support",
    locale === 'hu' ? "Biztonságos adattárolás" : "Secure data storage",
    locale === 'hu' ? "Magyar és angol nyelv" : "Hungarian and English language",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Language Selector */}
      <div className="container mx-auto px-4 pt-4">
        <div className="flex justify-end gap-2">
          <Link
            href="/en/auth/signin"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              locale === 'en'
                ? 'bg-primary text-primary-foreground'
                : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium">EN</span>
          </Link>
          <Link
            href="/hu/auth/signin"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              locale === 'hu'
                ? 'bg-primary text-primary-foreground'
                : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium">HU</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[calc(100vh-4rem)]">

          {/* Left side - Landing Page Content */}
          <div className="space-y-8">
            {/* Hero */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
                <Zap className="h-4 w-4" />
                {locale === 'hu' ? 'Professzionális pénzügyi menedzsment' : 'Professional Financial Management'}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Budget Tracker
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground">
                {locale === 'hu'
                  ? 'Tartsd kézben a pénzügyeidet egy helyen'
                  : 'Take control of your finances in one place'}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">{locale === 'hu' ? 'Ingyenes' : 'Free'}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  <Shield className="h-8 w-8 mx-auto" />
                </div>
                <div className="text-sm text-muted-foreground">{locale === 'hu' ? 'Biztonságos' : 'Secure'}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">{locale === 'hu' ? 'Hozzáférés' : 'Access'}</div>
              </div>
            </div>

            {/* Android APK Download */}
            <div className="pt-4">
              <a
                href="https://github.com/Thsandorh/User-friendly-budget-tracker/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Download className="h-5 w-5" />
                <span>
                  {locale === 'hu'
                    ? 'Android APK letöltése'
                    : 'Download Android APK'}
                </span>
              </a>
              <p className="text-xs text-center text-muted-foreground mt-2">
                {locale === 'hu'
                  ? 'Töltsd le az alkalmazást közvetlenül GitHub-ról'
                  : 'Download the app directly from GitHub'}
              </p>
            </div>
          </div>

          {/* Right side - Auth Forms */}
          <div className="lg:sticky lg:top-8">
            <Card className="w-full max-w-md mx-auto shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {locale === 'hu' ? 'Kezdj el most!' : 'Get Started Now!'}
                </CardTitle>
                <CardDescription>
                  {locale === 'hu'
                    ? 'Jelentkezz be vagy hozz létre új fiókot'
                    : 'Sign in or create a new account'}
                </CardDescription>
              </CardHeader>

              <Tabs defaultValue="signin" className="w-full" onValueChange={(v) => setIsSignUp(v === 'signup')}>
                <CardContent className="pt-6 pb-0">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">{t("auth.signIn")}</TabsTrigger>
                    <TabsTrigger value="signup">{t("auth.signUp")}</TabsTrigger>
                  </TabsList>
                </CardContent>

                <form onSubmit={onSubmit}>
                  <TabsContent value="signin">
                    <CardContent className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("auth.email")}</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="pelda@email.com"
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">{t("auth.password")}</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </CardContent>
                  </TabsContent>

                  <TabsContent value="signup">
                    <CardContent className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t("auth.name")}</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder={locale === 'hu' ? 'Neved' : 'Your name'}
                          required={isSignUp}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email-signup">{t("auth.email")}</Label>
                        <Input
                          id="email-signup"
                          name="email"
                          type="email"
                          placeholder="pelda@email.com"
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-signup">{t("auth.password")}</Label>
                        <Input
                          id="password-signup"
                          name="password"
                          type="password"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </CardContent>
                  </TabsContent>

                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                      {isLoading ? (
                        <>{t("common.loading")}</>
                      ) : isSignUp ? (
                        <>{t("auth.signUp")}</>
                      ) : (
                        <>{t("auth.signIn")}</>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Tabs>
            </Card>

            {/* Privacy notice */}
            <p className="text-center text-sm text-muted-foreground mt-4 max-w-md mx-auto">
              {locale === 'hu'
                ? 'Regisztrációval elfogadod az adatvédelmi szabályzatot. Adataid biztonságban vannak.'
                : 'By signing up, you agree to our privacy policy. Your data is secure.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
