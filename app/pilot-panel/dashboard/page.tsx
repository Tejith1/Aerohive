"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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

  // Check session on mount
  useEffect(() => {
    const sessionStr = localStorage.getItem("aerohive_pilot_session")
    if (!sessionStr) {
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
    fetchBookings()
  }, [pilot])

  const fetchBookings = async () => {
    if (!pilot) return
    setLoadingBookings(true)
    setBookingsError(null)
    try {
      const res = await fetch(`/api/pilot-auth/bookings?pilotId=${pilot.id}`)
      const data = await res.json()
      if (!res.ok) {
        setBookingsError(data.error || "Failed to fetch bookings.")
        return
      }
      setBookings(data.bookings || [])
      setSummary(data.summary || null)
    } catch (err: any) {
      setBookingsError("Network error. Please try again.")
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
      fetchBookings()
    } catch (err: any) {
      setActionError(prev => ({ ...prev, [bookingId]: err.message }))
      // Rollback status on failure
      fetchBookings()
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
      fetchBookings()
    } catch (err: any) {
      setActionError(prev => ({ ...prev, [bookingId]: err.message }))
      fetchBookings()
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
      fetchBookings()
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
      fetchBookings()
    } catch (err: any) {
      setActionError(prev => ({ ...prev, [bookingId]: err.message }))
      fetchBookings()
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [bookingId]: false }))
    }
  }

  // Show nothing until session is verified (avoid flash)
  if (!sessionChecked || !pilot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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

      {/* Main theme aligned background gradient */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-slate-50 to-purple-50/50 text-slate-800 pb-20 pt-24 font-sans selection:bg-blue-600/10">
        
        {/* Soft Decorative Glow Effects */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-blue-200/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 max-w-7xl relative z-10">

          {/* Action Header Card */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-slate-200/60 shadow-xl">
            <div className="space-y-1">
              <Badge className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 px-3 py-1 text-xs font-semibold rounded-lg tracking-wide uppercase">
                <Plane className="h-3 w-3 mr-1 inline" />
                Aviator Command
              </Badge>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Pilot Dashboard
                </span>
              </h1>
              <p className="text-sm text-slate-500">
                Logged in as <span className="font-semibold text-slate-700">{pilot.full_name}</span> &bull; DGCA: <span className="font-mono text-blue-600 text-xs font-semibold">{maskDgca(pilot.dgca_number)}</span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={fetchBookings}
                disabled={loadingBookings}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold transition-all flex items-center gap-2 shadow-sm"
              >
                <RefreshCw className={`h-4 w-4 ${loadingBookings ? "animate-spin" : ""}`} />
                Sync Telemetry
              </Button>
              <Button
                id="pilot-logout-btn"
                onClick={handleLogout}
                className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-xl px-4 py-2 text-sm font-semibold transition-all flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, i) => (
              <Card key={i} className="border-slate-200/60 bg-white/70 backdrop-blur-md shadow-lg hover:border-slate-300/80 hover:shadow-xl transition-all duration-300 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className={`p-3 rounded-xl border ${stat.bg}`}>
                      {stat.icon}
                    </div>
                    <TrendingUp className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-black tracking-tight text-slate-900">{stat.value}</p>
                    <p className="text-sm font-semibold text-slate-600">{stat.label}</p>
                    <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Core Content Navigation */}
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-4">
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setActiveTab("requests")}
                  className={`relative rounded-xl px-5 py-2.5 text-sm font-bold transition-all border ${
                    activeTab === "requests"
                      ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md shadow-blue-500/10"
                      : "bg-white text-slate-600 border-slate-200 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Incoming Requests
                  {pendingRequests.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-md">
                      {pendingRequests.length}
                    </span>
                  )}
                </Button>
                <Button
                  onClick={() => setActiveTab("active")}
                  className={`relative rounded-xl px-5 py-2.5 text-sm font-bold transition-all border ${
                    activeTab === "active"
                      ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md shadow-blue-500/10"
                      : "bg-white text-slate-600 border-slate-200 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Active Missions
                  {activeMissions.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                      {activeMissions.length}
                    </span>
                  )}
                </Button>
                <Button
                  onClick={() => setActiveTab("completed")}
                  className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all border ${
                    activeTab === "completed"
                      ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-md shadow-blue-500/10"
                      : "bg-white text-slate-600 border-slate-200 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  Archived / History
                </Button>
              </div>

              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                Category: <span className="text-blue-600">{activeTab}</span>
              </div>
            </div>

            {/* List Screen */}
            {loadingBookings ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-slate-500 font-medium">Syncing telemetry data...</p>
              </div>
            ) : bookingsError ? (
              <Card className="border-rose-200 bg-rose-50 shadow-lg rounded-2xl">
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-rose-600 mx-auto mb-4" />
                  <p className="text-rose-800 font-bold text-lg mb-1">Failed to sync mission files</p>
                  <p className="text-rose-600 text-sm mb-6">{bookingsError}</p>
                  <Button onClick={fetchBookings} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-5 py-2.5 font-bold shadow">
                    Try Telemetry Sync Again
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Empty State checks */}
                {activeTab === "requests" && pendingRequests.length === 0 && (
                  <Card className="border-slate-200/80 bg-white/40 rounded-2xl shadow-md border-dashed">
                    <CardContent className="py-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto border border-slate-200">
                        <Compass className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-700">No Pending Requests</h3>
                      <p className="text-slate-500 max-w-sm mx-auto text-sm">
                        You have resolved all booking invitations. When customers hire you, requests will prompt here instantly.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {activeTab === "active" && activeMissions.length === 0 && (
                  <Card className="border-slate-200/80 bg-white/40 rounded-2xl shadow-md border-dashed">
                    <CardContent className="py-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto border border-slate-200">
                        <Zap className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-700">No Active Missions</h3>
                      <p className="text-slate-500 max-w-sm mx-auto text-sm">
                        No operations are active at the moment. Accept client orders in the requests portal to launch telemetry tracking.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {activeTab === "completed" && completedMissions.length === 0 && (
                  <Card className="border-slate-200/80 bg-white/40 rounded-2xl shadow-md border-dashed">
                    <CardContent className="py-20 text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto border border-slate-200">
                        <Map className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-700">No History Found</h3>
                      <p className="text-slate-500 max-w-sm mx-auto text-sm">
                        Archived logs will display here upon successful completion or cancellations of active drone missions.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Grid Renders */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Requests Tab Render */}
                  {activeTab === "requests" && pendingRequests.map((booking) => {
                    const statusCfg = getStatusConfig(booking.status)
                    const errorMsg = actionError[booking.id]

                    return (
                      <Card key={booking.id} className="border-slate-200/60 bg-white/90 backdrop-blur-md shadow-lg hover:shadow-xl transition-all rounded-2xl overflow-hidden flex flex-col justify-between group">
                        <div>
                          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 border-b border-slate-100 flex justify-between items-center">
                            <div>
                              <p className="text-xs font-mono text-slate-400">{booking.booking_reference}</p>
                              <h4 className="font-extrabold text-slate-800 mt-0.5">{booking.service_type}</h4>
                            </div>
                            <Badge className={`${statusCfg.className} rounded-lg text-xs font-bold`}>
                              {statusCfg.label}
                            </Badge>
                          </div>

                          <div className="p-5 space-y-4">
                            {/* Client Block */}
                            <div className="space-y-2">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Client Credentials</p>
                              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow">
                                  {(booking.client_name || "?").charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-slate-700 text-sm">{booking.client_name}</p>
                                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                    <Phone className="h-3 w-3 flex-shrink-0" />
                                    {booking.client_phone || "Not Shared"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Details Block */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-blue-500" /> Schedule
                                </p>
                                <p className="text-xs font-semibold text-slate-700">
                                  {formatDate(booking.scheduled_at)}
                                </p>
                              </div>
                              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-blue-500" /> Est. Duration
                                </p>
                                <p className="text-xs font-semibold text-slate-700">
                                  {booking.duration_hours || "—"} hr{booking.duration_hours !== 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>

                            {/* Pricing Block */}
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex justify-between items-center">
                              <div>
                                <p className="text-xs text-slate-500">Est. Earning Potential</p>
                                <p className="text-xl font-black text-emerald-600 mt-0.5">
                                  ₹{booking.earnings_estimated > 0 ? booking.earnings_estimated.toLocaleString("en-IN") : "TBD"}
                                </p>
                              </div>
                              <Badge className="bg-slate-100 text-slate-500 text-[10px] font-mono border-0">
                                {booking.payment_method}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 pt-0 mt-auto space-y-3">
                          {errorMsg && (
                            <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                              {errorMsg}
                            </p>
                          )}

                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              onClick={() => handleAccept(booking.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl py-2.5 transition-all text-xs shadow-sm hover:shadow"
                            >
                              Accept Booking
                            </Button>
                            <Button
                              onClick={() => handleReject(booking.id)}
                              className="bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-100 font-bold rounded-xl py-2.5 transition-all text-xs"
                            >
                              Decline Job
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  })}

                  {/* Active Missions Tab Render */}
                  {activeTab === "active" && activeMissions.map((booking) => {
                    const statusCfg = getStatusConfig(booking.status)
                    const errorMsg = actionError[booking.id]
                    const verifying = verifyingOtp[booking.id]
                    const updating = updatingStatus[booking.id]
                    const currentOtpVal = otpInputs[booking.id] || ""

                    // Map progress value for UI
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
                      <Card key={booking.id} className="border-slate-200/60 bg-white/90 backdrop-blur-md shadow-lg hover:shadow-xl transition-all rounded-2xl overflow-hidden flex flex-col justify-between">
                        <div>
                          <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 p-4 border-b border-slate-100 flex justify-between items-center">
                            <div>
                              <p className="text-xs font-mono text-slate-400">{booking.booking_reference}</p>
                              <h4 className="font-extrabold text-slate-800 mt-0.5">{booking.service_type}</h4>
                            </div>
                            <Badge className={`${statusCfg.className} rounded-lg text-xs font-bold`}>
                              {statusCfg.label}
                            </Badge>
                          </div>

                          <div className="p-5 space-y-4">
                            {/* Client Block */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Client</p>
                                <span className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg font-mono">
                                  {booking.payment_method}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow">
                                  {(booking.client_name || "?").charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-slate-700 text-sm">{booking.client_name}</p>
                                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                    <Phone className="h-3 w-3 text-slate-400" />
                                    {booking.client_phone || "Not Shared"}
                                  </p>
                                  {booking.client_email && (
                                    <p className="text-xs text-slate-500 flex items-center gap-1 truncate mt-0.5">
                                      <Mail className="h-3 w-3 text-slate-400" />
                                      {booking.client_email}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Details Block */}
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <span className="text-slate-400 block mb-1">Time scheduled</span>
                                <span className="font-semibold text-slate-700">{formatDate(booking.scheduled_at)}</span>
                              </div>
                              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <span className="text-slate-400 block mb-1">Expected Earning</span>
                                <span className="font-black text-emerald-600 block text-sm">
                                  ₹{booking.earnings_estimated > 0 ? booking.earnings_estimated.toLocaleString("en-IN") : "TBD"}
                                </span>
                              </div>
                            </div>

                            {/* Status Timeline visualizer */}
                            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-2">
                              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                                <span>STATUS TIMELINE</span>
                                <span className="text-blue-600">{Math.round((currentIdx / (statusOrderList.length - 1)) * 100)}% Complete</span>
                              </div>
                              <div className="flex items-center gap-1 w-full bg-white p-1.5 rounded-lg border border-slate-100">
                                {statusOrderList.map((s, idx) => {
                                  const isActiveStep = s.toUpperCase() === booking.status.toUpperCase()
                                  const isDone = idx < currentIdx
                                  return (
                                    <div
                                      key={s}
                                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                        isActiveStep
                                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md shadow-blue-500/10"
                                          : isDone
                                          ? "bg-emerald-500/80"
                                          : "bg-slate-200"
                                      }`}
                                    />
                                  )
                                })}
                              </div>
                              <p className="text-[10px] text-slate-500 font-semibold italic text-center leading-normal">
                                {booking.status.toUpperCase() === "ACCEPTED" && "💡 Advance to 'Started' to begin journey to location"}
                                {booking.status.toUpperCase() === "EN_ROUTE" && "💡 Advance to 'Reached Location' upon arrival at site"}
                                {booking.status.toUpperCase() === "ON_SITE" && "💡 Collect and verify 4-digit security code from client"}
                                {booking.status.toUpperCase() === "VERIFIED" && "💡 Security verified. Click 'In Work Shoot' to launch drone"}
                                {booking.status.toUpperCase() === "IN_PROGRESS" && "💡 Click 'Completed' once operations are concluded"}
                              </p>
                            </div>

                            {/* Action block based on status */}
                            <div className="border-t border-slate-100 pt-4 mt-2">
                              {booking.status.toUpperCase() === "ON_SITE" ? (
                                <div className="space-y-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                                  <label className="text-xs font-bold text-blue-600 flex items-center gap-1">
                                    <ShieldCheck className="h-4 w-4 text-blue-500" /> User Verification Code Required
                                  </label>
                                  <p className="text-[11px] text-blue-600 font-semibold leading-normal">
                                    Verify 4-digit client OTP upon arrival to proceed.
                                  </p>
                                  <div className="flex gap-2">
                                    <Input
                                      type="text"
                                      placeholder="Enter 4-digit client OTP"
                                      maxLength={4}
                                      value={currentOtpVal}
                                      onChange={(e) => setOtpInputs(prev => ({ ...prev, [booking.id]: e.target.value.replace(/\D/g, "") }))}
                                      className="bg-white border-slate-200 text-center font-mono font-black text-lg tracking-widest text-slate-800 rounded-xl focus:border-blue-500 transition-all h-10 flex-1"
                                    />
                                    <Button
                                      onClick={() => handleVerifyOtp(booking.id)}
                                      disabled={verifying || currentOtpVal.length !== 4}
                                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 h-10 rounded-xl transition-all text-xs"
                                    >
                                      {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Code"}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-205 shadow-lg relative overflow-hidden text-left backdrop-blur-md">
                                    {/* Glowing accent backdrops */}
                                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
                                    
                                    <div className="flex justify-between items-center relative z-10">
                                      <span className="text-[11px] font-black text-slate-700 tracking-wider uppercase">
                                        Mission Ops Console
                                      </span>
                                      <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 animate-pulse">
                                        Secure Link Active
                                      </span>
                                    </div>

                                    {/* Work Progress selector */}
                                    <div className="space-y-3 relative z-10">
                                      <div className="flex items-center justify-between">
                                        <label className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold block">
                                          Work Progress Commands
                                        </label>
                                        <span className="text-[8px] font-mono text-slate-450 font-semibold">Uplink: Live 99.9%</span>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-2.5">
                                        {[
                                          { status: "EN_ROUTE", label: "Started" },
                                          { status: "ON_SITE", label: "Reached Location" },
                                          { status: "IN_PROGRESS", label: "In Work Shoot" },
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
                                              className={`h-11 px-3 text-[11px] font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 border relative ${
                                                isCurrent 
                                                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-blue-500 shadow-md shadow-blue-500/20 scale-[1.02] z-10"
                                                  : isCompletedBefore
                                                  ? "bg-emerald-50 text-emerald-700 border-emerald-150 cursor-not-allowed opacity-80"
                                                  : !isAllowed
                                                  ? "bg-slate-100/50 text-slate-350 border-slate-205/50 cursor-not-allowed opacity-50"
                                                  : "bg-white text-slate-700 border-slate-250 hover:border-blue-500/50 hover:bg-blue-50 hover:text-blue-600 hover:shadow-sm"
                                              }`}
                                            >
                                              {updating && updatingStatus[booking.id] ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                                              ) : (
                                                <>
                                                  {isCompletedBefore && <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3.5]" />}
                                                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-blue-300 inline-block animate-ping mr-1" />}
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

                        <div className="p-5 pt-0 mt-auto">
                          {errorMsg && (
                            <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2 rounded-lg flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                              {errorMsg}
                            </p>
                          )}
                        </div>
                      </Card>
                    )
                  })}

                  {/* Completed / History Tab Render */}
                  {activeTab === "completed" && completedMissions.map((booking) => {
                    const statusCfg = getStatusConfig(booking.status)
                    const isSuccess = ["COMPLETED", "DONE"].includes(booking.status.toUpperCase())

                    return (
                      <Card key={booking.id} className="border-slate-200 bg-white/90 shadow-md rounded-2xl overflow-hidden flex flex-col justify-between">
                        <div>
                          <div className={`p-4 border-b border-slate-100 flex justify-between items-center ${isSuccess ? "bg-emerald-50/50" : "bg-rose-50/50"}`}>
                            <div>
                              <p className="text-xs font-mono text-slate-400">{booking.booking_reference}</p>
                              <h4 className="font-extrabold text-slate-800 mt-0.5">{booking.service_type}</h4>
                            </div>
                            <Badge className={`${statusCfg.className} rounded-lg text-xs font-bold`}>
                              {statusCfg.label}
                            </Badge>
                          </div>

                          <div className="p-5 space-y-4">
                            {/* Client Block */}
                            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-xs shadow-sm ${isSuccess ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                                {isSuccess ? <Check className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-700">{booking.client_name}</p>
                                <p className="text-[10px] text-slate-500 font-medium font-mono">{booking.client_phone}</p>
                              </div>
                            </div>

                            {/* Details Block */}
                            <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-600">
                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                <span className="text-slate-400 block mb-0.5">Time Log</span>
                                <span className="font-medium">{formatDate(booking.scheduled_at)}</span>
                              </div>
                              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                                <span className="text-slate-400 block mb-0.5">Earnings</span>
                                <span className={`font-black ${isSuccess ? "text-emerald-600" : "text-slate-500"}`}>
                                  {isSuccess ? `₹${booking.earnings_estimated.toLocaleString("en-IN")}` : "₹0.00"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 pt-0 mt-auto">
                          <p className="text-[10px] text-slate-400 text-center font-medium bg-slate-50 py-1.5 rounded-lg border border-slate-100">
                            Telemetry log archived successfully
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

      <ModernFooter />
    </>
  )
}
