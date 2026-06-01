'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { getUserBookings } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Package,
    Calendar,
    Clock,
    MapPin,
    CheckCircle2,
    Clock4,
    ChevronRight,
    Search,
    Loader2,
    RefreshCw,
    IndianRupee,
    Compass,
    UserCheck,
    ArrowLeft,
    Plane,
    AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { ModernHeader } from '@/components/layout/modern-header'
import { ModernFooter } from '@/components/layout/modern-footer'

const getTelemetryStatus = (booking: any): string => {
    return (booking.requirements?.telemetryStatus || booking.status || 'PENDING').toUpperCase()
}

export default function OrdersPage() {
    const { user, isAuthenticated } = useAuth()
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({})

    const toggleOrderTracker = (bookingId: string) => {
        setExpandedOrders(prev => ({
            ...prev,
            [bookingId]: !prev[bookingId]
        }))
    }

    useEffect(() => {
        if (user) {
            fetchBookings()
        }
    }, [user])

    const fetchBookings = async () => {
        try {
            setLoading(true)
            const data = await getUserBookings(user!.id)
            setBookings(data)
            
            // Auto-expand all active/ongoing missions by default so their timeline is open
            const initialExpanded: Record<string, boolean> = {}
            data.forEach((b: any) => {
                const statusUpper = (b.status || '').toUpperCase()
                if (statusUpper !== 'COMPLETED' && statusUpper !== 'DONE' && statusUpper !== 'CANCELLED' && statusUpper !== 'REJECTED' && statusUpper !== 'DECLINED') {
                    initialExpanded[b.id] = true
                }
            })
            setExpandedOrders(initialExpanded)
        } catch (error) {
            console.error('Error fetching bookings:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'done':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200'
            case 'pending':
                return 'bg-amber-50 text-amber-700 border-amber-200'
            case 'cancelled':
            case 'declined':
                return 'bg-rose-50 text-rose-700 border-rose-200'
            default:
                return 'bg-blue-50 text-blue-700 border-blue-200'
        }
    }

    const getStatusIcon = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'done':
                return <CheckCircle2 className="h-3.5 w-3.5" />
            case 'pending':
                return <Clock4 className="h-3.5 w-3.5 animate-pulse" />
            case 'cancelled':
            case 'declined':
                return <AlertTriangle className="h-3.5 w-3.5" />
            default:
                return <Package className="h-3.5 w-3.5" />
        }
    }

    if (!user && !isAuthenticated && !loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 pt-32 flex items-center justify-center container mx-auto px-4">
                <Card className="max-w-md w-full p-8 text-center border border-gray-200 bg-white shadow-xl rounded-2xl">
                    <div className="h-20 w-20 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Package className="h-10 w-10 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">View Your Orders</h2>
                    <p className="text-gray-500 mb-8 text-sm leading-relaxed">Please sign in to track your drone missions and manage your bookings.</p>
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl text-white font-semibold transition-all shadow-lg shadow-blue-600/20">
                        <Link href="/login">Sign In Now</Link>
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <>
            <ModernHeader />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 text-gray-900 pt-28 pb-20">
                <div className="container mx-auto px-4 max-w-5xl">
                    {/* Back Option */}
                    <div className="mb-8">
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-blue-600 transition-all uppercase tracking-wider bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 hover:border-blue-300"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
                        </Link>
                    </div>

                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 bg-white backdrop-blur-md p-6 rounded-2xl border border-gray-200 shadow-lg">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                My Orders
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">Track your drone missions & bookings</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={fetchBookings}
                                className="rounded-xl border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-blue-300 transition-all gap-2 text-xs font-semibold px-4 h-10"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 h-10 text-xs font-bold transition-all shadow-lg shadow-blue-500/20">
                                <Link href="/drone-services">New Mission</Link>
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-6 select-none relative overflow-hidden bg-white/40 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm p-10">
                            {/* High-tech Radar/Drone scanning pulse */}
                            <div className="relative flex items-center justify-center w-20 h-20">
                                {/* Ripple rings */}
                                <div className="absolute inset-0 rounded-full border border-blue-500/10 animate-ping" style={{ animationDuration: '3s' }} />
                                <div className="absolute inset-2 rounded-full border border-indigo-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                                <div className="absolute inset-4 rounded-full bg-blue-50 border border-blue-150 flex items-center justify-center shadow-lg shadow-blue-500/5">
                                    <Compass className="w-6 h-6 text-blue-600 animate-spin" style={{ animationDuration: '4s' }} />
                                </div>
                            </div>

                            {/* Loading text with high tracking */}
                            <div className="space-y-1.5 text-center relative z-10 max-w-sm px-4">
                                <p className="text-[9px] font-black tracking-[0.25em] text-blue-600 uppercase">
                                    Syncing Missions
                                </p>
                                <h2 className="text-xs font-bold text-gray-700 leading-snug">
                                    Fetching telemetry flight orders...
                                </h2>
                            </div>

                            {/* Cinematic micro horizontal loading bar */}
                            <div className="w-36 bg-gray-100 border border-gray-200/50 rounded-full h-1 overflow-hidden shadow-inner">
                                <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 h-full rounded-full animate-[orders-bar_2.5s_infinite_ease-in-out]" />
                            </div>

                            <style dangerouslySetInnerHTML={{ __html: `
                                @keyframes orders-bar {
                                    0% { transform: translateX(-100%); }
                                    100% { transform: translateX(100%); }
                                }
                            `}} />
                        </div>
                    ) : bookings.length === 0 ? (
                        <Card className="border border-dashed border-gray-300 bg-white text-center p-16 rounded-2xl shadow-lg">
                            <div className="h-20 w-20 bg-gray-100 border border-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Search className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No missions registered</h3>
                            <p className="text-gray-500 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
                                You haven't booked any drone operations yet. Launch your first mission today!
                            </p>
                            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 h-11 text-xs font-bold transition-all shadow">
                                <Link href="/drone-services">Explore Services</Link>
                            </Button>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {bookings.map((booking) => {
                                const computedCost = booking.total_amount 
                                    ? Number(booking.total_amount)
                                    : booking.pilot?.hourly_rate
                                    ? (Number(booking.pilot.hourly_rate) * Number(booking.duration_hours || 2))
                                    : (1500 * Number(booking.duration_hours || 2));

                                return (
                                    <Card key={booking.id} className="group border border-gray-200 bg-white shadow-md rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col lg:flex-row">
                                                {/* Accent Sidebar */}
                                                <div className="lg:w-1.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500"></div>

                                                {/* Main Content Area */}
                                                <div className="flex-1 p-6 sm:p-8">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                                        <div className="flex items-center gap-3.5">
                                                            <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                                                                <Package className="h-6 w-6 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="font-bold text-lg text-gray-900 leading-tight">{booking.service_type}</span>
                                                                    <Badge className={`border ${getStatusColor(getTelemetryStatus(booking))} px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider`}>
                                                                        {getStatusIcon(getTelemetryStatus(booking))}
                                                                        {getTelemetryStatus(booking).replace('_', ' ')}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-xs text-blue-600 font-semibold mt-1.5 tracking-wider">Ref: {booking.booking_reference}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Cost Box */}
                                                        <div className="bg-gray-50 px-5 py-3 rounded-xl border border-gray-200 text-left sm:text-right min-w-[140px]">
                                                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Est. Cost</p>
                                                            <p className="text-xl font-bold text-emerald-600">
                                                                ₹{computedCost.toLocaleString("en-IN")}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-y border-gray-100">
                                                        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 space-y-1">
                                                            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Date</p>
                                                            <div className="flex items-center gap-2 text-gray-800">
                                                                <Calendar className="h-4 w-4 text-blue-500" />
                                                                <span className="text-xs font-semibold">{new Date(booking.scheduled_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                                                            </div>
                                                        </div>
                                                        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 space-y-1">
                                                            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Time</p>
                                                            <div className="flex items-center gap-2 text-gray-800">
                                                                <Clock className="h-4 w-4 text-blue-500" />
                                                                <span className="text-xs font-semibold">{new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                        </div>
                                                        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 space-y-1">
                                                            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">Pilot</p>
                                                            <div className="flex items-center gap-2 text-gray-800">
                                                                <div className="h-6 w-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-[10px] font-bold text-blue-600 uppercase">
                                                                    {(booking.pilot?.full_name || 'P').charAt(0)}
                                                                </div>
                                                                <span className="text-xs font-semibold truncate max-w-[120px]">{booking.pilot?.full_name || 'Assigned Pilot'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 space-y-1">
                                                            <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">OTP</p>
                                                            <div className="flex items-center gap-2">
                                                                <Badge className="bg-amber-50 text-amber-600 border border-amber-200 font-mono text-xs tracking-widest px-2.5 py-0.5 rounded-lg">
                                                                    {booking.otp_code || '****'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                                                        <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
                                                            <MapPin className="h-4 w-4 text-blue-500" />
                                                            <span>Location verified</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Button 
                                                                variant="ghost" 
                                                                onClick={() => toggleOrderTracker(booking.id)}
                                                                className={`rounded-xl transition-all font-bold text-xs h-10 px-4 ${
                                                                    expandedOrders[booking.id] 
                                                                        ? "text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200" 
                                                                        : "text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                                                                }`}
                                                            >
                                                                {expandedOrders[booking.id] ? "Close Status" : "Live Status"}
                                                            </Button>
                                                            <Button className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl flex items-center gap-2 px-5 h-10 text-xs font-bold transition-all" asChild>
                                                                <Link href={`/track/${(booking.order_uuid || booking.booking_reference || '').replace(/^#/, '')}`}>
                                                                    Tracking Hub
                                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Expandable Live Stepper Tracker Panel */}
                                                    {expandedOrders[booking.id] && (
                                                        <div className="mt-6">
                                                            <OrderLiveTracker 
                                                                bookingReference={booking.booking_reference} 
                                                                initialStatus={getTelemetryStatus(booking)}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
            <ModernFooter />
        </>
    )
}

interface TrackerProps {
    bookingReference: string
    initialStatus: string
}

function OrderLiveTracker({ bookingReference, initialStatus }: TrackerProps) {
    const [status, setStatus] = useState(initialStatus)
    const [loading, setLoading] = useState(true)
    const [details, setDetails] = useState<any>(null)

    useEffect(() => {
        let isMounted = true
        
        async function fetchStatus() {
            try {
                const cleanRef = bookingReference.replace(/^#/, '')
                const res = await fetch(`/api/jobs/details?uuid=${cleanRef}`)
                if (!res.ok) throw new Error()
                const data = await res.json()
                if (isMounted) {
                    setStatus(data.status || initialStatus)
                    setDetails(data)
                    setLoading(false)
                }
            } catch (err) {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchStatus()
        const interval = setInterval(fetchStatus, 5000)

        return () => {
            isMounted = false
            clearInterval(interval)
        }
    }, [bookingReference])

    const steps = [
        { key: 'PENDING', label: 'Booking Placed', desc: 'Booking registered and scheduled' },
        { key: 'ACCEPTED', label: 'Pilot Accepted', desc: 'Certified pilot assigned to mission' },
        { key: 'EN_ROUTE', label: 'Started', desc: 'Pilot heading to location' },
        { key: 'ON_SITE', label: 'Reached Location', desc: 'Pilot arrived at your site' },
        { key: 'VERIFIED', label: 'Identity Verified', desc: 'Security code authenticated' },
        { key: 'IN_PROGRESS', label: 'In Work Shoot', desc: 'Drone operations in progress' },
        { key: 'COMPLETED', label: 'Completed', desc: 'Mission concluded successfully' }
    ]

    const statusIndexMap: Record<string, number> = {
        PENDING: 0,
        ACCEPTED: 1,
        CONFIRMED: 1,
        EN_ROUTE: 2,
        ON_SITE: 3,
        VERIFIED: 4,
        IN_PROGRESS: 5,
        COMPLETED: 6,
        DONE: 6
    }

    const normalizedStatus = status?.toUpperCase() || 'PENDING'
    const currentStepIdx = statusIndexMap[normalizedStatus] ?? 0
    const isFullyCompleted = normalizedStatus === 'COMPLETED' || normalizedStatus === 'DONE'
    const isCancelledOrDeclined = normalizedStatus === 'CANCELLED' || normalizedStatus === 'DECLINED'

    return (
        <div className="border border-gray-200 bg-white p-6 sm:p-8 rounded-2xl space-y-6 mt-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-gray-700 flex items-center gap-2 uppercase tracking-wider">
                    {isCancelledOrDeclined ? (
                        <>
                            <span className="flex h-2.5 w-2.5 relative">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                            </span>
                            Mission Inactive
                        </>
                    ) : (
                        <>
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Live Status
                        </>
                    )}
                </h4>
                {loading ? (
                    <span className="text-[10px] text-gray-400 flex items-center gap-1.5 font-medium">
                        <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                        Syncing...
                    </span>
                ) : isCancelledOrDeclined ? (
                    <span className="text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        ● Inactive
                    </span>
                ) : (
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        ● Synced
                    </span>
                )}
            </div>

            {/* Flight Details Grid */}
            {details && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                            <UserCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">Pilot</span>
                            <span className="text-xs font-bold text-gray-800 block truncate max-w-[130px]">{details.pilotName || "Assigned Pilot"}</span>
                            <span className="text-[10px] text-gray-500 block font-medium mt-0.5">{details.pilotPhone || "+91 99999 99999"}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                            <IndianRupee className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-emerald-600 block uppercase tracking-wider">Cost</span>
                            <span className="text-xs font-bold text-emerald-700">
                                ₹{(details.totalAmount || details.estimatedAmount || 3000).toLocaleString("en-IN")}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">Date</span>
                            <span className="text-xs font-bold text-gray-800 block">
                                {new Date(details.scheduledAt || details.scheduled_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                            </span>
                            <span className="text-[10px] text-gray-500 block font-medium mt-0.5">
                                {new Date(details.scheduledAt || details.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                            <Compass className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-gray-400 block uppercase tracking-wider">Service</span>
                            <span className="text-xs font-bold text-gray-800 block truncate max-w-[130px]">{details.serviceType || details.service_type || "General Shoot"}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Stepper */}
            {isCancelledOrDeclined ? (
                <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0 animate-pulse">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                        <h5 className="font-extrabold text-sm text-rose-950 uppercase tracking-wider">Mission Cancelled / Declined</h5>
                        <p className="text-xs text-rose-700 font-medium mt-1 leading-relaxed">
                            This mission slot has been successfully cancelled and closed. No further active tracking operations will take place. If you have questions or wish to book a new mission, please contact support.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="relative pl-6 border-l-2 border-gray-200 space-y-8 md:space-y-0 md:pl-0 md:border-l-0 md:flex md:items-start md:gap-4 pt-2">
                    {steps.map((step, idx) => {
                        const isCompleted = isFullyCompleted || idx < currentStepIdx
                        const isCurrent = idx === currentStepIdx && !isFullyCompleted
                        const isPending = !isCompleted && !isCurrent

                        return (
                            <div key={step.key} className="relative md:flex-1">
                                {/* Horizontal Connecting Line for Desktop */}
                                {idx < steps.length - 1 && (
                                    <div className={`hidden md:block absolute top-4 left-8 right-0 h-[2px] transition-all duration-500 rounded-full ${
                                        isCompleted 
                                            ? 'bg-emerald-400' 
                                            : 'bg-gray-200'
                                    }`} />
                                )}

                                <div className="flex items-start md:flex-col md:items-center gap-4 text-left md:text-center">
                                    {/* Step Bubble */}
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 relative z-10 ${
                                        isCompleted 
                                            ? 'bg-emerald-500 text-white shadow-md' 
                                            : isCurrent
                                            ? 'bg-blue-600 text-white ring-4 ring-blue-100 border border-blue-400 shadow-md animate-pulse'
                                            : 'bg-gray-100 text-gray-400 border border-gray-200'
                                    }`}>
                                        {isCompleted ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : isCurrent ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            idx + 1
                                        )}
                                    </div>

                                    {/* Step Labels */}
                                    <div className="space-y-1 md:flex md:flex-col md:items-center">
                                        <p className={`text-xs font-bold transition-all duration-300 ${
                                            isCompleted ? 'text-gray-800' : isCurrent ? 'text-blue-600' : 'text-gray-400'
                                        }`}>
                                            {step.label}
                                        </p>
                                        <p className="text-[10px] text-gray-400 font-medium max-w-[145px] leading-normal">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
