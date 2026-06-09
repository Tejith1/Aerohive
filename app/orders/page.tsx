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
            <div className="min-h-screen bg-background pt-32 flex items-center justify-center container mx-auto px-4">
                <Card className="max-w-md w-full p-8 text-center border border-border bg-card shadow-xl rounded-3xl">
                    <div className="h-20 w-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Package className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-foreground">View Your Orders</h2>
                    <p className="text-muted-foreground mb-8 text-sm leading-relaxed">Please sign in to track your drone missions and manage your bookings.</p>
                    <Button asChild className="w-full bg-primary hover:bg-primary/90 h-12 rounded-full text-white font-semibold transition-all border-0 shadow-lg shadow-primary/20">
                        <Link href="/login">Sign In Now</Link>
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <>
            <ModernHeader />
            <div className="min-h-screen bg-background text-foreground pt-28 pb-24 transition-colors duration-300 relative">
                {/* Ambient Grid Background */}
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.01] pointer-events-none"></div>
                
                {/* Glowing decor */}
                <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#e65737]/5 dark:bg-[#e65737]/3 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/3 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-4 max-w-5xl relative z-10">
                    {/* Custom Tracking Container & Flightpath Logo */}
                    <div className="flex justify-center mb-6 animate-pulse">
                      <svg className="w-16 h-16 text-blue-600 dark:text-[#e65737]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="50" cy="50" r="40" strokeDasharray="3 3" className="opacity-30" />
                        <path d="M50 25L80 35v30L50 90L20 65V35Z" className="fill-blue-500/5 dark:fill-[#e65737]/5" />
                        <path d="M50 25v65M50 25L20 35M50 25l30 10M20 65l30 10M80 65L50 75" />
                        <path d="M10 50c30-30 50 30 80 0" className="text-blue-600 dark:text-[#e65737]" strokeDasharray="4 2" />
                        <circle cx="50" cy="50" r="4" className="fill-blue-600 dark:fill-[#e65737]" />
                      </svg>
                    </div>

                    {/* Back Option */}
                    <div className="mb-8">
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-blue-600 dark:hover:text-[#e65737] transition-all uppercase tracking-widest bg-card px-4 py-2 rounded-full shadow-sm border border-border hover:border-blue-600/30 dark:hover:border-[#e65737]/30"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
                        </Link>
                    </div>

                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 bg-card/70 backdrop-blur-xl p-8 rounded-3xl border border-border shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-display font-semibold tracking-tight text-foreground">
                                My Operations Hub
                            </h1>
                            <p className="text-sm text-muted-foreground">Track and manage your scheduled drone missions</p>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button
                                variant="outline"
                                onClick={fetchBookings}
                                className="rounded-full border-border bg-card text-foreground hover:bg-muted transition-all gap-2 text-xs font-bold px-5 h-11 flex-1 sm:flex-initial"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                                Sync
                            </Button>
                            <Button asChild className="bg-blue-600 dark:bg-[#e65737] hover:bg-blue-700 dark:hover:bg-[#d44d2d] text-white rounded-full px-5 h-11 text-xs font-bold transition-all shadow-sm flex-1 sm:flex-initial border-0">
                                <Link href="/drone-services">New Mission</Link>
                            </Button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-6 select-none relative overflow-hidden bg-card/45 backdrop-blur-md rounded-3xl border border-border p-12 shadow-sm">
                            <div className="relative flex items-center justify-center w-20 h-20">
                                <div className="absolute inset-0 rounded-full border border-blue-500/10 dark:border-[#e65737]/10 animate-ping" style={{ animationDuration: '3s' }} />
                                <div className="absolute inset-2 rounded-full border border-indigo-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                                <div className="absolute inset-4 rounded-full bg-blue-500/5 dark:bg-[#e65737]/5 border border-blue-500/15 dark:border-[#e65737]/15 flex items-center justify-center shadow-inner">
                                    <Compass className="w-6 h-6 text-blue-600 dark:text-[#e65737] animate-spin" style={{ animationDuration: '4s' }} />
                                </div>
                            </div>

                            <div className="space-y-1.5 text-center relative z-10 max-w-sm px-4">
                                <p className="text-[9px] font-bold tracking-[0.25em] text-blue-600 dark:text-[#e65737] uppercase">
                                    Synchronizing Flight Logs
                                </p>
                                <h2 className="text-xs font-bold text-muted-foreground leading-snug">
                                    Fetching telemetry flight orders...
                                </h2>
                            </div>

                            <div className="w-36 bg-muted border border-border rounded-full h-1 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-600 dark:from-[#e65737] via-indigo-500 to-blue-400 dark:to-[#FF8243] h-full rounded-full animate-[orders-bar_2.5s_infinite_ease-in-out]" />
                            </div>

                            <style dangerouslySetInnerHTML={{ __html: `
                                @keyframes orders-bar {
                                    0% { transform: translateX(-100%); }
                                    100% { transform: translateX(100%); }
                                }
                             `}} />
                        </div>
                    ) : bookings.length === 0 ? (
                        <Card className="border border-dashed border-border bg-card text-center p-16 rounded-3xl shadow-sm">
                            <CardContent className="py-8 space-y-4 max-w-sm mx-auto">
                                <div className="h-16 w-16 bg-muted border border-border rounded-2xl flex items-center justify-center mx-auto text-muted-foreground">
                                    <Search className="h-7 w-7" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">No active operations</h3>
                                <p className="text-muted-foreground text-xs leading-relaxed font-medium">
                                    You haven't scheduled any drone operations yet. Launch your first aerial mission today!
                                </p>
                                <Button asChild className="bg-blue-600 dark:bg-[#e65737] hover:bg-blue-700 dark:hover:bg-[#d44d2d] text-white rounded-full px-8 h-11 text-xs font-bold transition-all shadow-sm border-0">
                                    <Link href="/drone-services">Explore Services</Link>
                                </Button>
                            </CardContent>
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
                                    <Card key={booking.id} className="group border border-border bg-card/90 backdrop-blur-md shadow-sm rounded-3xl overflow-hidden hover:border-blue-500/30 dark:hover:border-[#e65737]/30 transition-all duration-300">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col lg:flex-row">
                                                {/* Left Accent Color bar */}
                                                <div className="lg:w-1.5 bg-gradient-to-b from-blue-600 dark:from-[#e65737] via-indigo-500 to-blue-400 dark:to-[#FF8243]"></div>

                                                {/* Main Content Area */}
                                                <div className="flex-1 p-6 sm:p-8">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                                        <div className="flex items-center gap-3.5">
                                                            <div className="h-12 w-12 rounded-2xl bg-blue-500/8 dark:bg-[#e65737]/8 border border-blue-500/15 dark:border-[#e65737]/15 flex items-center justify-center flex-shrink-0">
                                                                <Package className="h-6 w-6 text-blue-600 dark:text-[#e65737]" />
                                                            </div>
                                                            <div>
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="font-bold text-lg text-foreground leading-tight">{booking.service_type}</span>
                                                                    <Badge className={`border ${getStatusColor(getTelemetryStatus(booking))} px-2.5 py-0.5 rounded-lg flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider dark:bg-opacity-25`}>
                                                                        {getStatusIcon(getTelemetryStatus(booking))}
                                                                        {getTelemetryStatus(booking).replace('_', ' ')}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-[10px] text-blue-600 dark:text-[#e65737] font-bold mt-1.5 tracking-wider uppercase font-mono">Ref: {booking.booking_reference}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Cost Box */}
                                                        <div className="bg-muted px-5 py-3 rounded-2xl border border-border text-left sm:text-right min-w-[140px]">
                                                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">Est. Cost</p>
                                                            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-500">
                                                                ₹{computedCost.toLocaleString("en-IN")}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-y border-border">
                                                        <div className="bg-muted rounded-xl p-3.5 border border-border/40 space-y-1">
                                                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Date</p>
                                                            <div className="flex items-center gap-2 text-foreground">
                                                                <Calendar className="h-4 w-4 text-blue-600 dark:text-[#e65737]" />
                                                                <span className="text-xs font-semibold">{new Date(booking.scheduled_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                                                            </div>
                                                        </div>
                                                        <div className="bg-muted rounded-xl p-3.5 border border-border/40 space-y-1">
                                                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Time</p>
                                                            <div className="flex items-center gap-2 text-foreground">
                                                                <Clock className="h-4 w-4 text-blue-600 dark:text-[#e65737]" />
                                                                <span className="text-xs font-semibold">{new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                        </div>
                                                        <div className="bg-muted rounded-xl p-3.5 border border-border/40 space-y-1">
                                                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Pilot</p>
                                                            <div className="flex items-center gap-2 text-foreground">
                                                                <div className="h-6 w-6 rounded-lg bg-blue-500/10 dark:bg-[#e65737]/10 border border-blue-500/20 dark:border-[#e65737]/20 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-[#e65737] uppercase">
                                                                    {(booking.pilot?.full_name || 'P').charAt(0)}
                                                                </div>
                                                                <span className="text-xs font-semibold truncate max-w-[120px]">{booking.pilot?.full_name || 'Assigned Pilot'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="bg-muted rounded-xl p-3.5 border border-border/40 space-y-1">
                                                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">OTP</p>
                                                            <div className="flex items-center gap-2">
                                                                <Badge className="bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-955/30 font-mono text-xs tracking-widest px-2.5 py-0.5 rounded-lg font-bold">
                                                                    {booking.otp_code || '****'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                                                        <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold">
                                                            <MapPin className="h-4 w-4 text-blue-600 dark:text-[#e65737]" />
                                                            <span>Location dispatch verified</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Button 
                                                                variant="ghost" 
                                                                onClick={() => toggleOrderTracker(booking.id)}
                                                                className={`rounded-full transition-all font-bold text-xs h-10 px-4 ${
                                                                    expandedOrders[booking.id] 
                                                                        ? "text-rose-600 hover:text-rose-700 bg-rose-50/50 dark:bg-rose-950/15 border border-rose-100 dark:border-rose-950/30" 
                                                                        : "text-blue-600 dark:text-[#e65737] hover:text-blue-700 dark:hover:text-[#d44d2d] bg-blue-50/50 dark:bg-[#e65737]/5 border border-blue-100 dark:border-[#e65737]/15"
                                                                }`}
                                                            >
                                                                {expandedOrders[booking.id] ? "Close Tracker" : "Track Steps"}
                                                            </Button>
                                                            <Button className="bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-700 text-white border border-slate-800 dark:border-slate-700 rounded-xl flex items-center gap-2 px-5 h-10 text-xs font-bold transition-all shadow-sm" asChild>
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
        <div className="border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/60 backdrop-blur-md p-6 sm:p-8 rounded-3xl space-y-6 mt-5 shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-2 uppercase tracking-widest font-mono">
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
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#069494] dark:bg-[#08a3a3] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#069494] dark:bg-[#08a3a3]"></span>
                            </span>
                            Telemetry Stream
                        </>
                    )}
                </h4>
                {loading ? (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1.5 font-bold font-mono uppercase tracking-wider">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#069494] dark:text-[#08a3a3]" />
                        Syncing...
                    </span>
                ) : isCancelledOrDeclined ? (
                    <span className="text-[10px] text-rose-600 dark:text-rose-450 font-bold bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-950/30 px-2.5 py-0.5 rounded-lg flex items-center gap-1 font-mono uppercase">
                        ● Terminated
                    </span>
                ) : (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-450 font-bold bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-950/30 px-2.5 py-0.5 rounded-lg flex items-center gap-1 font-mono uppercase">
                        ● Live
                    </span>
                )}
            </div>

            {/* Flight Details Grid */}
            {details && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/80">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50/80 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-450 flex-shrink-0">
                            <UserCheck className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-505 block uppercase tracking-widest">Pilot</span>
                            <span className="text-xs font-bold text-slate-805 dark:text-slate-250 block truncate">{details.pilotName || "Assigned Pilot"}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-450 block font-medium mt-0.5">{details.pilotPhone || "+91 99999 99999"}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-650 dark:text-emerald-450 flex-shrink-0">
                            <IndianRupee className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 block uppercase tracking-widest">Amount</span>
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                ₹{(details.totalAmount || details.estimatedAmount || 3000).toLocaleString("en-IN")}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-violet-50/80 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-450 flex-shrink-0">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 block uppercase tracking-widest">Scheduled</span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-250 block">
                                {new Date(details.scheduledAt || details.scheduled_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-450 block font-medium mt-0.5">
                                {new Date(details.scheduledAt || details.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50/80 dark:bg-orange-950/20 border border-blue-100 dark:border-orange-900/30 flex items-center justify-center text-blue-600 dark:text-orange-400 flex-shrink-0">
                            <Compass className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 block uppercase tracking-widest">Service</span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-250 block truncate">{details.serviceType || details.service_type || "General Shoot"}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Stepper tracker */}
            {isCancelledOrDeclined ? (
                <div className="bg-rose-50/50 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-950/30 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0 animate-pulse">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                        <h5 className="font-extrabold text-sm text-rose-950 dark:text-rose-200 uppercase tracking-widest font-mono">Mission Aborted / Cancelled</h5>
                        <p className="text-xs text-rose-700 dark:text-rose-400 font-medium mt-1 leading-relaxed">
                            This operation has been cancelled. If you require assistance or wish to book a new mission, please connect with our dispatcher team.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-8 md:space-y-0 md:pl-0 md:border-l-0 md:flex md:items-start md:gap-4 pt-2">
                    {steps.map((step, idx) => {
                        const isCompleted = isFullyCompleted || idx < currentStepIdx
                        const isCurrent = idx === currentStepIdx && !isFullyCompleted

                        return (
                            <div key={step.key} className="relative md:flex-1">
                                {/* Connecting line for Desktop */}
                                {idx < steps.length - 1 && (
                                    <div className={`hidden md:block absolute top-4 left-8 right-0 h-[2px] transition-all duration-500 rounded-full ${
                                        isCompleted 
                                            ? 'bg-emerald-450 dark:bg-emerald-500' 
                                            : 'bg-slate-200 dark:bg-slate-800'
                                    }`} />
                                )}

                                <div className="flex items-start md:flex-col md:items-center gap-4 text-left md:text-center">
                                    {/* Bubble indicator */}
                                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 relative z-10 ${
                                        isCompleted 
                                            ? 'bg-emerald-500 text-white shadow-sm' 
                                            : isCurrent
                                            ? 'bg-[#069494] dark:bg-[#08a3a3] text-white ring-4 ring-[#069494]/10 dark:ring-[#08a3a3]/10 border border-[#069494]/20 dark:border-[#08a3a3]/20 shadow-sm animate-pulse'
                                            : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 border border-slate-205 dark:border-slate-800'
                                    }`}>
                                        {isCompleted ? (
                                            <CheckCircle2 className="h-4 w-4" />
                                        ) : isCurrent ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                                        ) : (
                                            idx + 1
                                        )}
                                    </div>

                                    {/* Labels */}
                                    <div className="space-y-1 md:flex md:flex-col md:items-center">
                                        <p className={`text-xs font-bold transition-all duration-300 ${
                                            isCompleted ? 'text-slate-800 dark:text-slate-250' : isCurrent ? 'text-[#069494] dark:text-[#08a3a3]' : 'text-slate-400 dark:text-slate-600'
                                        }`}>
                                            {step.label}
                                        </p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium max-w-[145px] leading-normal">
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
