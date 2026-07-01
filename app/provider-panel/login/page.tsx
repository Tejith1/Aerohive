"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Plane,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Settings,
  Sparkles
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"

export default function ProviderLoginPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [checkingProvider, setCheckingProvider] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasPilotSession, setHasPilotSession] = useState(false)
  const [hasProviderSession, setHasProviderSession] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasPilotSession(!!localStorage.getItem("aerohive_pilot_session"))
      setHasProviderSession(!!localStorage.getItem("aerohive_provider_session"))
    }
  }, [])

  useEffect(() => {
    async function checkProviderStatus() {
      if (!user) return
      
      setCheckingProvider(true)
      setError(null)
      try {
        const { data, error: fetchError } = await supabase
          .from('service_providers')
          .select('id, name, is_active')
          .eq('id', user.id)
          .single()

        if (fetchError || !data) {
          // Check if they are registered as a pilot
          const { data: pilotData } = await supabase
            .from('drone_pilots')
            .select('id, full_name')
            .eq('id', user.id)
            .single()

          if (pilotData) {
            localStorage.setItem("aerohive_pilot_session", JSON.stringify(pilotData))
            router.push("/pilot-panel/dashboard")
            return
          }

          // No provider account found. Redirect to register!
          router.push('/drone-services/register')
          return
        }

        if (!data.is_active) {
          setError("Your service provider profile is currently inactive. Please contact admin support.")
          setCheckingProvider(false)
          return
        }

        // Active provider! Save provider session locally and redirect
        localStorage.setItem("aerohive_provider_session", JSON.stringify(data))
        router.push("/provider-panel/dashboard")

      } catch (err: any) {
        console.error("Provider login check error:", err)
        setError("Unable to authenticate provider. Please try again.")
        setCheckingProvider(false)
      }
    }

    if (!authLoading) {
      if (user) {
        checkProviderStatus()
      }
    }
  }, [user, authLoading, router])

  const handleMainLoginRedirect = () => {
    router.push('/login?redirect=/provider-panel/login')
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0b0f19] flex flex-col justify-between transition-colors duration-300">
      <ModernHeader />

      <main className="flex-1 pt-28 pb-16 flex items-center justify-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

        <div className="max-w-[460px] w-full px-4 relative z-10">
          <div className="mb-4 flex flex-wrap gap-2 justify-between items-center">
            <Link 
              href="/drone-services" 
              className="text-xs font-bold text-slate-500 hover:text-slate-850 dark:text-slate-405 dark:hover:text-white transition-colors flex items-center gap-1 w-fit cursor-pointer"
            >
              ← Back to Marketplace
            </Link>
            <div className="flex gap-3">
              {hasPilotSession && (
                <Link 
                  href="/pilot-panel/dashboard" 
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-350 transition-colors flex items-center gap-1 w-fit cursor-pointer"
                >
                  Aviator Dashboard →
                </Link>
              )}
              {hasProviderSession && (
                <Link 
                  href="/provider-panel/dashboard" 
                  className="text-xs font-bold text-emerald-605 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-350 transition-colors flex items-center gap-1 w-fit cursor-pointer"
                >
                  Provider Dashboard →
                </Link>
              )}
            </div>
          </div>
          <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden p-4">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center space-x-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider mb-4 mx-auto">
                <ShieldCheck className="h-3.5 w-3.5" />
                Service Provider Access
              </div>
              <CardTitle className="text-3xl font-serif font-normal text-slate-900 dark:text-white leading-tight">
                Provider Console
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Manage your services, track bookings, and confirm client missions.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-2">
              {authLoading || checkingProvider ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Securing Connection...</p>
                </div>
              ) : error ? (
                <div className="space-y-4">
                  <div className="p-4 bg-rose-50 border border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30 rounded-2xl flex items-start space-x-3 text-rose-700 dark:text-rose-400">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p className="text-xs font-medium leading-normal">{error}</p>
                  </div>
                   <Button onClick={() => window.location.reload()} className="w-full rounded-full">
                    Retry Authentication
                  </Button>
                  <div className="text-center pt-2">
                    <Link href="/drone-services" className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1">
                      ← Back to Marketplace
                    </Link>
                  </div>
                </div>
              ) : !user ? (
                <div className="space-y-5">
                  <div className="p-4 bg-muted/40 rounded-2xl space-y-2 border border-border/30">
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                      To access the Provider Console, you must first log in or create a user account on AeroHive.
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleMainLoginRedirect}
                    className="w-full bg-primary hover:bg-primary/95 text-white font-bold h-12 rounded-full transition-all border-0 shadow-sm flex items-center justify-center gap-1.5"
                  >
                    Login / Sign Up
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  
                  <div className="text-center pt-2 flex flex-col gap-2">
                    <Link href="/drone-services" className="text-xs text-primary hover:underline font-medium inline-flex items-center justify-center gap-1">
                      ← Back to Marketplace
                    </Link>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Aerohive Network</span>
                  </div>
                </div>
              ) : (
                <div className="py-6 flex flex-col items-center justify-center space-y-3 text-center">
                  <UserCheck className="h-10 w-10 text-emerald-500" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-350">Authenticated as {user.email}</p>
                  <p className="text-xs text-slate-500">Routing to Provider Panel...</p>
                  <div className="text-center pt-2">
                    <Link href="/drone-services" className="text-xs text-primary hover:underline font-medium inline-flex items-center justify-center gap-1">
                      ← Back to Marketplace
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <ModernFooter />
    </div>
  )
}
