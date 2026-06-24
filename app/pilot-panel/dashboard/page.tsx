"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Plane,
  LogOut,
  MapPin,
  Star,
  Award,
  Clock,
  IndianRupee,
  Users,
  TrendingUp,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  Briefcase,
  ShieldCheck,
  RefreshCw,
  XCircle,
  Navigation,
  Compass,
  Zap,
  Map,
  Check
} from "lucide-react"

interface PilotSession {
  id: string
  full_name: string
  email: string
  phone: string
  location: string
  area: string
  experience: string
  certifications: string
  specializations: string
  hourly_rate: number
  about: string
  dgca_number: string
  drone_academy?: string
  profile_image_url?: string
  rating: number
  completed_jobs: number
  is_verified: boolean
  created_at: string
}

interface Booking {
  id: string
  booking_reference: string
  service_type: string
  status: string
  scheduled_at: string
  duration_hours: number
  client_name: string
  client_email: string
  client_phone: string
  otp_code: string
  created_at: string
  payment_method: string
  earnings_estimated: number
  earnings_confirmed: number
  hourly_rate: number
  location_name?: string
  client_location_lat?: number
  client_location_lng?: number
  requirements?: {
    note?: string
  }
}

interface Summary {
  total_bookings: number
  total_earnings_estimated: number
  total_earnings_completed: number
  pending_count: number
  in_progress_count: number
  completed_count: number
  cancelled_count: number
  confirmed_count: number
}

const STATUS_CONFIG: Record<string, { label: string; className: string; color: string }> = {
  PENDING: { label: "Requested", className: "bg-amber-50 text-amber-700 border-amber-200", color: "#f59e0b" },
  pending: { label: "Requested", className: "bg-amber-50 text-amber-700 border-amber-200", color: "#f59e0b" },
  ACCEPTED: { label: "Accepted", className: "bg-teal-50 text-teal-700 border-teal-200", color: "#14b8a6" },
  accepted: { label: "Accepted", className: "bg-teal-50 text-teal-700 border-teal-200", color: "#14b8a6" },
  VERIFIED: { label: "Verified", className: "bg-cyan-50 text-cyan-700 border-cyan-200", color: "#06b6d4" },
  verified: { label: "Verified", className: "bg-cyan-50 text-cyan-700 border-cyan-200", color: "#06b6d4" },
  EN_ROUTE: { label: "Started", className: "bg-blue-50 text-blue-700 border-blue-200", color: "#3b82f6" },
  en_route: { label: "Started", className: "bg-blue-50 text-blue-700 border-blue-200", color: "#3b82f6" },
  ON_SITE: { label: "Reached Location", className: "bg-indigo-50 text-indigo-700 border-indigo-200", color: "#6366f1" },
  on_site: { label: "Reached Location", className: "bg-indigo-50 text-indigo-700 border-indigo-200", color: "#6366f1" },
  IN_PROGRESS: { label: "In Work Shoot", className: "bg-purple-50 text-purple-700 border-purple-200", color: "#a855f7" },
  in_progress: { label: "In Work Shoot", className: "bg-purple-50 text-purple-700 border-purple-200", color: "#a855f7" },
  COMPLETED: { label: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-200", color: "#10b981" },
  completed: { label: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-200", color: "#10b981" },
  DONE: { label: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-200", color: "#10b981" },
  REJECTED: { label: "Rejected", className: "bg-rose-50 text-rose-700 border-rose-200", color: "#f43f5e" },
  rejected: { label: "Rejected", className: "bg-rose-50 text-rose-700 border-rose-200", color: "#f43f5e" },
  CANCELLED: { label: "Cancelled", className: "bg-rose-50 text-rose-700 border-rose-200", color: "#f43f5e" },
  cancelled: { label: "Cancelled", className: "bg-rose-50 text-rose-700 border-rose-200", color: "#f43f5e" },
  DECLINED: { label: "Declined", className: "bg-rose-50 text-rose-700 border-rose-200", color: "#f43f5e" },
  declined: { label: "Declined", className: "bg-rose-50 text-rose-700 border-rose-200", color: "#f43f5e" },
}

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status.toUpperCase()] || { label: status, className: "bg-gray-50 text-gray-700 border-gray-200", color: "#9ca3af" }
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—"
  try {
    return new Date(dateStr).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
  } catch {
    return dateStr
  }
}

function maskDgca(dgca: string) {
  if (!dgca || dgca.length < 6) return dgca
  return dgca.slice(0, 4) + "•".repeat(dgca.length - 6) + dgca.slice(-2)
}

function getAvatarFallback(name: string) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230f172a"/><circle cx="50" cy="50" r="38" fill="%23069494" opacity="0.12"/><text x="50" y="55" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="28" font-weight="600" fill="%23069494" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
}

export default function PilotDashboardPage() {
  const router = useRouter()
  const [pilot, setPilot] = useState<PilotSession | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [bookingsError, setBookingsError] = useState<string | null>(null)
  const [sessionChecked, setSessionChecked] = useState(false)
  const [activeTab, setActiveTab] = useState<"requests" | "active" | "completed">("requests")

  // Action states
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({})
  const [verifyingOtp, setVerifyingOtp] = useState<Record<string, boolean>>({})
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>({})
  const [actionError, setActionError] = useState<Record<string, string>>({})
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Check session on mount
  useEffect(() => {
    const sessionStr = localStorage.getItem("aerohive_pilot_session")
    if (!sessionStr) {
      if (process.env.NODE_ENV === 'development') {
        const mockPilot = {
          id: "mock-pilot-id",
          full_name: "Captain Akshay",
          email: "akshay@aerohive.com",
          phone: "+91 98765 43210",
          location: "Mumbai, India",
          area: "Western Suburbs",
          experience: "5+ Years",
          certifications: "DGCA Category A & B, Realsense LiDAR Certified",
          specializations: "LiDAR Mapping, Industrial Inspections",
          hourly_rate: 4500,
          about: "Expert unmanned aerial systems commander specialized in thermal inspections.",
          dgca_number: "DGCA-UA-10293",
          rating: 4.9,
          completed_jobs: 48,
          is_verified: true,
          created_at: new Date().toISOString()
        }
        localStorage.setItem("aerohive_pilot_session", JSON.stringify(mockPilot))
        setPilot(mockPilot)
        setSessionChecked(true)
        return
      }
      router.replace("/pilot-panel/login")
      return
    }
    try {
      const parsed = JSON.parse(sessionStr) as PilotSession
      setPilot(parsed)
      setSessionChecked(true)
    } catch {
      localStorage.removeItem("aerohive_pilot_session")
      router.replace("/pilot-panel/login")
    }
  }, [router])

  // Fetch bookings once pilot session is loaded
  useEffect(() => {
    if (!pilot) return
    
    // SWR Cache Check: Load previously saved bookings/summary to render instantly
    const cachedBookings = localStorage.getItem(`aerohive_pilot_bookings_${pilot.id}`)
    const cachedSummary = localStorage.getItem(`aerohive_pilot_summary_${pilot.id}`)
    
    if (cachedBookings && cachedSummary) {
      try {
        setBookings(JSON.parse(cachedBookings))
        setSummary(JSON.parse(cachedSummary))
        setLoadingBookings(false)
        // Silent background fetch to update list if changed
        fetchBookings(true)
        return
      } catch (e) {
        // Parse error fallback
      }
    }
    
    // Initial fetch if no cached data exists
    fetchBookings(false)
  }, [pilot])
 
  const fetchBookings = async (isBackground = false) => {
    if (!pilot) return
    if (!isBackground) {
      setLoadingBookings(true)
    }
    setBookingsError(null)
    try {
      const res = await fetch(`/api/pilot-auth/bookings?pilotId=${pilot.id}`)
      const data = await res.json()
      if (!res.ok) {
        if (!isBackground) {
          setBookingsError(data.error || "Failed to fetch bookings.")
        }
        return
      }
      const newBookings = data.bookings || []
      const newSummary = data.summary || null
      setBookings(newBookings)
      setSummary(newSummary)
      
      // Save to cache
      localStorage.setItem(`aerohive_pilot_bookings_${pilot.id}`, JSON.stringify(newBookings))
      localStorage.setItem(`aerohive_pilot_summary_${pilot.id}`, JSON.stringify(newSummary))
    } catch (err: any) {
      if (!isBackground) {
        setBookingsError("Network error. Please try again.")
      }
    } finally {
      setLoadingBookings(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("aerohive_pilot_session")
    router.push("/pilot-panel/login")
  }

  // Handle Accept Request
  const handleAccept = async (bookingId: string) => {
    setActionError(prev => ({ ...prev, [bookingId]: "" }))
    try {
      // Instantly change state locally for zero latency feedback
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "ACCEPTED" } : b))
      
      const res = await fetch("/api/jobs/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, pilotId: pilot?.id })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to accept booking")
      }
      fetchBookings(true)
    } catch (err: any) {
      setActionError(prev => ({ ...prev, [bookingId]: err.message }))
      // Rollback status on failure
      fetchBookings(true)
    }
  }

  // Handle Reject Request
  const handleReject = async (bookingId: string) => {
    setActionError(prev => ({ ...prev, [bookingId]: "" }))
    try {
      // Instantly change state locally
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "DECLINED" } : b))

      const res = await fetch("/api/jobs/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, pilotId: pilot?.id })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to reject booking")
      }
      fetchBookings(true)
    } catch (err: any) {
      setActionError(prev => ({ ...prev, [bookingId]: err.message }))
      fetchBookings(true)
    }
  }

  // Handle Verify OTP
  const handleVerifyOtp = async (bookingId: string) => {
    const enteredOtp = otpInputs[bookingId] || ""
    if (!enteredOtp || enteredOtp.length !== 4) {
      setActionError(prev => ({ ...prev, [bookingId]: "Please enter a valid 4-digit OTP" }))
      return
    }
    setActionError(prev => ({ ...prev, [bookingId]: "" }))
    setVerifyingOtp(prev => ({ ...prev, [bookingId]: true }))
    try {
      const res = await fetch("/api/jobs/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, otp: enteredOtp })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Invalid OTP code")
      }
      // Success! Update locally to VERIFIED
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: "VERIFIED" } : b))
      fetchBookings(true)
    } catch (err: any) {
      setActionError(prev => ({ ...prev, [bookingId]: err.message }))
    } finally {
      setVerifyingOtp(prev => ({ ...prev, [bookingId]: false }))
    }
  }

  // Handle step status update
  const handleUpdateStatus = async (bookingId: string, targetStatus: string) => {
    setActionError(prev => ({ ...prev, [bookingId]: "" }))
    setUpdatingStatus(prev => ({ ...prev, [bookingId]: true }))
    try {
      // Instantly transition local state
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: targetStatus } : b))

      const res = await fetch("/api/jobs/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, newStatus: targetStatus, pilotId: pilot?.id })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to update status")
      }
      fetchBookings(true)
    } catch (err: any) {
      setActionError(prev => ({ ...prev, [bookingId]: err.message }))
      fetchBookings(true)
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [bookingId]: false }))
    }
  }

  // Show nothing until session is verified (avoid flash)
  if (!sessionChecked || !pilot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Categorize bookings
  const pendingRequests = bookings.filter(b => b.status.toUpperCase() === "PENDING")
  const activeMissions = bookings.filter(b => ["ACCEPTED", "VERIFIED", "EN_ROUTE", "ON_SITE", "IN_PROGRESS"].includes(b.status.toUpperCase()))
  const completedMissions = bookings.filter(b => ["COMPLETED", "DONE", "REJECTED", "CANCELLED", "DECLINED"].includes(b.status.toUpperCase()))

  const stats = [
    {
      label: "Total Requests",
      value: summary?.total_bookings ?? 0,
      icon: <Users className="h-5 w-5" />,
      bg: "bg-blue-50 text-blue-600 border-blue-100",
      text: "text-blue-600",
      sub: `${pendingRequests.length} pending request`
    },
    {
      label: "Est. Completed Earnings",
      value: `₹${(summary?.total_earnings_completed ?? 0).toLocaleString("en-IN")}`,
      icon: <IndianRupee className="h-5 w-5" />,
      bg: "bg-emerald-50 text-emerald-600 border-emerald-100",
      text: "text-emerald-600",
      sub: `Estimated: ₹${(summary?.total_earnings_estimated ?? 0).toLocaleString("en-IN")}`
    },
    {
      label: "Active Missions",
      value: activeMissions.length,
      icon: <Clock className="h-5 w-5" />,
      bg: "bg-purple-50 text-purple-600 border-purple-100",
      text: "text-purple-600",
      sub: `${activeMissions.filter(m => m.status.toUpperCase() === "IN_PROGRESS").length} ongoing flight`
    },
    {
      label: "Completed Jobs",
      value: summary?.completed_count ?? 0,
      icon: <CheckCircle2 className="h-5 w-5" />,
      bg: "bg-cyan-50 text-cyan-600 border-cyan-100",
      text: "text-cyan-600",
      sub: `${summary?.cancelled_count ?? 0} cancelled`
    },
  ]

  return (
    <>
      <ModernHeader />

      <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 pb-24 pt-28 font-sans selection:bg-[#e65737]/10 relative transition-colors duration-300">
        {/* Ambient background grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>
        
        {/* Soft glowing ambient gradients */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/5 dark:bg-[#e65737]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[#FF8243]/5 dark:bg-[#FF8243]/3 rounded-full blur-[140px] pointer-events-none" />

        <div className="container mx-auto px-4 max-w-7xl relative z-10">

          {/* Aviator Console Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group">
                <img
                  src={pilot.profile_image_url || getAvatarFallback(pilot.full_name)}
                  alt={pilot.full_name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getAvatarFallback(pilot.full_name);
                  }}
                  className="h-16 w-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-inner p-0.5 bg-background transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-md">
                  <Check className="h-3 w-3 text-white" />
                </div>
              </div>
              
              <div className="space-y-1.5 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/8 dark:bg-[#e65737]/8 border border-blue-600/15 dark:border-[#e65737]/15 rounded-full text-[10px] font-bold text-blue-700 dark:text-[#e65737] uppercase tracking-widest font-mono">
                  <Plane className="h-3.5 w-3.5 animate-pulse" />
                  AEROPS COMMAND CENTER
                </div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
                  Pilot Command Portal
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-450">
                  Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-200">{pilot.full_name}</span> &bull; DGCA License: <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-350 text-xs font-semibold">{maskDgca(pilot.dgca_number)}</span>
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <Button
                onClick={fetchBookings}
                disabled={loadingBookings}
                className="bg-white hover:bg-slate-50 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 rounded-xl px-5 h-11 text-xs font-bold transition-all flex items-center gap-2 shadow-sm flex-1 lg:flex-initial"
              >
                <RefreshCw className={`h-4 w-4 ${loadingBookings ? "animate-spin" : ""}`} />
                Sync Telemetry
              </Button>
              <Button
                id="pilot-logout-btn"
                onClick={handleLogout}
                className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-950/30 rounded-xl px-5 h-11 text-xs font-bold transition-all flex items-center gap-2 flex-1 lg:flex-initial"
              >
                <LogOut className="h-4 w-4" />
                Disconnect Session
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, i) => (
              <Card key={i} className="border-slate-200/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/40 backdrop-blur-md shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 rounded-2xl overflow-hidden group">
                <CardContent className="p-6 relative">
                  <div className="flex justify-between items-center mb-4">
                    <div className={`p-3 rounded-xl border ${stat.bg} dark:border-opacity-30`}>
                      {stat.icon}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">LIVE DATA</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-450">{stat.label}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 font-medium">{stat.sub}</p>
                  </div>
                  {/* Micro gradient bar at the bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600/20 dark:from-[#e65737]/20 to-blue-400/20 dark:to-[#FF8243]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Core Content Navigation */}
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 dark:border-slate-800 pb-5 gap-4">
              <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 w-full md:w-auto">
                <button
                  onClick={() => setActiveTab("requests")}
                  className={`relative rounded-xl px-5 py-2.5 text-xs font-bold transition-all flex items-center gap-2 flex-1 md:flex-initial justify-center ${
                    activeTab === "requests"
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Incoming Invitations
                  {pendingRequests.length > 0 && (
                    <span className="bg-[#FF8243] text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                      {pendingRequests.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("active")}
                  className={`relative rounded-xl px-5 py-2.5 text-xs font-bold transition-all flex items-center gap-2 flex-1 md:flex-initial justify-center ${
                    activeTab === "active"
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Active Operations
                  {activeMissions.length > 0 && (
                    <span className="bg-blue-600 dark:bg-[#e65737] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {activeMissions.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("completed")}
                  className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all flex items-center gap-2 flex-1 md:flex-initial justify-center ${
                    activeTab === "completed"
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Historical Archives
                </button>
              </div>

              <div className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-white dark:bg-slate-900/40 px-4 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-[#e65737] animate-ping inline-block"></span>
                ACTIVE MONITOR: <span className="text-blue-600 dark:text-[#e65737]">{activeTab.toUpperCase()}</span>
              </div>
            </div>

            {/* List Screen */}
            {bookingsError ? (
              <Card className="border-rose-200/80 dark:border-rose-950/80 bg-rose-50/50 dark:bg-rose-950/10 shadow-lg rounded-2xl">
                <CardContent className="py-12 text-center max-w-lg mx-auto">
                  <AlertCircle className="h-12 w-12 text-rose-600 dark:text-rose-455 mx-auto mb-4" />
                  <p className="text-rose-900 dark:text-rose-350 font-bold text-lg mb-2">Telemetry Uplink Fail</p>
                  <p className="text-rose-650 dark:text-rose-400 text-sm mb-6 leading-relaxed">{bookingsError}</p>
                  <Button onClick={() => fetchBookings(false)} className="bg-rose-650 hover:bg-rose-750 text-white rounded-xl px-6 h-11 text-xs font-bold transition-all shadow-md">
                    Retry Synchronization
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Empty States */}
                {activeTab === "requests" && pendingRequests.length === 0 && (
                  <Card className="border border-dashed border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/10 rounded-3xl shadow-sm">
                    <CardContent className="py-20 text-center space-y-4 max-w-sm mx-auto">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500 shadow-inner">
                        <Compass className="h-7 w-7" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">All Clear</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium">
                        No pending booking invitations. When customers hire you, dispatch alerts will flash here immediately.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {activeTab === "active" && activeMissions.length === 0 && (
                  <Card className="border border-dashed border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/10 rounded-3xl shadow-sm">
                    <CardContent className="py-20 text-center space-y-4 max-w-sm mx-auto">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500 shadow-inner">
                        <Zap className="h-7 w-7 animate-pulse" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Flights Scheduled</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium">
                        No active drone operations at the moment. Accept incoming invitations to begin tracking.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {activeTab === "completed" && completedMissions.length === 0 && (
                  <Card className="border border-dashed border-slate-200 dark:border-slate-800 bg-white/30 dark:bg-slate-900/10 rounded-3xl shadow-sm">
                    <CardContent className="py-20 text-center space-y-4 max-w-sm mx-auto">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500 shadow-inner">
                        <Map className="h-7 w-7" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">Archive Empty</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-medium">
                        Logs of completed, cancelled, or declined operations will automatically populate here for reference.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Grid Renders */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Invitations Render */}
                  {activeTab === "requests" && pendingRequests.map((booking) => {
                    const statusCfg = getStatusConfig(booking.status)
                    const errorMsg = actionError[booking.id]

                    return (
                      <Card
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 backdrop-blur-md shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden flex flex-col justify-between group hover:border-blue-500/30 dark:hover:border-[#e65737]/30 cursor-pointer"
                      >
                        <div>
                          <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/80 dark:to-slate-900/40 p-5 border-b border-slate-200/60 dark:border-slate-800/80 flex justify-between items-center">
                            <div>
                              <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 tracking-wider">REF: {booking.booking_reference}</p>
                              <h4 className="font-bold text-slate-800 dark:text-white text-sm mt-0.5">{booking.service_type}</h4>
                            </div>
                            <Badge className={`${statusCfg.className} rounded-lg text-[10px] font-bold border dark:bg-opacity-20`}>
                              {statusCfg.label}
                            </Badge>
                          </div>

                          <div className="p-6 space-y-5">
                            {/* Client Block */}
                            <div className="space-y-2.5">
                              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Client Vetting</p>
                              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 dark:from-[#e65737] to-amber-600 flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
                                  {(booking.client_name || "?").charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-slate-700 dark:text-slate-250 text-xs truncate">{booking.client_name}</p>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-450 flex items-center gap-1.5 mt-0.5">
                                    <Phone className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                                    {booking.client_phone || "Not Shared"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Location Block */}
                            <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-[#e65737]" /> Flight Location
                              </p>
                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-350 leading-normal">
                                {booking.location_name || "Not specified"}
                              </p>
                              {booking.client_location_lat && booking.client_location_lng && (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${booking.client_location_lat},${booking.client_location_lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[10px] text-blue-600 dark:text-[#e65737] hover:underline font-bold inline-flex items-center gap-1 mt-1 cursor-pointer"
                                >
                                  🗺️ Open in Google Maps ({booking.client_location_lat.toFixed(4)}, {booking.client_location_lng.toFixed(4)})
                                </a>
                              )}
                            </div>

                            {/* Requirements Block */}
                            {booking.requirements?.note && (
                              <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Client Instructions</p>
                                <p className="text-xs font-medium text-slate-650 dark:text-slate-400 italic leading-normal">
                                  &ldquo;{booking.requirements.note}&rdquo;
                                </p>
                              </div>
                            )}

                            {/* Details Block */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3.5 border border-slate-200/50 dark:border-slate-800/50 space-y-1">
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-[#e65737]" /> Scheduled
                                </p>
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                                  {formatDate(booking.scheduled_at)}
                                </p>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3.5 border border-slate-200/50 dark:border-slate-800/50 space-y-1">
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-[#e65737]" /> Duration
                                </p>
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                                  {booking.duration_hours || "—"} hr{booking.duration_hours !== 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>

                            {/* Pricing Block */}
                            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 flex justify-between items-center">
                              <div>
                                <p className="text-[9px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-widest">Estimated Earning</p>
                                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-500 mt-0.5">
                                  ₹{booking.earnings_estimated > 0 ? booking.earnings_estimated.toLocaleString("en-IN") : "TBD"}
                                </p>
                              </div>
                              <Badge className="bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-mono border-0 tracking-wider">
                                {booking.payment_method}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 pt-0 mt-auto space-y-3" onClick={(e) => e.stopPropagation()}>
                          {errorMsg && (
                            <p className="text-xs font-semibold text-rose-600 dark:text-rose-455 bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100 dark:border-rose-950/30 px-3 py-2 rounded-xl flex items-center gap-1.5">
                              <AlertCircle className="h-4 w-4 flex-shrink-0" />
                              {errorMsg}
                            </p>
                          )}

                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              onClick={() => handleAccept(booking.id)}
                              className="bg-blue-600 dark:bg-[#e65737] hover:bg-blue-700 dark:hover:bg-[#cc5032] text-white font-bold rounded-xl py-2.5 text-xs shadow-sm transition-all cursor-pointer"
                            >
                              Accept Vetting
                            </Button>
                            <Button
                              onClick={() => handleReject(booking.id)}
                              className="bg-white hover:bg-rose-50 dark:bg-slate-900 dark:hover:bg-rose-955/10 text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-455 border border-slate-200 dark:border-slate-800 hover:border-rose-100 dark:hover:border-rose-900/30 font-bold rounded-xl py-2.5 text-xs transition-all cursor-pointer"
                            >
                              Decline Job
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  })}

                  {/* Active Operations Render */}
                  {activeTab === "active" && activeMissions.map((booking) => {
                    const statusCfg = getStatusConfig(booking.status)
                    const errorMsg = actionError[booking.id]
                    const verifying = verifyingOtp[booking.id]
                    const updating = updatingStatus[booking.id]
                    const currentOtpVal = otpInputs[booking.id] || ""

                    const statusOrderList = ["ACCEPTED", "EN_ROUTE", "ON_SITE", "VERIFIED", "IN_PROGRESS", "COMPLETED"]
                    const currentIdx = statusOrderList.indexOf(booking.status.toUpperCase())

                    const isNextStep = (currentStatus: string, optStatus: string) => {
                      if (currentStatus === "ACCEPTED" && optStatus === "EN_ROUTE") return true;
                      if (currentStatus === "EN_ROUTE" && optStatus === "ON_SITE") return true;
                      if (currentStatus === "VERIFIED" && optStatus === "IN_PROGRESS") return true;
                      if (currentStatus === "IN_PROGRESS" && optStatus === "COMPLETED") return true;
                      return false;
                    }
                    return (
                      <Card
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className="border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 backdrop-blur-md shadow-sm rounded-3xl overflow-hidden flex flex-col justify-between hover:border-blue-500/30 dark:hover:border-[#e65737]/30 cursor-pointer"
                      >
                        <div>
                          <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/80 dark:to-slate-900/40 p-5 border-b border-slate-200/60 dark:border-slate-800/80 flex justify-between items-center">
                            <div>
                              <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 tracking-wider">REF: {booking.booking_reference}</p>
                              <h4 className="font-bold text-slate-800 dark:text-white text-sm mt-0.5">{booking.service_type}</h4>
                            </div>
                            <Badge className={`${statusCfg.className} rounded-lg text-[10px] font-bold border dark:bg-opacity-20`}>
                              {statusCfg.label}
                            </Badge>
                          </div>

                          <div className="p-6 space-y-5">
                            {/* Client details */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Client</p>
                                <span className="text-[9px] text-blue-600 dark:text-[#e65737] bg-blue-500/5 dark:bg-[#e65737]/5 border border-blue-500/20 dark:border-[#e65737]/20 px-2 py-0.5 rounded-lg font-mono tracking-wider uppercase font-bold">
                                  {booking.payment_method}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 dark:to-[#e65737] flex items-center justify-center text-white font-extrabold text-xs shadow-sm">
                                  {(booking.client_name || "?").charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-slate-700 dark:text-slate-250 text-xs truncate">{booking.client_name}</p>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-450 flex items-center gap-1 mt-0.5 font-medium">
                                    <Phone className="h-3.5 w-3.5 text-slate-400 animate-pulse" />
                                    {booking.client_phone || "Not Shared"}
                                  </p>
                                  {booking.client_email && (
                                    <p className="text-[10px] text-slate-500 dark:text-slate-450 flex items-center gap-1 truncate mt-0.5 font-medium">
                                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                                      {booking.client_email}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Location Details */}
                            <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5 text-[#e65737]" /> Flight Location
                              </p>
                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-350 leading-normal">
                                {booking.location_name || "Not specified"}
                              </p>
                              {booking.client_location_lat && booking.client_location_lng && (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${booking.client_location_lat},${booking.client_location_lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[10px] text-blue-600 dark:text-[#e65737] hover:underline font-bold inline-flex items-center gap-1 mt-1 cursor-pointer"
                                >
                                  🗺️ Open in Google Maps ({booking.client_location_lat.toFixed(4)}, {booking.client_location_lng.toFixed(4)})
                                </a>
                              )}
                            </div>

                            {/* Requirements Block */}
                            {booking.requirements?.note && (
                              <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
                                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Client Instructions</p>
                                <p className="text-xs font-medium text-slate-650 dark:text-slate-400 italic leading-normal">
                                  &ldquo;{booking.requirements.note}&rdquo;
                                </p>
                              </div>
                            )}

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3.5 border border-slate-200/50 dark:border-slate-800/50 space-y-1">
                                <span className="text-[9px] font-bold text-slate-450 dark:text-slate-500 block uppercase tracking-widest">Time schedule</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-350">{formatDate(booking.scheduled_at)}</span>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3.5 border border-slate-200/50 dark:border-slate-800/50 space-y-1">
                                <span className="text-[9px] font-bold text-slate-455 dark:text-slate-500 block uppercase tracking-widest">Expected Pay</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-500 block">
                                  ₹{booking.earnings_estimated > 0 ? booking.earnings_estimated.toLocaleString("en-IN") : "TBD"}
                                </span>
                              </div>
                            </div>

                            {/* Timeline tracker */}
                            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 p-4 rounded-2xl space-y-3">
                              <div className="flex justify-between items-center text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                                <span>STATUS TIMELINE</span>
                                <span className="text-blue-600 dark:text-[#e65737] font-mono">{Math.round((currentIdx / (statusOrderList.length - 1)) * 100)}% Complete</span>
                              </div>
                              <div className="flex items-center gap-1 w-full bg-white dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-850 shadow-inner">
                                {statusOrderList.map((s, idx) => {
                                  const isActiveStep = s.toUpperCase() === booking.status.toUpperCase()
                                  const isDone = idx < currentIdx
                                  return (
                                    <div
                                      key={s}
                                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                        isActiveStep
                                          ? "bg-gradient-to-r from-blue-600 dark:from-[#e65737] to-indigo-500 shadow-sm"
                                          : isDone
                                          ? "bg-emerald-500/80"
                                          : "bg-slate-200 dark:bg-slate-800"
                                      }`}
                                    />
                                  )
                                })}
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-450 font-semibold italic text-center leading-relaxed">
                                {booking.status.toUpperCase() === "ACCEPTED" && "💡 Advance status once you depart for the target site."}
                                {booking.status.toUpperCase() === "EN_ROUTE" && "💡 Update status to Reached Location upon arriving at site."}
                                {booking.status.toUpperCase() === "ON_SITE" && "💡 Ask client for the 4-digit code and enter below."}
                                {booking.status.toUpperCase() === "VERIFIED" && "💡 Identity checked. Clear for Drone takeoff."}
                                {booking.status.toUpperCase() === "IN_PROGRESS" && "💡 Click Completed once operations are safely completed."}
                              </p>
                            </div>

                            {/* Action block */}
                            <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-4" onClick={(e) => e.stopPropagation()}>
                              {booking.status.toUpperCase() === "ON_SITE" ? (
                                <div className="space-y-3 bg-blue-500/5 dark:bg-[#e65737]/5 p-4.5 rounded-2xl border border-blue-500/15 dark:border-[#e65737]/15">
                                  <label className="text-[10px] font-bold text-blue-700 dark:text-[#e65737] uppercase tracking-wider flex items-center gap-1.5">
                                    <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-[#e65737]" /> Security OTP Verification
                                  </label>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                    Please enter the secure 4-digit verification code provided by the client.
                                  </p>
                                  <div className="flex gap-2">
                                    <Input
                                      type="text"
                                      placeholder="0 0 0 0"
                                      maxLength={4}
                                      value={currentOtpVal}
                                      onChange={(e) => setOtpInputs(prev => ({ ...prev, [booking.id]: e.target.value.replace(/\D/g, "") }))}
                                      className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-center font-mono font-bold text-lg tracking-[0.2em] text-slate-800 dark:text-white rounded-xl focus:border-blue-500 dark:focus:border-[#e65737] focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#e65737] h-10 flex-1"
                                    />
                                    <Button
                                      onClick={() => handleVerifyOtp(booking.id)}
                                      disabled={verifying || currentOtpVal.length !== 4}
                                      className="bg-blue-600 dark:bg-[#e65737] hover:bg-blue-700 dark:hover:bg-[#cc5032] text-white font-bold px-4 h-10 rounded-xl text-xs transition-all cursor-pointer"
                                    >
                                      {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Code"}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4 bg-slate-50/50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm relative overflow-hidden">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350 tracking-wider uppercase font-mono">
                                      Cockpit Console
                                    </span>
                                    <span className="text-[8px] font-bold uppercase text-emerald-700 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-950/20 animate-pulse">
                                      Telemetry Uplink
                                    </span>
                                  </div>

                                  <div className="space-y-3">
                                    <label className="text-[8px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold block">
                                      Operation Controls
                                    </label>
                                    
                                    <div className="grid grid-cols-2 gap-2">
                                      {[
                                        { status: "EN_ROUTE", label: "Started" },
                                        { status: "ON_SITE", label: "Reached Site" },
                                        { status: "IN_PROGRESS", label: "In Flight Shoot" },
                                        { status: "COMPLETED", label: "Completed" }
                                      ].map((opt) => {
                                        const optIdx = statusOrderList.indexOf(opt.status)
                                        const isCurrent = booking.status.toUpperCase() === opt.status
                                        const isCompletedBefore = optIdx < currentIdx
                                        const isAllowed = isNextStep(booking.status.toUpperCase(), opt.status)
                                        
                                        return (
                                          <Button
                                            key={opt.status}
                                            onClick={() => handleUpdateStatus(booking.id, opt.status)}
                                            disabled={updating || isCurrent || !isAllowed}
                                            className={`h-10 px-3 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                                              isCurrent 
                                                ? "bg-blue-600 dark:bg-[#e65737] hover:bg-blue-700 dark:hover:bg-[#cc5032] text-white border-blue-600 dark:border-[#e65737] shadow-sm"
                                                : isCompletedBefore
                                                ? "bg-emerald-50 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-950/30 cursor-not-allowed opacity-80"
                                                : !isAllowed
                                                ? "bg-slate-100/50 dark:bg-slate-900/20 text-slate-350 dark:text-slate-600 border-slate-200/30 dark:border-slate-800/30 cursor-not-allowed opacity-50"
                                                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-[#e65737] hover:bg-blue-500/5 dark:hover:bg-[#e65737]/5 hover:text-blue-600 dark:hover:text-[#e65737]"
                                            }`}
                                          >
                                            {updating ? (
                                              <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                              <>
                                                {isCompletedBefore && <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 stroke-[3]" />}
                                                {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-ping" />}
                                                {opt.label}
                                              </>
                                            )}
                                          </Button>
                                        )
                                      })}
                                    </div>
                                  </div>
                                </div>                             
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-6 pt-0 mt-auto" onClick={(e) => e.stopPropagation()}>
                          {errorMsg && (
                            <p className="text-xs font-semibold text-rose-600 dark:text-rose-455 bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100 dark:border-rose-950/30 px-3 py-2 rounded-xl flex items-center gap-1.5">
                              <AlertCircle className="h-4 w-4 flex-shrink-0" />
                              {errorMsg}
                            </p>
                          )}
                        </div>
                      </Card>
                    )
                  })}

                  {/* Archives Render */}
                  {activeTab === "completed" && completedMissions.map((booking) => {
                    const statusCfg = getStatusConfig(booking.status)
                    const isSuccess = ["COMPLETED", "DONE"].includes(booking.status.toUpperCase())

                    return (
                      <Card
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className="border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/60 backdrop-blur-md shadow-sm rounded-3xl overflow-hidden flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
                      >
                        <div>
                          <div className={`p-5 border-b border-slate-200/60 dark:border-slate-850 flex justify-between items-center ${isSuccess ? "bg-emerald-50/10 dark:bg-emerald-950/5" : "bg-rose-50/10 dark:bg-rose-950/5"}`}>
                            <div>
                              <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 tracking-wider">REF: {booking.booking_reference}</p>
                              <h4 className="font-bold text-slate-800 dark:text-white text-sm mt-0.5">{booking.service_type}</h4>
                            </div>
                            <Badge className={`${statusCfg.className} rounded-lg text-[10px] font-bold border dark:bg-opacity-20`}>
                              {statusCfg.label}
                            </Badge>
                          </div>

                          <div className="p-6 space-y-4">
                            {/* Client Summary */}
                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 text-xs">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm ${isSuccess ? "bg-emerald-100/80 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400" : "bg-rose-100/80 dark:bg-rose-950 text-rose-700 dark:text-rose-455"}`}>
                                {isSuccess ? <Check className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-700 dark:text-slate-300">{booking.client_name}</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-450 font-medium font-mono">{booking.client_phone}</p>
                              </div>
                            </div>

                            {/* Location Details */}
                            <div className="space-y-1 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                              <p className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-[#e65737]" /> Flight Location
                              </p>
                              <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-350 leading-normal">
                                {booking.location_name || "Not specified"}
                              </p>
                            </div>

                            {/* Requirements Block */}
                            {booking.requirements?.note && (
                              <div className="space-y-1 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                                <p className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">Client Instructions</p>
                                <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 italic leading-normal">
                                  &ldquo;{booking.requirements.note}&rdquo;
                                </p>
                              </div>
                            )}

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-600 dark:text-slate-400">
                              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50 space-y-0.5">
                                <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-widest text-[8px]">Time Log</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-350">{formatDate(booking.scheduled_at)}</span>
                              </div>
                              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50 space-y-0.5">
                                <span className="text-slate-400 dark:text-slate-500 block uppercase font-bold tracking-widest text-[8px]">Earnings</span>
                                <span className={`font-bold ${isSuccess ? "text-emerald-600 dark:text-emerald-500" : "text-slate-400 dark:text-slate-650"}`}>
                                  {isSuccess ? `₹${booking.earnings_estimated.toLocaleString("en-IN")}` : "₹0.00"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 pt-0 mt-auto">
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-semibold bg-slate-50 dark:bg-slate-900/40 py-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50 font-mono tracking-wider">
                            OPERATION LOG ARCHIVED
                          </p>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Booking Details Modal for Pilot */}
      <Dialog open={selectedBooking !== null} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="max-w-lg bg-[#fbf9f6] dark:bg-slate-900 border border-[#e8e3d9] dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-[32px] shadow-2xl p-8 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="space-y-2 border-b border-[#e8e3d9]/60 dark:border-slate-800/60 pb-5 text-left">
            <div className="flex justify-between items-center">
              <DialogTitle className="text-2xl font-serif font-normal text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-[#e65737] shrink-0" />
                Mission Details
              </DialogTitle>
              {selectedBooking && (
                <Badge className={`${getStatusConfig(selectedBooking.status).className} rounded-lg text-[10px] font-bold border dark:bg-opacity-20`}>
                  {getStatusConfig(selectedBooking.status).label}
                </Badge>
              )}
            </div>
            <DialogDescription className="text-slate-500 dark:text-slate-400 font-serif italic text-sm">
              Comprehensive telemetry and pilot instructions for this operation.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6 py-6 text-left">
              {/* Booking Reference & OTP */}
              <div className="bg-gradient-to-r from-[#e65737]/10 to-amber-600/5 dark:from-[#e65737]/15 dark:to-[#e65737]/5 rounded-2xl p-5 border border-[#e65737]/20 dark:border-[#e65737]/30">
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans font-black">Booking Reference</p>
                    <p className="text-xl font-mono font-bold text-[#e65737] mt-0.5">{selectedBooking.booking_reference}</p>
                  </div>
                  {["ON_SITE", "VERIFIED", "IN_PROGRESS", "COMPLETED"].includes(selectedBooking.status.toUpperCase()) && (
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans font-black">Verification OTP</p>
                      <p className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-450 mt-0.5">
                        {selectedBooking.otp_code || "—"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Client details section */}
              <div className="bg-[#fdfcfa] dark:bg-slate-950 rounded-2xl p-5 border border-[#e8e3d9] dark:border-slate-800/80 space-y-4">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Client Vetting</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#e65737] to-amber-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm shrink-0">
                    {(selectedBooking.client_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-850 dark:text-slate-200 text-sm">{selectedBooking.client_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-455 mt-0.5">Service: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedBooking.service_type}</span></p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-[#e8e3d9]/60 dark:border-slate-800/60">
                  {selectedBooking.client_phone && (
                    <a
                      href={`tel:+91${selectedBooking.client_phone}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-750 dark:text-slate-350 transition-colors font-sans text-xs font-semibold border border-slate-200/50 dark:border-slate-800/50"
                    >
                      <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-450 shrink-0" />
                      <span className="truncate">{selectedBooking.client_phone}</span>
                    </a>
                  )}
                  {selectedBooking.client_email && (
                    <a
                      href={`mailto:${selectedBooking.client_email}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-750 dark:text-slate-350 transition-colors font-sans text-xs font-semibold border border-slate-200/50 dark:border-slate-800/50"
                    >
                      <Mail className="h-4 w-4 text-blue-600 dark:text-blue-455 shrink-0" />
                      <span className="truncate">{selectedBooking.client_email}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Flight location section */}
              <div className="bg-[#fdfcfa] dark:bg-slate-950 rounded-2xl p-5 border border-[#e8e3d9] dark:border-slate-800/80 space-y-3">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[#e65737]" /> Flight Location Coordinates
                </p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-350 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                  {selectedBooking.location_name || "Not specified"}
                </p>
                {selectedBooking.client_location_lat && selectedBooking.client_location_lng && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedBooking.client_location_lat},${selectedBooking.client_location_lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 p-3 bg-[#e65737]/10 hover:bg-[#e65737]/15 text-[#e65737] hover:text-[#cc5032] border border-[#e65737]/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    🗺️ Route Map in Google Maps ({selectedBooking.client_location_lat.toFixed(5)}, {selectedBooking.client_location_lng.toFixed(5)})
                  </a>
                )}
              </div>

              {/* Schedule & Financials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#fdfcfa] dark:bg-slate-950 rounded-2xl p-4.5 border border-[#e8e3d9] dark:border-slate-800/80 space-y-1.5">
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#e65737]" /> Scheduled Date & Time
                  </p>
                  <p className="text-xs font-black text-slate-850 dark:text-slate-200">
                    {formatDate(selectedBooking.scheduled_at)}
                  </p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">
                    Requested duration: {selectedBooking.duration_hours || "—"} hr{selectedBooking.duration_hours !== 1 ? "s" : ""}
                  </p>
                </div>
                
                <div className="bg-[#fdfcfa] dark:bg-slate-950 rounded-2xl p-4.5 border border-[#e8e3d9] dark:border-slate-800/80 space-y-1.5">
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <IndianRupee className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" /> Projected Earning
                  </p>
                  <p className="text-base font-black text-emerald-600 dark:text-emerald-500">
                    ₹{selectedBooking.earnings_estimated > 0 ? selectedBooking.earnings_estimated.toLocaleString("en-IN") : "TBD"}
                  </p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">
                    Payment method: <span className="uppercase font-semibold">{selectedBooking.payment_method}</span>
                  </p>
                </div>
              </div>

              {/* Client Notes / Instructions */}
              {selectedBooking.requirements?.note && (
                <div className="bg-[#fdfcfa] dark:bg-slate-950 rounded-2xl p-5 border border-[#e8e3d9] dark:border-slate-800/80 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Client Instructions</p>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-350 italic leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                    &ldquo;{selectedBooking.requirements.note}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex pt-4 border-t border-[#e8e3d9]/60 dark:border-slate-800/60">
            <Button onClick={() => setSelectedBooking(null)} className="flex-1 bg-slate-900 hover:bg-[#e65737] text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 rounded-xl font-sans text-xs font-bold uppercase tracking-wider py-5 shadow-md hover:scale-[1.01] transition-all cursor-pointer">
              Close Console
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ModernFooter />
    </>
  )
}
