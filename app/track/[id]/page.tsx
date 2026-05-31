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
    <div className="h-64 bg-slate-100 animate-pulse flex items-center justify-center text-slate-500 rounded-xl border border-slate-200">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col items-center justify-center text-slate-900 gap-6 select-none relative overflow-hidden">
        {/* Glowing backgrounds */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        
        {/* High-tech Radar/Drone scanning pulse */}
        <div className="relative flex items-center justify-center w-24 h-24 mb-2">
          {/* Ripple rings */}
          <div className="absolute inset-0 rounded-full border border-blue-500/10 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-2 rounded-full border border-indigo-500/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute inset-4 rounded-full bg-blue-50 border border-blue-150 flex items-center justify-center shadow-lg shadow-blue-500/5 scale-110">
            <Compass className="w-8 h-8 text-blue-600 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        </div>

        {/* Loading text with high tracking */}
        <div className="space-y-2 text-center relative z-10 max-w-sm px-4">
          <p className="text-[10px] font-black tracking-[0.25em] text-blue-600 uppercase">
            AeroHive Satellite Uplink
          </p>
          <h2 className="text-sm font-bold text-slate-700 leading-snug">
            Syncing secure mission tracking channels...
          </h2>
          <p className="text-[10px] text-slate-400 font-semibold font-mono uppercase tracking-widest mt-1">
            Establishing Live Telemetry
          </p>
        </div>

        {/* Cinematic micro horizontal loading bar */}
        <div className="w-40 bg-slate-100 border border-slate-200/50 rounded-full h-1.5 overflow-hidden shadow-inner">
          <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 h-full rounded-full animate-[loading-bar_2.5s_infinite_ease-in-out]" style={{ width: '60%' }} />
        </div>

        {/* Custom loading animations added in JSX head style or direct classes */}
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md bg-white shadow-xl p-8 rounded-3xl border border-rose-200">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto" />
          <h1 className="text-2xl font-extrabold text-slate-900">Tracking Unavailable</h1>
          <p className="text-slate-500 text-sm leading-relaxed">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900 pb-20 font-sans selection:bg-blue-600/20">
      
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] opacity-40 pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px] opacity-40 pointer-events-none" />

      {/* Dynamic Header */}
      <div className="bg-white/95 border-b border-slate-200 sticky top-0 z-50 backdrop-blur-md shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => {
                  if (window.history.length > 1) {
                    router.back()
                  } else {
                    router.push('/orders')
                  }
                }} 
                className="px-3.5 py-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 bg-white hover:border-slate-300 shadow-sm transition-all flex items-center gap-1.5 font-bold"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
                <span className="text-xs">Back to Orders</span>
              </Button>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 tracking-tight">AeroHive Tracking Hub</h1>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center text-xs text-slate-500">
              <span className="font-medium">Order ID: {job.id || "Unknown"}</span>
              {lastSyncedAt && <span>Last synced at {new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second:'2-digit' })}</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isTrackingActive && (
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-200 animate-pulse text-[10px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                Live Telemetry
              </div>
            )}
            <Badge className={`px-3 py-1 text-xs font-extrabold uppercase rounded-lg border ${
              ['CANCELLED', 'DECLINED'].includes(job.status?.toUpperCase())
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-slate-100 text-slate-900 border-slate-200'
            }`}>
              {job.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 relative z-10">

        {/* Status Tracker Card exactly like Image 2 */}
        <Card className="border-slate-200 bg-white shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="pb-4 pt-5 px-6 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <Compass className="w-5 h-5 text-blue-600 animate-spin-slow" />
              <span className="text-xs font-black text-slate-800 uppercase tracking-[0.15em]">
                Live Mission Tracking Telemetry
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6 md:p-10 overflow-x-auto">
            {['CANCELLED', 'DECLINED'].includes(job.status?.toUpperCase()) ? (
              <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0 animate-pulse">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h5 className="font-extrabold text-sm text-rose-950 uppercase tracking-wider">Mission Inactive / Cancelled</h5>
                  <p className="text-xs text-rose-700 font-medium mt-1 leading-relaxed">
                    This mission slot has been successfully cancelled and closed. No active flight operations are currently scheduled. If you have any inquiries or need support, please reach out to the AeroHive Operations Console.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative flex flex-col md:flex-row items-stretch justify-between gap-8 min-w-[600px] md:min-w-0">
                {/* Connector line for desktop */}
                <div className="hidden md:block absolute top-[18px] left-[40px] right-[40px] h-0.5 bg-slate-200 z-0" />
                
                {/* Connector line for mobile (vertical) */}
                <div className="md:hidden absolute left-[18px] top-[20px] bottom-[20px] w-0.5 bg-slate-200 z-0" />

                {job.statusSteps?.map((step: any, idx: number) => {
                  const isCompleted = step.completed && !step.current
                  const isCurrent = step.current
                  
                  // Color configuration per phase
                  const getPhaseColors = (key: string) => {
                    switch (key.toUpperCase()) {
                      case 'PENDING':
                        return { dot: 'bg-emerald-500', text: 'text-emerald-700', activeBg: 'bg-emerald-600', activeRing: 'ring-emerald-100', border: 'border-emerald-500' }
                      case 'ACCEPTED':
                        return { dot: 'bg-indigo-500', text: 'text-indigo-700', activeBg: 'bg-indigo-600', activeRing: 'ring-indigo-100', border: 'border-indigo-500' }
                      case 'VERIFIED':
                        return { dot: 'bg-amber-500', text: 'text-amber-700', activeBg: 'bg-amber-500', activeRing: 'ring-amber-100', border: 'border-amber-500' }
                      case 'EN_ROUTE':
                        return { dot: 'bg-blue-500', text: 'text-blue-700', activeBg: 'bg-blue-600', activeRing: 'ring-blue-100', border: 'border-blue-500' }
                      case 'ON_SITE':
                        return { dot: 'bg-violet-500', text: 'text-violet-750', activeBg: 'bg-violet-600', activeRing: 'ring-violet-100', border: 'border-violet-500' }
                      case 'IN_PROGRESS':
                        return { dot: 'bg-orange-500', text: 'text-orange-700', activeBg: 'bg-orange-650', activeRing: 'ring-orange-200', border: 'border-orange-500' }
                      case 'COMPLETED':
                      case 'DONE':
                        return { dot: 'bg-emerald-600', text: 'text-emerald-800', activeBg: 'bg-emerald-600', activeRing: 'ring-emerald-250', border: 'border-emerald-600' }
                      default:
                        return { dot: 'bg-slate-500', text: 'text-slate-700', activeBg: 'bg-slate-650', activeRing: 'ring-slate-150', border: 'border-slate-500' }
                    }
                  }

                  const colors = getPhaseColors(step.key)

                  return (
                    <div key={step.key} className="flex md:flex-col items-center gap-4 md:gap-3 flex-1 relative z-10">
                      {/* Circle Node */}
                      <div className="relative flex items-center justify-center w-9 h-9">
                        {isCurrent ? (
                          <div className={`w-9 h-9 rounded-full ${colors.activeBg} flex items-center justify-center ring-4 ${colors.activeRing} border-2 border-white animate-pulse shadow-md`}>
                            <span className="w-2.5 h-2.5 rounded-full bg-white" />
                          </div>
                        ) : isCompleted ? (
                          <div className="w-9 h-9 rounded-full bg-slate-400 text-white flex items-center justify-center border-2 border-white shadow-sm">
                            <Check className="w-4 h-4 stroke-[3.5]" />
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center shadow-inner">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                          </div>
                        )}
                      </div>

                      {/* Step Label with dot */}
                      <div className="flex items-center gap-1.5 md:mt-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? colors.dot : isCompleted ? 'bg-slate-400' : 'bg-slate-300'}`} />
                        <span className={`text-[12px] tracking-tight ${
                          isCurrent 
                            ? `${colors.text} font-extrabold bg-slate-50 border ${colors.border}/10 px-2 py-0.5 rounded-lg shadow-sm` 
                            : isCompleted 
                            ? 'text-slate-600 font-semibold' 
                            : 'text-slate-400 font-medium'
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

        {/* OTP display container ONLY if not verified yet and not cancelled */}
        {job.otp && !['CANCELLED', 'DECLINED'].includes(job.status?.toUpperCase()) && (
          <Card className="border-amber-200 bg-amber-50 shadow-md rounded-3xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl pointer-events-none" />
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-amber-800 uppercase tracking-widest">Security Dispatch Code</h3>
                <p className="text-xs text-amber-700 font-medium">Share this 4-digit code with your pilot upon arrival</p>
              </div>
              <div className="bg-white border border-amber-200 rounded-2xl py-4 shadow-sm max-w-xs mx-auto">
                <span className="text-4xl font-mono font-black text-amber-750 tracking-[0.25em] pl-[0.25em]">{job.otp}</span>
              </div>
              <p className="text-[10px] text-amber-850 font-bold italic">Never share this code via messages or calls.</p>
            </CardContent>
          </Card>
        )}

        {/* Booking & Flight Manifesto Details Card */}
        <Card className="border-slate-200 bg-white shadow-xl rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-200 p-5 flex flex-row items-center justify-between bg-slate-50">
                <CardTitle className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  Flight Manifesto & Intel
                </CardTitle>
                <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-black uppercase tracking-wider py-0.5 rounded px-2 animate-pulse">
                  ● Telemetry Uplink
                </Badge>
              </CardHeader>
              
              <CardContent className="p-5 space-y-5">


                {/* Client / User Details */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Ordered By</span>
                  <div className="flex items-center gap-3.5 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-150 font-black text-xs uppercase">
                      {job.clientName ? job.clientName[0] : 'C'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 text-xs truncate">{job.clientName || 'AeroHive Client'}</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5 font-mono truncate">{job.clientPhone || '+91 99999 99999'}</p>
                    </div>
                  </div>
                </div>

                {/* Assigned Pilot */}
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block">Assigned Pilot</span>
                  <div className="flex items-center gap-3.5 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-150 text-sm">
                      👨‍✈️
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 text-xs truncate">{job.pilotName || "Assigning Certified Pilot..."}</p>
                      <p className="text-[9px] text-emerald-700 font-extrabold mt-0.5 uppercase tracking-wider">
                        {job.pilotPhone ? "DGCA CERTIFIED" : "PENDING ASSIGNMENT"}
                      </p>
                    </div>
                  </div>
                  {job.pilotPhone && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-650 bg-slate-100 p-2.5 rounded-xl border border-slate-200 font-mono">
                      <Phone className="w-3.5 h-3.5 text-blue-500" />
                      <span>{job.pilotPhone}</span>
                    </div>
                  )}
                </div>

                {/* Core Flight Parameters Details */}
                <div className="border-t border-slate-200/70 pt-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> Date & Time
                    </span>
                    <span className="font-bold text-slate-900">
                      {job.scheduledAt ? new Date(job.scheduledAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px]">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> Duration
                    </span>
                    <span className="font-bold text-slate-900">
                      {job.durationHours || "—"} hr{job.durationHours !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px]">
                      <Compass className="w-3.5 h-3.5 text-slate-500" /> Task / Service
                    </span>
                    <span className="font-bold text-slate-900 max-w-[150px] truncate text-right">
                      {job.serviceType || "General Shoot"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px]">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> Area Coordinates
                    </span>
                    <span className="font-bold text-slate-300 font-mono text-[10px]">
                      {job.lat ? `${job.lat.toFixed(4)}° N, ${job.lng.toFixed(4)}° E` : "Satellite Locks Pending"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/70 mt-1">
                    <span className="text-slate-500 flex items-center gap-1.5 font-black uppercase tracking-wider text-[10px]">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-500" /> Booking Cost
                    </span>
                    <span className="font-black text-emerald-400 text-sm">
                      ₹{((job.estimatedAmount > 0 ? job.estimatedAmount : (job.totalAmount || 3000))).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operational Instructions */}
            <Card className="border-slate-200 bg-slate-50 backdrop-blur-sm rounded-3xl p-5 border-dashed">
              <div className="space-y-3.5 text-xs">
                <p className="font-bold text-slate-300 uppercase tracking-widest text-[10px]">Operational Safety Guidelines</p>
                <ul className="space-y-2.5 text-slate-400 list-disc list-inside">
                  <li>Keep flight areas clear of tall obstacles</li>
                  <li>Ensure pilot has open lines of communication</li>
                  <li>In case of weather limits, timeline may delay</li>
                </ul>
              </div>
            </Card>

      </div>

    </div>
  )
}
