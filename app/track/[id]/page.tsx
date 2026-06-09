"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import {
  ArrowLeft,
  Loader2,
  Calendar,
  Clock,
  Phone,
  MapPin,
  ShieldAlert,
  Compass,
  FileCheck,
  UserCheck,
  Navigation,
  Activity,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  Share2,
  Check,
  ShieldCheck,
  Plane
} from "lucide-react"

const getProgressPercent = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'PENDING': return 10
        case 'ACCEPTED':
        case 'VERIFIED': return 25
        case 'EN_ROUTE': return 50
        case 'ON_SITE': return 75
        case 'IN_PROGRESS': return 90
        case 'COMPLETED':
        case 'DONE': return 100
        default: return 20
    }
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Dynamically import Map to avoid SSR issues with Leaflet
const MissionMap = dynamic(() => import("@/components/MissionMap"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-muted animate-pulse flex items-center justify-center text-muted-foreground rounded-xl border border-border">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-[#e65737]" />
        <span className="text-xs font-semibold">Aligning Satellite Mapping...</span>
      </div>
    </div>
  ),
})

const STEP_ICONS: Record<string, any> = {
  PENDING: Compass,
  ACCEPTED: FileCheck,
  VERIFIED: UserCheck,
  EN_ROUTE: Navigation,
  ON_SITE: MapPin,
  IN_PROGRESS: Activity,
  COMPLETED: CheckCircle2,
}

export default function TrackingPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [shouldPoll, setShouldPoll] = useState(true)
  const [lastSyncedAt, setLastSyncedAt] = useState<string>("")

  useEffect(() => {
    if (!id || !shouldPoll) return

    fetchJobDetails()
    // Poll for updates every 3 seconds for zero latency / live experience
    const interval = setInterval(fetchJobDetails, 3000)
    return () => clearInterval(interval)
  }, [id, shouldPoll])

  const fetchJobDetails = async () => {
    try {
      const res = await fetch(`/api/jobs/details?uuid=${id}`)
      if (!res.ok) {
        if (res.status === 404) {
          // Initialize fallback mock/expired data for expired or invalid links
          setJob({
            id: id || "AH-EXPIRED",
            status: "COMPLETED",
            serviceType: "Aerial Surveillance & Mapping Shoot",
            scheduledAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
            durationHours: 2,
            clientName: "Valued AeroHive Client",
            clientPhone: "+91 99999 99999",
            lat: 12.9716, // Default beautiful location (Bengaluru center)
            lng: 77.5946,
            pilotName: "Captain R. Sharma",
            pilotPhone: "+91 98888 88888",
            estimatedAmount: 3000,
            totalAmount: 3000,
            isExpiredLink: true, // Tag it as expired
            statusSteps: [
              { key: 'PENDING', label: 'Booking Placed', completed: true },
              { key: 'ACCEPTED', label: 'Pilot Accepted', completed: true },
              { key: 'VERIFIED', label: 'Identity Verified', completed: true },
              { key: 'EN_ROUTE', label: 'Started', completed: true },
              { key: 'ON_SITE', label: 'Reached Location', completed: true },
              { key: 'IN_PROGRESS', label: 'In Work Shoot', completed: true },
              { key: 'COMPLETED', label: 'Completed', completed: true, current: true }
            ]
          })
          setLastSyncedAt(new Date().toISOString())
          setShouldPoll(false)
          return
        }
        throw new Error("Failed to load tracking details")
      }
      const data = await res.json()
      setJob(data)
      setLastSyncedAt(new Date().toISOString())
      
      // Stop polling once the job is completed or cancelled
      if (['COMPLETED', 'DONE', 'REJECTED', 'CANCELLED', 'DECLINED'].includes(data.status?.toUpperCase())) {
        setShouldPoll(false)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground gap-6 select-none relative overflow-hidden">
        {/* Glowing backgrounds */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 dark:bg-[#e65737]/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        
        {/* High-tech Radar/Drone scanning pulse */}
        <div className="relative flex items-center justify-center w-24 h-24 mb-2">
          {/* Ripple rings */}
          <div className="absolute inset-0 rounded-full border border-blue-500/10 dark:border-[#e65737]/10 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-2 rounded-full border border-indigo-500/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-4 rounded-full bg-blue-500/5 dark:bg-[#e65737]/5 border border-blue-500/15 dark:border-[#e65737]/15 flex items-center justify-center shadow-lg shadow-blue-500/5 dark:shadow-[#e65737]/5 scale-110">
            <Compass className="w-8 h-8 text-blue-600 dark:text-[#e65737] animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        </div>

        {/* Loading text with high tracking */}
        <div className="space-y-2 text-center relative z-10 max-w-sm px-4">
          <p className="text-[10px] font-black tracking-[0.25em] text-blue-600 dark:text-[#e65737] uppercase">
            AeroHive Satellite Uplink
          </p>
          <h2 className="text-sm font-bold text-muted-foreground leading-snug">
            Syncing secure mission tracking channels...
          </h2>
          <p className="text-[10px] text-muted-foreground font-semibold font-mono uppercase tracking-widest mt-1">
            Establishing Live Telemetry
          </p>
        </div>

        {/* Cinematic micro horizontal loading bar */}
        <div className="w-40 bg-muted border border-border rounded-full h-1.5 overflow-hidden shadow-inner">
          <div className="bg-gradient-to-r from-blue-600 dark:from-[#e65737] via-indigo-500 to-blue-400 dark:to-[#FF8243] h-full rounded-full animate-[loading-bar_2.5s_infinite_ease-in-out]" style={{ width: '60%' }} />
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes loading-bar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md bg-card shadow-xl p-8 rounded-3xl border border-rose-200">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
          <h1 className="text-2xl font-extrabold text-foreground">Tracking Unavailable</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 dark:bg-[#e65737] hover:bg-blue-700 dark:hover:bg-[#d44d2d] text-white font-bold px-6 py-2.5 rounded-full transition-all border-0">
            Re-establish Link
          </Button>
        </div>
      </div>
    )
  }

  if (!job) return null

  // Parse locations
  const clientLoc = { lat: job.lat || 0, lng: job.lng || 0 }
  let pilotLoc = clientLoc

  if (job.pilotLocation) {
    if (job.pilotLocation.coordinates) {
      pilotLoc = {
        lat: job.pilotLocation.coordinates[1],
        lng: job.pilotLocation.coordinates[0],
      }
    } else if (typeof job.pilotLocation === "string") {
      try {
        const parsed = JSON.parse(job.pilotLocation)
        if (parsed.coordinates) {
          pilotLoc = { lat: parsed.coordinates[1], lng: parsed.coordinates[0] }
        }
      } catch (e) {}
    }
  }

  const isTrackingActive = job.isTrackingActive
  const currentStep = job.statusSteps?.find((s: any) => s.current) || { label: "Unknown Status", description: "" }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 font-sans selection:bg-[#e65737]/10 transition-colors duration-300 relative">
      
      {/* Ambient glowing decor */}
              <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 dark:bg-[#e65737]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/3 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.01] pointer-events-none"></div>

      {/* Dynamic Header */}
      <div className="bg-card/75 border-b border-border sticky top-0 z-50 backdrop-blur-xl transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={() => {
                  if (window.history.length > 1) {
                    router.back()
                  } else {
                    router.push('/orders')
                  }
                }} 
                className="px-3 py-1.5 rounded-full text-foreground hover:bg-muted border border-border bg-card shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all flex items-center gap-1.5 font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="text-xs">Back</span>
              </Button>
              <h1 className="text-lg font-display font-semibold text-foreground tracking-tight">Telemetry Hub</h1>
            </div>
            <div className="flex flex-wrap gap-2 items-center text-[10px] font-mono text-muted-foreground font-bold uppercase tracking-wider">
              <span>ORDER ID: {job.id || "Unknown"}</span>
              {lastSyncedAt && (
                <>
                  <span>•</span>
                  <span>SYNCED {new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second:'2-digit' })}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isTrackingActive && (
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/8 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20 text-[9px] font-bold uppercase tracking-widest font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                Satellite Uplink
              </div>
            )}
            <Badge className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg border ${
              ['CANCELLED', 'DECLINED'].includes(job.status?.toUpperCase())
                ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 border-rose-200 dark:border-rose-950/30'
              : 'bg-blue-500/8 dark:bg-[#e65737]/8 text-blue-700 dark:text-[#e65737] border-blue-500/20 dark:border-[#e65737]/20'
            }`}>
              {job.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Center - Map & Telemetry Timeline */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Mission Map Container */}
            <Card className="border-border bg-card/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.01)] rounded-3xl overflow-hidden">
              <CardHeader className="pb-4 pt-5 px-6 border-b border-border bg-muted/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Plane className="w-4 h-4 text-blue-600 dark:text-[#e65737] animate-pulse" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-widest font-mono">
                      Live Geospatial Telemetry
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground font-bold uppercase">
                    GPS Fix {job.lat ? "3D Lock" : "Scanning"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="rounded-2xl overflow-hidden border border-border shadow-inner bg-background">
                  <MissionMap 
                    clientLocation={clientLoc} 
                    pilotLocation={pilotLoc} 
                    bookingId={job.id || id} 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stepper Timeline Card */}
            <Card className="border-border bg-card/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.01)] rounded-3xl overflow-hidden">
              <CardHeader className="pb-4 pt-5 px-6 border-b border-border bg-muted/40">
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-blue-600 dark:text-[#e65737] animate-spin-slow" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-widest font-mono">
                    Operation Milestone Logs
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6 md:p-8 overflow-x-auto">
                {['CANCELLED', 'DECLINED'].includes(job.status?.toUpperCase()) ? (
                  <div className="bg-rose-50/50 dark:bg-rose-950/15 border border-rose-200 dark:border-rose-950/30 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0 animate-pulse">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-sm text-rose-950 dark:text-rose-200 uppercase tracking-widest font-mono">Mission Aborted</h5>
                      <p className="text-xs text-rose-700 dark:text-rose-450 font-medium mt-1 leading-relaxed">
                        This operation has been cancelled. If you require assistance or wish to book a new mission, please connect with our dispatcher team.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="relative flex flex-col md:flex-row items-stretch justify-between gap-8 min-w-[600px] md:min-w-0">
                    {/* Connecting line for Desktop */}
                    <div className="hidden md:block absolute top-[18px] left-[40px] right-[40px] h-[2px] bg-border z-0" />
                    
                    {/* Connecting line for Mobile */}
                    <div className="md:hidden absolute left-[18px] top-[20px] bottom-[20px] w-[2px] bg-border z-0" />

                    {job.statusSteps?.map((step: any, idx: number) => {
                      const isCompleted = step.completed && !step.current
                      const isCurrent = step.current
                      
                      const getPhaseColors = (key: string) => {
                        switch (key.toUpperCase()) {
                          case 'PENDING':
                            return { dot: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', activeBg: 'bg-emerald-600', activeRing: 'ring-emerald-100 dark:ring-emerald-950/40', border: 'border-emerald-500' }
                          case 'ACCEPTED':
                            return { dot: 'bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-400', activeBg: 'bg-indigo-600', activeRing: 'ring-indigo-100 dark:ring-indigo-950/40', border: 'border-indigo-500' }
                          case 'VERIFIED':
                            return { dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400', activeBg: 'bg-amber-500', activeRing: 'ring-amber-100 dark:ring-amber-950/40', border: 'border-amber-500' }
                          case 'EN_ROUTE':
                            return { dot: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-400', activeBg: 'bg-blue-600', activeRing: 'ring-blue-100 dark:ring-blue-950/40', border: 'border-blue-500' }
                          case 'ON_SITE':
                            return { dot: 'bg-violet-500', text: 'text-violet-750 dark:text-violet-400', activeBg: 'bg-violet-600', activeRing: 'ring-violet-100 dark:ring-violet-950/40', border: 'border-violet-500' }
                          case 'IN_PROGRESS':
                            return { dot: 'bg-orange-500', text: 'text-orange-700 dark:text-orange-400', activeBg: 'bg-orange-650', activeRing: 'ring-orange-200 dark:ring-orange-950/40', border: 'border-orange-500' }
                          case 'COMPLETED':
                          case 'DONE':
                            return { dot: 'bg-blue-600 dark:bg-[#e65737]', text: 'text-blue-700 dark:text-[#e65737]', activeBg: 'bg-blue-600 dark:bg-[#e65737]', activeRing: 'ring-blue-200 dark:ring-[#e65737]/15', border: 'border-blue-600 dark:border-[#e65737]' }
                          default:
                            return { dot: 'bg-slate-500', text: 'text-slate-700 dark:text-slate-400', activeBg: 'bg-slate-650', activeRing: 'ring-slate-150', border: 'border-slate-500' }
                        }
                      }

                      const colors = getPhaseColors(step.key)

                      return (
                        <div key={step.key} className="flex md:flex-col items-center gap-4 md:gap-3 flex-1 relative z-10">
                          {/* Circle Node */}
                          <div className="relative flex items-center justify-center w-9 h-9">
                            {isCurrent ? (
                              <div className={`w-9 h-9 rounded-xl ${colors.activeBg} flex items-center justify-center ring-4 ${colors.activeRing} border border-background animate-pulse shadow-sm`}>
                                <span className="w-2 h-2 rounded-full bg-white" />
                              </div>
                            ) : isCompleted ? (
                              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center border border-background shadow-sm">
                                <Check className="w-4 h-4 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-muted border border-border flex items-center justify-center shadow-inner">
                                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                              </div>
                            )}
                          </div>

                          {/* Labels */}
                          <div className="flex items-center gap-1.5 md:mt-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? colors.dot : isCompleted ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                            <span className={`text-[11px] tracking-tight font-bold ${
                              isCurrent 
                                ? `${colors.text} bg-muted border border-border px-2.5 py-1 rounded-lg shadow-sm font-mono` 
                                : isCompleted 
                                ? 'text-foreground' 
                                : 'text-muted-foreground/60'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Right Column - Security & Flight Manifesto */}
          <div className="space-y-8">
            
            {/* OTP display container */}
            {job.otp && !['CANCELLED', 'DECLINED'].includes(job.status?.toUpperCase()) && (
              <Card className="border-amber-200/70 dark:border-amber-950/30 bg-amber-50/50 dark:bg-amber-950/10 shadow-[0_4px_20px_rgba(0,0,0,0.01)] rounded-3xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/10 dark:bg-amber-900/5 rounded-full blur-2xl pointer-events-none" />
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-11 h-11 bg-amber-100/80 dark:bg-amber-955/30 rounded-xl flex items-center justify-center mx-auto text-amber-700 dark:text-amber-500 border border-amber-200/50 dark:border-amber-900/30">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-widest font-mono">Security Dispatch OTP</h3>
                    <p className="text-[11px] text-amber-600 dark:text-amber-500 font-medium">Verify with pilot at the operation site</p>
                  </div>
                  <div className="bg-background border border-amber-200 dark:border-amber-950/40 rounded-2xl py-3.5 shadow-sm max-w-[200px] mx-auto">
                    <span className="text-3xl font-mono font-black text-amber-750 dark:text-amber-400 tracking-[0.25em] pl-[0.25em]">{job.otp}</span>
                  </div>
                  <p className="text-[9px] text-amber-800/80 dark:text-amber-500/80 font-bold italic">Do not disclose this token electronically.</p>
                </CardContent>
              </Card>
            )}

            {/* Flight Manifesto details */}
            <Card className="border-border bg-card/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.01)] rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-border p-5 bg-muted/40">
                <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-widest font-mono">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-[#e65737]" />
                  Flight Manifesto
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-5 space-y-5">
                {/* Client Details */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block">Ordered By</span>
                  <div className="flex items-center gap-3 bg-muted p-3 rounded-xl border border-border/40">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 dark:bg-[#e65737]/10 border border-blue-500/20 dark:border-[#e65737]/20 flex items-center justify-center text-blue-600 dark:text-[#e65737] font-mono font-bold text-xs uppercase">
                      {job.clientName ? job.clientName[0] : 'C'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground text-xs truncate">{job.clientName || 'AeroHive Client'}</p>
                      <p className="text-[10px] text-muted-foreground font-bold mt-0.5 font-mono truncate">{job.clientPhone || '+91 99999 99999'}</p>
                    </div>
                  </div>
                </div>

                {/* Assigned Pilot */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block">Assigned Operator</span>
                  <div className="flex items-center gap-3 bg-muted p-3 rounded-xl border border-border/40">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-450 text-xs">
                      👨‍✈️
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground text-xs truncate">{job.pilotName || "Assigning Operator..."}</p>
                      <p className="text-[8px] text-emerald-600 dark:text-emerald-500 font-bold mt-0.5 uppercase tracking-wider font-mono">
                        {job.pilotPhone ? "DGCA CERTIFIED PILOT" : "PENDING ALLOCATION"}
                      </p>
                    </div>
                  </div>
                  {job.pilotPhone && (
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted p-2.5 rounded-xl border border-border/40 font-mono font-bold">
                      <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-[#e65737]" />
                      <span>{job.pilotPhone}</span>
                    </div>
                  )}
                </div>

                {/* Technical Flight Specs */}
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5 font-bold uppercase tracking-widest text-[9px]">
                      <Calendar className="w-3.5 h-3.5" /> Scheduled
                    </span>
                    <span className="font-bold text-foreground">
                      {job.scheduledAt ? new Date(job.scheduledAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5 font-bold uppercase tracking-widest text-[9px]">
                      <Clock className="w-3.5 h-3.5" /> Duration
                    </span>
                    <span className="font-bold text-foreground">
                      {job.durationHours || "—"} hr{job.durationHours !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5 font-bold uppercase tracking-widest text-[9px]">
                      <Compass className="w-3.5 h-3.5" /> Target Sector
                    </span>
                    <span className="font-bold text-foreground max-w-[150px] truncate text-right">
                      {job.serviceType || "General Shoot"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5 font-bold uppercase tracking-widest text-[9px]">
                      <MapPin className="w-3.5 h-3.5" /> Coordinates
                    </span>
                    <span className="font-bold text-muted-foreground font-mono text-[10px]">
                      {job.lat ? `${job.lat.toFixed(4)}° N, ${job.lng.toFixed(4)}° E` : "Locking satellites..."}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1.5 border-t border-border mt-1.5">
                    <span className="text-muted-foreground flex items-center gap-1.5 font-bold uppercase tracking-widest text-[9px]">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-500" /> Dispatch Cost
                    </span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-450">
                      ₹{((job.estimatedAmount > 0 ? job.estimatedAmount : (job.totalAmount || 3000))).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operational Instructions */}
            <Card className="border-border bg-card/40 backdrop-blur-md rounded-3xl p-5 border-dashed">
              <div className="space-y-3.5 text-xs">
                <p className="font-bold text-muted-foreground uppercase tracking-widest text-[9px] font-mono">Flight Directive Instructions</p>
                <ul className="space-y-2.5 text-muted-foreground list-disc list-inside leading-relaxed">
                  <li>Clear launch vectors of overhanging cables or trees.</li>
                  <li>Maintain terminal telephone availability during dispatch windows.</li>
                  <li>Flight operations subject to real-time meteorological conditions.</li>
                </ul>
              </div>
            </Card>

          </div>

        </div>
      </div>

    </div>
  )
}
