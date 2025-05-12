"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getBrowserTimezone, addTimezoneHeader } from "@/lib/timezone-utils"
import Link from "next/link"
import LinkedAccountsSection from "./LinkedAccountsSection"
import { useSession, subscription, authClient } from "@/lib/auth-client"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { toast } = useToast()
  const [isFetching, setIsFetching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    reminderMinutes: 30,
    aiSuggestedReminders: false,
    weeklyReview: false,
    timezone: getBrowserTimezone(),
    showInputAtBottom: false
  })
  const { data: session } = useSession()
  const [plan, setPlan] = useState<string | null>(null)
  const [isPortalLoading, setIsPortalLoading] = useState(false)

  // Prefetch settings on mount so dialog opens immediately with data
  useEffect(() => {
    fetchSettings()
  }, [])

  // Fetch subscription plan when user session is available
  useEffect(() => {
    if (!session?.user) return
    const fetchSubscription = async () => {
      try {
        const resp = await subscription.list()
        const subs = resp.data ?? []
        const active = subs.find((s: any) => s.status === "active" || s.status === "trialing")
        setPlan(active?.plan ?? "free")
      } catch (err) {
        console.error("Error fetching subscription:", err)
        // Don't show error toast for the known date error
        if (err instanceof RangeError && err.message.includes("Invalid time value")) {
          console.log("Handling known date error in subscription data")
          setPlan("free") // Default to free plan when there's a date parsing error
        } else {
          toast({
            title: "Error",
            description: "Failed to load subscription data",
            variant: "destructive",
          })
        }
      }
    }
    fetchSubscription()
  }, [session?.user])

  // Precompute timezone options with local timezone first
  const allTimezones = useMemo(() => Intl.supportedValuesOf("timeZone"), [])
  const localTimezone = getBrowserTimezone()
  const timezoneOptions = useMemo(() => {
    const otherTzs = allTimezones.filter((tz) => tz !== localTimezone)
    return [localTimezone, ...otherTzs]
  }, [allTimezones, localTimezone])

  const fetchSettings = async () => {
    try {
      setIsFetching(true)
      const response = await fetch("/api/user/settings", {
        headers: addTimezoneHeader()
      })
      if (!response.ok) {
        throw new Error("Failed to fetch settings")
      }
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsFetching(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const response = await fetch("/api/user/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...addTimezoneHeader()
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Launch Stripe Customer Portal or Upgrade
  const handlePortal = async () => {
    setIsPortalLoading(true)
    try {
      let result: any
      if (plan === 'pro') {
        const { data, error } = await subscription.cancel({
          returnUrl: new URL('/?settings=true', window.location.origin).toString()
        });

        if (error) {
          console.error("Error canceling subscription:", error)
          throw error;
        }

        if (data?.url) {
          window.location.href = data.url;
        }
      } else {
        result = await subscription.upgrade({
          plan: 'pro',
          successUrl: new URL('/?settings=true', window.location.origin).toString(),
          cancelUrl: new URL('/?settings=true', window.location.origin).toString()
        })
        const url = result.data?.url
        if (url) window.location.href = url
      }
    } catch (err) {
      console.error("Error opening billing portal:", err)
      toast({
        title: "Error",
        description: plan === 'pro'
          ? "Could not cancel subscription. Please try again later."
          : "Could not open billing portal",
        variant: "destructive",
      })
    } finally {
      setIsPortalLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[70%] md:max-w-[600px] w-[calc(100%-24px)] mx-auto h-[90vh] sm:h-[80%] flex flex-col overflow-hidden bg-background">
        <DialogHeader className="px-4 sm:px-6 pt-4 pb-3 border-b flex-shrink-0">
          <DialogTitle className="text-xl sm:text-2xl font-semibold tracking-tight">Settings</DialogTitle>
        </DialogHeader>

        <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8 overflow-y-auto flex-grow">
          {/* Linked Accounts Section */}
          

          {/* Subscription Section */}
          <div className="space-y-2 sm:space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Subscription</h2>
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
              <div>
                <p className="text-sm sm:text-base">
                  Plan: <span className="font-medium">{plan === null ? 'Loading...' : plan === 'pro' ? 'Pro' : 'Free'}</span>
                </p>
                {plan === 'pro' && (
                  <p className="text-xs text-muted-foreground">
                    You're on Pro — up to 5 workspaces included
                  </p>
                )}
              </div>
              {session?.user ? (
                <Button onClick={handlePortal} disabled={plan === null || isPortalLoading}>
                  {isPortalLoading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : plan === 'pro' ? (
                    'Manage Subscription'
                  ) : (
                    'Upgrade to Pro'
                  )}
                </Button>
              ) : (
                <Link href="/api/auth/signin">
                  <Button>Log in to manage</Button>
                </Link>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Plan Comparison</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 rounded-lg p-3">
                  <h4 className="font-medium mb-2">Free</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-1.5">✓</span>
                      <span>Up to 3 workspaces</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-1.5">✓</span>
                      <span>Add 1 collaborator per workspace</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-1.5">✓</span>
                      <span>Basic AI model with limited context</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-to-b from-violet-500/10 to-purple-500/5 rounded-lg p-3 border border-violet-200 dark:border-violet-900/40">
                  <h4 className="font-medium mb-2">Pro</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-start">
                      <span className="text-violet-500 mr-1.5">✓</span>
                      <span>Up to 5 workspaces</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-violet-500 mr-1.5">✓</span>
                      <span>Add up to 5 users per workspace</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-violet-500 mr-1.5">✓</span>
                      <span>Advanced AI models with better context understanding</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Note:</span> You can only have one active subscription at a time.
            </p>
          </div>

          <LinkedAccountsSection />

          {/* Email Alerts Section */}
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Email Alerts</h2>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between py-3 border-t gap-2 sm:gap-0">
                <div className="space-y-0.5">
                  <Label className="text-sm sm:text-base font-medium">Input Position</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Show the todo input at the bottom of the screen
                  </p>
                </div>
                <div className="pt-1">
                  <Switch
                    checked={settings.showInputAtBottom}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      showInputAtBottom: checked
                    }))}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between py-3 border-t gap-2 sm:gap-0">
                <div className="space-y-0.5">
                  <Label className="text-sm sm:text-base font-medium">AI-suggested todo reminders</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Receive AI-powered suggestions for new todos based on your patterns
                  </p>
                </div>
                <div className="pt-1">
                  <Switch
                    checked={settings.aiSuggestedReminders}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      aiSuggestedReminders: checked
                    }))}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between py-3 border-t gap-2 sm:gap-0">
                <div className="space-y-0.5">
                  <Label className="text-sm sm:text-base font-medium">Weekly todo review</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Receive a weekly summary of completed todos and productivity insights
                  </p>
                </div>
                <div className="pt-1">
                  <Switch
                    checked={settings.weeklyReview}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      weeklyReview: checked
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>



          {/* Legal Section */}
          <div className="space-y-2 sm:space-y-3">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Legal</h2>
            <div className="space-y-2">

              <div className="flex justify-between items-center py-2">
                <p className="text-xs sm:text-sm font-medium">Terms of Service</p>
                <Link href="/terms" className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:underline" onClick={() => onOpenChange(false)}>
                  View
                </Link>
              </div>


              <div className="flex justify-between items-center py-2">
                <p className="text-xs sm:text-sm font-medium">Privacy Policy</p>
                <Link href="/privacy" className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:underline" onClick={() => onOpenChange(false)}>
                  View
                </Link>
              </div>

            </div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-3 px-4 sm:px-6 py-3 border-t bg-muted/5 flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="min-w-[80px] sm:min-w-[100px] text-xs sm:text-sm"
          >
            {isSaving ? (
              <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 