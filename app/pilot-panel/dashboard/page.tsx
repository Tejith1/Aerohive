"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
    RefreshCw
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

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-200" },
    pending: { label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-200" },
    IN_PROGRESS: { label: "In Progress", className: "bg-blue-100 text-blue-700 border-blue-200" },
    in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-700 border-blue-200" },
    COMPLETED: { label: "Completed", className: "bg-green-100 text-green-700 border-green-200" },
    completed: { label: "Completed", className: "bg-green-100 text-green-700 border-green-200" },
    DONE: { label: "Completed", className: "bg-green-100 text-green-700 border-green-200" },
    CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-700 border-red-200" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700 border-red-200" },
    CONFIRMED: { label: "Confirmed", className: "bg-purple-100 text-purple-700 border-purple-200" },
    confirmed: { label: "Confirmed", className: "bg-purple-100 text-purple-700 border-purple-200" },
}

function getStatusConfig(status: string) {
    return STATUS_CONFIG[status] || { label: status, className: "bg-gray-100 text-gray-700 border-gray-200" }
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

    // Show nothing until session is verified (avoid flash)
    if (!sessionChecked || !pilot) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    const stats = [
        {
            label: "Total Bookings",
            value: summary?.total_bookings ?? 0,
            icon: <Users className="h-6 w-6" />,
            bg: "bg-blue-50",
            text: "text-blue-700",
            sub: `${summary?.confirmed_count ?? 0} confirmed`
        },
        {
            label: "Est. Total Earnings",
            value: `₹${(summary?.total_earnings_estimated ?? 0).toLocaleString("en-IN")}`,
            icon: <IndianRupee className="h-6 w-6" />,
            bg: "bg-green-50",
            text: "text-green-700",
            sub: `₹${(summary?.total_earnings_completed ?? 0).toLocaleString("en-IN")} earned`
        },
        {
            label: "Pending Jobs",
            value: summary?.pending_count ?? 0,
            icon: <Clock className="h-6 w-6" />,
            bg: "bg-amber-50",
            text: "text-amber-700",
            sub: `${summary?.in_progress_count ?? 0} in progress`
        },
        {
            label: "Completed Jobs",
            value: summary?.completed_count ?? 0,
            icon: <CheckCircle2 className="h-6 w-6" />,
            bg: "bg-purple-50",
            text: "text-purple-700",
            sub: `${summary?.cancelled_count ?? 0} cancelled`
        },
    ]

    return (
        <>
            <ModernHeader />

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

                {/* Page Header */}
                <section className="relative pt-28 pb-10 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/8 via-purple-600/8 to-pink-600/8" />
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

                            {/* Left: Title */}
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-1.5 text-sm">
                                        <Plane className="h-3.5 w-3.5 mr-1.5 inline" />
                                        Pilot Dashboard
                                    </Badge>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Welcome, {pilot.full_name.split(" ")[0]}!
                                </h1>
                                <p className="text-gray-500 mt-1 text-base">
                                    Here's your complete booking overview and earnings summary.
                                </p>
                            </div>

                            {/* Right: Logout */}
                            <Button
                                id="pilot-logout-btn"
                                onClick={handleLogout}
                                variant="outline"
                                className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl px-5 py-2.5 font-semibold transition-all"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                </section>

                <div className="container mx-auto px-4 pb-20 space-y-8">

                    {/* Pilot Profile Card */}
                    <Card className="border-0 shadow-xl bg-white rounded-2xl overflow-hidden">
                        <div className="h-1.5 bg-gradient-to-r from-blue-600 to-purple-600" />
                        <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">

                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    {pilot.profile_image_url ? (
                                        <img
                                            src={pilot.profile_image_url}
                                            alt={pilot.full_name}
                                            className="w-20 h-20 rounded-2xl object-cover shadow-md"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
                                            <span className="text-3xl font-black text-white">
                                                {pilot.full_name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    {pilot.is_verified && (
                                        <div className="absolute -bottom-1.5 -right-1.5 bg-green-500 rounded-full p-1 border-2 border-white">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Full Name</p>
                                        <p className="font-bold text-gray-900">{pilot.full_name}</p>
                                        <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                                            {pilot.rating} · {pilot.completed_jobs} jobs
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">DGCA Number</p>
                                        <p className="font-mono font-semibold text-blue-700 text-sm">{maskDgca(pilot.dgca_number)}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">Certificate ID</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Location</p>
                                        <p className="font-semibold text-gray-800 flex items-center gap-1">
                                            <MapPin className="h-4 w-4 text-blue-500" />
                                            {pilot.area}, {pilot.location}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                                            <Award className="h-3.5 w-3.5" />
                                            {pilot.experience}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Hourly Rate</p>
                                        <p className="text-2xl font-black text-gray-900">
                                            ₹{pilot.hourly_rate?.toLocaleString("en-IN")}
                                            <span className="text-sm text-gray-500 font-normal">/hr</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <Card key={i} className="border-0 shadow-lg bg-white rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <CardContent className="p-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.text}`}>
                                            {stat.icon}
                                        </div>
                                        <TrendingUp className="h-4 w-4 text-gray-300" />
                                    </div>
                                    <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                                    <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Bookings Section */}
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Your Bookings</h2>
                                <p className="text-sm text-gray-500 mt-0.5">All client bookings assigned to you</p>
                            </div>
                            <Button
                                id="refresh-bookings-btn"
                                variant="outline"
                                onClick={fetchBookings}
                                disabled={loadingBookings}
                                className="flex items-center gap-2 rounded-xl border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all"
                            >
                                <RefreshCw className={`h-4 w-4 ${loadingBookings ? "animate-spin" : ""}`} />
                                Refresh
                            </Button>
                        </div>

                        {/* Loading */}
                        {loadingBookings && (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                                <span className="ml-3 text-gray-500 text-lg">Loading bookings...</span>
                            </div>
                        )}

                        {/* Error */}
                        {!loadingBookings && bookingsError && (
                            <Card className="border-red-200 bg-red-50 rounded-2xl">
                                <CardContent className="py-10 text-center">
                                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
                                    <p className="text-red-700 font-semibold mb-1">Failed to load bookings</p>
                                    <p className="text-red-500 text-sm mb-4">{bookingsError}</p>
                                    <Button onClick={fetchBookings} variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
                                        Try Again
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Empty */}
                        {!loadingBookings && !bookingsError && bookings.length === 0 && (
                            <Card className="border-0 shadow-lg rounded-2xl bg-white">
                                <CardContent className="py-16 text-center">
                                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Briefcase className="h-10 w-10 text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Bookings Yet</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto">
                                        When clients book you from the pilot directory, their bookings will appear here.
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Bookings Grid */}
                        {!loadingBookings && !bookingsError && bookings.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {bookings.map((booking) => {
                                    const statusCfg = getStatusConfig(booking.status)
                                    return (
                                        <Card
                                            key={booking.id}
                                            className="group border-0 shadow-lg bg-white rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                                        >
                                            {/* Top accent line based on status */}
                                            <div className={`h-1 w-full ${booking.status.toUpperCase() === "COMPLETED" ? "bg-gradient-to-r from-green-400 to-green-600" :
                                                booking.status.toUpperCase() === "IN_PROGRESS" ? "bg-gradient-to-r from-blue-400 to-blue-600" :
                                                    booking.status.toUpperCase() === "CANCELLED" ? "bg-gradient-to-r from-red-400 to-red-600" :
                                                        "bg-gradient-to-r from-amber-400 to-orange-500"
                                                }`} />

                                            <CardContent className="p-5 space-y-4">

                                                {/* Header row */}
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="text-xs font-mono text-gray-400">{booking.booking_reference}</p>
                                                        <p className="font-bold text-gray-900 text-base mt-0.5">{booking.service_type}</p>
                                                    </div>
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusCfg.className}`}>
                                                        {statusCfg.label}
                                                    </span>
                                                </div>

                                                {/* Divider */}
                                                <div className="border-t border-gray-100" />

                                                {/* Client info */}
                                                <div className="space-y-2">
                                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Client Details</p>
                                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                                            <span className="text-white font-bold text-xs">
                                                                {(booking.client_name || "?").charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-gray-800">{booking.client_name}</p>
                                                            {booking.client_email && (
                                                                <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                                                                    <Mail className="h-3 w-3 flex-shrink-0" />
                                                                    {booking.client_email}
                                                                </p>
                                                            )}
                                                            {booking.client_phone && (
                                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                                    <Phone className="h-3 w-3 flex-shrink-0" />
                                                                    {booking.client_phone}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Booking details */}
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-gray-50 rounded-xl p-3">
                                                        <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" /> Scheduled
                                                        </p>
                                                        <p className="text-xs font-semibold text-gray-700">
                                                            {formatDate(booking.scheduled_at)}
                                                        </p>
                                                    </div>
                                                    <div className="bg-gray-50 rounded-xl p-3">
                                                        <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                                            <Clock className="h-3 w-3" /> Duration
                                                        </p>
                                                        <p className="text-sm font-bold text-gray-700">
                                                            {booking.duration_hours || "—"} hr{booking.duration_hours !== 1 ? "s" : ""}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Earnings */}
                                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-xs text-gray-500 font-medium">
                                                                {["COMPLETED", "DONE"].includes(booking.status.toUpperCase()) ? "Earned" : "Estimated Earning"}
                                                            </p>
                                                            <p className="text-2xl font-black text-gray-900 mt-0.5">
                                                                ₹{booking.earnings_estimated > 0
                                                                    ? booking.earnings_estimated.toLocaleString("en-IN")
                                                                    : "TBD"}
                                                            </p>
                                                            {booking.earnings_estimated > 0 && (
                                                                <p className="text-xs text-gray-400 mt-0.5">
                                                                    ₹{booking.hourly_rate}/hr × {booking.duration_hours}hr
                                                                    {booking.payment_method ? ` · ${booking.payment_method}` : ""}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
                                                            <IndianRupee className="h-6 w-6 text-white" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* OTP (only show for pending/in-progress) */}
                                                {["PENDING", "IN_PROGRESS", "pending", "in_progress", "CONFIRMED", "confirmed"].includes(booking.status) && booking.otp_code && (
                                                    <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
                                                        <div className="flex items-center gap-2">
                                                            <ShieldCheck className="h-4 w-4 text-amber-600" />
                                                            <span className="text-xs font-semibold text-amber-700">Verification OTP</span>
                                                        </div>
                                                        <span className="font-mono font-black text-amber-800 text-lg tracking-widest">
                                                            {booking.otp_code}
                                                        </span>
                                                    </div>
                                                )}

                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            <ModernFooter />
        </>
    )
}
