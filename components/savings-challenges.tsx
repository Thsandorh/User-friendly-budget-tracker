"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Trophy, Plus, TrendingUp, Calendar, X, CheckCircle2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"

interface SavingsChallenge {
  id: string
  name: string
  description: string
  targetAmount: number
  currentAmount: number
  startDate: string
  endDate: string
  isCompleted: boolean
  reward?: string
  icon: string
  color: string
}

export function SavingsChallenges({ locale }: { locale: string }) {
  const [challenges, setChallenges] = useState<SavingsChallenge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [progressDialogOpen, setProgressDialogOpen] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<SavingsChallenge | null>(null)
  const [progressAmount, setProgressAmount] = useState("")
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    targetAmount: "",
    endDate: "",
    reward: "",
    icon: "🏆",
  })

  const fetchChallenges = async () => {
    try {
      const response = await fetch('/api/savings-challenges')
      if (response.ok) {
        const data = await response.json()
        setChallenges(data)
      }
    } catch (error) {
      console.error('Error fetching challenges:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchChallenges()
  }, [])

  const handleCreateChallenge = async () => {
    if (!formData.name || !formData.description || !formData.targetAmount || !formData.endDate) {
      toast({
        title: locale === 'hu' ? "Hiányzó mezők" : "Missing fields",
        description: locale === 'hu'
          ? "Kérlek töltsd ki az összes kötelező mezőt"
          : "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/savings-challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          targetAmount: parseFloat(formData.targetAmount),
        }),
      })

      if (response.ok) {
        toast({
          title: locale === 'hu' ? "Kihívás létrehozva!" : "Challenge created!",
          description: locale === 'hu'
            ? "Új megtakarítási kihívás elindítva"
            : "New savings challenge started",
        })
        setCreateDialogOpen(false)
        setFormData({
          name: "",
          description: "",
          targetAmount: "",
          endDate: "",
          reward: "",
          icon: "🏆",
        })
        fetchChallenges()
        router.refresh()
      }
    } catch (error) {
      toast({
        title: locale === 'hu' ? "Hiba" : "Error",
        description: locale === 'hu'
          ? "Nem sikerült létrehozni a kihívást"
          : "Failed to create challenge",
        variant: "destructive",
      })
    }
  }

  const handleUpdateProgress = async () => {
    if (!selectedChallenge || !progressAmount) return

    try {
      const response = await fetch('/api/savings-challenges/update-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengeId: selectedChallenge.id,
          amount: parseFloat(progressAmount),
        }),
      })

      if (response.ok) {
        const data = await response.json()

        if (data.isCompleted && !selectedChallenge.isCompleted) {
          toast({
            title: locale === 'hu' ? "🎉 Gratulálunk!" : "🎉 Congratulations!",
            description: locale === 'hu'
              ? `Teljesítetted a kihívást: ${selectedChallenge.name}!`
              : `You completed the challenge: ${selectedChallenge.name}!`,
          })
        } else {
          toast({
            title: locale === 'hu' ? "Előrehaladás frissítve!" : "Progress updated!",
            description: locale === 'hu'
              ? `+${progressAmount} Ft hozzáadva`
              : `+${progressAmount} Ft added`,
          })
        }

        setProgressDialogOpen(false)
        setProgressAmount("")
        setSelectedChallenge(null)
        fetchChallenges()
        router.refresh()
      }
    } catch (error) {
      toast({
        title: locale === 'hu' ? "Hiba" : "Error",
        description: locale === 'hu'
          ? "Nem sikerült frissíteni az előrehaladást"
          : "Failed to update progress",
        variant: "destructive",
      })
    }
  }

  const handleDeleteChallenge = async (challengeId: string) => {
    try {
      const response = await fetch(`/api/savings-challenges?id=${challengeId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: locale === 'hu' ? "Kihívás törölve" : "Challenge deleted",
        })
        fetchChallenges()
        router.refresh()
      }
    } catch (error) {
      toast({
        title: locale === 'hu' ? "Hiba" : "Error",
        description: locale === 'hu'
          ? "Nem sikerült törölni a kihívást"
          : "Failed to delete challenge",
        variant: "destructive",
      })
    }
  }

  const openProgressDialog = (challenge: SavingsChallenge) => {
    setSelectedChallenge(challenge)
    setProgressDialogOpen(true)
  }

  const activeChallenges = challenges.filter(c => !c.isCompleted)
  const completedChallenges = challenges.filter(c => c.isCompleted)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            {locale === 'hu' ? 'Megtakarítási Kihívások' : 'Savings Challenges'}
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              {locale === 'hu' ? 'Megtakarítási Kihívások' : 'Savings Challenges'}
            </CardTitle>
            <Button onClick={() => setCreateDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              {locale === 'hu' ? 'Új Kihívás' : 'New Challenge'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {challenges.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{locale === 'hu' ? 'Még nincs kihívásod' : 'No challenges yet'}</p>
              <p className="text-sm mt-2">
                {locale === 'hu'
                  ? 'Hozz létre egy új megtakarítási kihívást!'
                  : 'Create a new savings challenge to get started!'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Active Challenges */}
              {activeChallenges.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {locale === 'hu' ? 'Aktív Kihívások' : 'Active Challenges'}
                  </h3>
                  {activeChallenges.map((challenge) => {
                    const progress = (challenge.currentAmount / challenge.targetAmount) * 100
                    const daysLeft = Math.ceil(
                      (new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    )

                    return (
                      <div
                        key={challenge.id}
                        className="border rounded-lg p-4 space-y-3 hover:border-primary transition-colors relative group"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteChallenge(challenge.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>

                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{challenge.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-lg">{challenge.name}</h4>
                            <p className="text-sm text-muted-foreground">{challenge.description}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {locale === 'hu' ? 'Előrehaladás:' : 'Progress:'}
                            </span>
                            <span className="font-semibold">
                              {challenge.currentAmount.toLocaleString('hu-HU')} / {challenge.targetAmount.toLocaleString('hu-HU')} Ft
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{progress.toFixed(0)}%</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {daysLeft > 0
                                ? (locale === 'hu' ? `${daysLeft} nap van hátra` : `${daysLeft} days left`)
                                : (locale === 'hu' ? 'Lejárt' : 'Expired')}
                            </span>
                          </div>
                        </div>

                        {challenge.reward && (
                          <div className="text-xs bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-100 px-3 py-2 rounded-md">
                            <span className="font-medium">
                              {locale === 'hu' ? 'Jutalom:' : 'Reward:'}
                            </span>{' '}
                            {challenge.reward}
                          </div>
                        )}

                        <Button
                          onClick={() => openProgressDialog(challenge)}
                          className="w-full"
                          variant="outline"
                        >
                          <TrendingUp className="h-4 w-4 mr-2" />
                          {locale === 'hu' ? 'Előrehaladás hozzáadása' : 'Add Progress'}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Completed Challenges */}
              {completedChallenges.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {locale === 'hu' ? 'Teljesített Kihívások' : 'Completed Challenges'}
                  </h3>
                  {completedChallenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      className="border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20 rounded-lg p-4 space-y-2 relative group"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteChallenge(challenge.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>

                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold flex items-center gap-2">
                            {challenge.name}
                            <span className="text-2xl">{challenge.icon}</span>
                          </h4>
                          <p className="text-sm text-muted-foreground">{challenge.description}</p>
                          <p className="text-sm font-semibold text-green-700 dark:text-green-300 mt-1">
                            {challenge.targetAmount.toLocaleString('hu-HU')} Ft {locale === 'hu' ? 'összegyűjtve!' : 'saved!'}
                          </p>
                          {challenge.reward && (
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                              🎁 {challenge.reward}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Challenge Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {locale === 'hu' ? 'Új Megtakarítási Kihívás' : 'New Savings Challenge'}
            </DialogTitle>
            <DialogDescription>
              {locale === 'hu'
                ? 'Állíts be egy új megtakarítási célt magadnak'
                : 'Set a new savings goal for yourself'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {locale === 'hu' ? 'Név' : 'Name'} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={locale === 'hu' ? 'pl. Nyaralás' : 'e.g. Vacation'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                {locale === 'hu' ? 'Leírás' : 'Description'} *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={locale === 'hu' ? 'Mit szeretnél elérni?' : 'What do you want to achieve?'}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAmount">
                {locale === 'hu' ? 'Cél összeg (Ft)' : 'Target Amount (Ft)'} *
              </Label>
              <Input
                id="targetAmount"
                type="number"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">
                {locale === 'hu' ? 'Határidő' : 'Deadline'} *
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reward">
                {locale === 'hu' ? 'Jutalom (opcionális)' : 'Reward (optional)'}
              </Label>
              <Input
                id="reward"
                value={formData.reward}
                onChange={(e) => setFormData({ ...formData, reward: e.target.value })}
                placeholder={locale === 'hu' ? 'Mit kapsz, ha teljesíted?' : 'What will you get when you complete it?'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">
                {locale === 'hu' ? 'Ikon (emoji)' : 'Icon (emoji)'}
              </Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="🏆"
                maxLength={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {locale === 'hu' ? 'Mégse' : 'Cancel'}
            </Button>
            <Button onClick={handleCreateChallenge}>
              {locale === 'hu' ? 'Létrehozás' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progress Update Dialog */}
      <Dialog open={progressDialogOpen} onOpenChange={setProgressDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedChallenge && (
                <>
                  <span className="text-2xl">{selectedChallenge.icon}</span>
                  {selectedChallenge.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {locale === 'hu'
                ? 'Mennyit szeretnél hozzáadni a megtakarításodhoz?'
                : 'How much would you like to add to your savings?'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="progressAmount">
                {locale === 'hu' ? 'Összeg (Ft)' : 'Amount (Ft)'}
              </Label>
              <Input
                id="progressAmount"
                type="number"
                value={progressAmount}
                onChange={(e) => setProgressAmount(e.target.value)}
                placeholder="0"
                autoFocus
              />
            </div>
            {selectedChallenge && (
              <div className="text-sm text-muted-foreground">
                {locale === 'hu' ? 'Jelenlegi összeg:' : 'Current amount:'}{' '}
                <span className="font-semibold">
                  {selectedChallenge.currentAmount.toLocaleString('hu-HU')} Ft
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProgressDialogOpen(false)}>
              {locale === 'hu' ? 'Mégse' : 'Cancel'}
            </Button>
            <Button onClick={handleUpdateProgress} disabled={!progressAmount}>
              {locale === 'hu' ? 'Hozzáadás' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
