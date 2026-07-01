'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { getUserBookings, supabase } from '@/lib/supabase'
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
    AlertTriangle,
    Shield,
    Sparkles,
    User
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
    const [ordersTab, setOrdersTab] = useState<'pilots' | 'services'>('pilots')

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
            
            // 1. Fetch standard pilot bookings
            const pilotData = await getUserBookings(user!.id)
            
            // 2. Fetch drone service bookings
            const { data: serviceData, error: srvError } = await supabase
                .from('service_bookings')
                .select(`
                    *,
                    service:drone_services(*),
                    provider:service_providers(*)
                `)
                .eq('user_id', user!.id)

            if (srvError) {
                console.error('Error fetching service bookings:', srvError)
            }

            // 3. Map service bookings to standard booking model
            const mappedServiceBookings = (serviceData || []).map((sb: any) => {
                let otpVal = null
                if (sb.location_address) {
                    try {
                        const addrObj = typeof sb.location_address === 'string'
                            ? JSON.parse(sb.location_address)
                            : sb.location_address
                        otpVal = addrObj.otp_code || null
                    } catch (e) {}
                }
                return {
                    id: sb.id,
                    created_at: sb.created_at,
                    service_type: sb.service?.title || 'Drone Service',
                    status: sb.status || 'PENDING',
                    booking_reference: sb.provider?.name || 'AeroHive Provider',
                    is_service: true,
                    provider_name: sb.provider?.name || 'AeroHive Provider',
                    total_amount: sb.actual_cost || sb.estimated_cost || 1500,
                    scheduled_at: sb.booking_date,
                    duration_hours: sb.duration_hours || 2.0,
                    otp_code: otpVal,
                    requirements: {
                        telemetryStatus: sb.status
                    },
                    pilot: {
                        full_name: sb.provider?.name || 'AeroHive Provider',
                        phone: sb.provider?.phone
                    }
                }
            })

            // 4. Combine and sort
            const combined = [
                ...pilotData.map((b: any) => ({ 
                    ...b, 
                    is_service: false,
                    booking_reference: b.pilot?.full_name || b.booking_reference
                })),
                ...mappedServiceBookings
            ].sort((a: any, b: any) => {
                const dateA = new Date(a.created_at || a.scheduled_at).getTime()
                const dateB = new Date(b.created_at || b.scheduled_at).getTime()
                return dateB - dateA
            })

            setBookings(combined)
            
            // Auto-expand all active/ongoing missions by default so their timeline is open
            const initialExpanded: Record<string, boolean> = {}
            combined.forEach((b: any) => {
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
                return 'bg-emerald-50 text-emerald-700 border-emerald-205 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
            case 'pending':
                return 'bg-amber-50 text-amber-700 border-amber-205 dark:bg-amber-955/20 dark:text-amber-500 dark:border-amber-900/30'
            case 'cancelled':
            case 'declined':
            case 'rejected':
                return 'bg-rose-50 text-rose-700 border-rose-205 dark:bg-rose-955/20 dark:text-rose-455 dark:border-rose-900/30'
            default:
                return 'bg-blue-50 text-blue-700 border-blue-205 dark:bg-blue-955/20 dark:text-blue-400 dark:border-blue-900/30'
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
            case 'rejected':
                return <AlertTriangle className="h-3.5 w-3.5" />
            default:
                return <Package className="h-3.5 w-3.5" />
        }
    }

    if (!user && !isAuthenticated && !loading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 flex items-center justify-center container mx-auto px-4">
                <Card className="max-w-md w-full p-8 text-center border border-border bg-card shadow-xl rounded-2xl">
                    <div className="h-20 w-20 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Package className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight font-display mb-3 text-foreground">View Operations</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 text-xs leading-relaxed font-sans">Please sign in to track your active drone flights and manage scheduled mission timelines.</p>
                    <Button asChild className="w-full bg-slate-900 hover:bg-primary h-12 rounded-full text-white font-semibold transition-all border-0 shadow-md">
                        <Link href="/login">Sign In</Link>
                    </Button>
                </Card>
            </div>
        )
    }

    // Split orders
    const pilotBookings = bookings.filter(b => !b.is_service)
    const serviceBookings = bookings.filter(b => b.is_service)
    const activeList = ordersTab === 'pilots' ? pilotBookings : serviceBookings

    return (
        <>
            <ModernHeader />
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 pt-28 pb-24 transition-colors duration-300 relative">
                {/* Ambient Glows */}
                <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-primary/5 dark:bg-primary/3 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-10 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/3 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto px-4 max-w-5xl relative z-10 text-left">
                    
                    {/* Back Option */}
                    <div className="mb-6">
                        <Link 
                            href="/" 
                            className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-550 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all uppercase tracking-widest bg-[#fdfcfa] dark:bg-slate-900 px-4 py-2 rounded-full shadow-sm border border-[#e8e3d9] dark:border-slate-800"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
                        </Link>
                    </div>

                    {/* Header Banner Card */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 bg-[#fdfcfa]/90 dark:bg-slate-900/60 backdrop-blur-xl p-8 rounded-[32px] border border-[#e8e3d9] dark:border-slate-800 shadow-md">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight font-display text-slate-900 dark:text-white">
                                My Operations Hub
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Track real-time flight telemetry, status markers, and OTP keys.</p>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button
                                variant="outline"
                                onClick={fetchBookings}
                                className="rounded-full border-[#e8e3d9] dark:border-slate-800 bg-[#fdfcfa] dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-[#faf8f5] dark:hover:bg-slate-900 transition-all gap-2 text-xs font-bold px-5 h-11 flex-1 sm:flex-initial"
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                                Sync Hub
                            </Button>
                            <Button asChild className="bg-slate-900 hover:bg-primary text-white dark:bg-white dark:hover:bg-primary dark:text-slate-900 dark:hover:text-white rounded-full px-5 h-11 text-xs font-bold transition-all border-0 shadow-sm flex-1 sm:flex-initial cursor-pointer">
                                <Link href="/drone-services">New Mission</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Segmented Tab Switcher (Drone Pilots vs Drone Services) */}
                    <div className="flex bg-[#fdfcfa] dark:bg-slate-900/60 rounded-full p-1 border border-[#e8e3d9] dark:border-slate-800 shadow-sm w-fit mb-8">
                        <button
                            onClick={() => setOrdersTab("pilots")}
                            className={`rounded-full px-6 py-2.5 text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                                ordersTab === "pilots" 
                                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm" 
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                        >
                            <User className="w-3.5 h-3.5" /> Drone Pilot Bookings ({pilotBookings.length})
                        </button>
                        <button
                            onClick={() => setOrdersTab("services")}
                            className={`rounded-full px-6 py-2.5 text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                                ordersTab === "services" 
                                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm" 
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            }`}
                        >
                            <Plane className="w-3.5 h-3.5" /> Drone Service Bookings ({serviceBookings.length})
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-6 bg-[#fdfcfa]/50 dark:bg-slate-900/30 backdrop-blur-md rounded-[32px] border border-[#e8e3d9] dark:border-slate-800 p-12 shadow-inner">
                            <div className="relative flex items-center justify-center w-20 h-20">
                                <div className="absolute inset-0 rounded-full border border-primary/10 animate-ping" style={{ animationDuration: '3s' }} />
                                <div className="absolute inset-4 rounded-full bg-primary/5 border border-primary/15 flex items-center justify-center shadow-inner">
                                    <Compass className="w-6 h-6 text-primary animate-spin" style={{ animationDuration: '4s' }} />
                                </div>
                            </div>
                            <div className="space-y-1.5 text-center max-w-sm px-4">
                                <p className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase font-sans">
                                    Syncing Flight Registries
                                </p>
                                <h2 className="text-xs font-bold text-slate-500 dark:text-slate-450">
                                    Retrieving active and historic bookings...
                                </h2>
                            </div>
                        </div>
                    ) : activeList.length === 0 ? (
                        <Card className="border border-dashed border-[#e8e3d9] dark:border-slate-800 bg-[#fdfcfa]/80 dark:bg-slate-900/50 text-center p-16 rounded-[32px] shadow-sm max-w-lg mx-auto">
                            <CardContent className="space-y-4 max-w-sm mx-auto p-0">
                                <div className="h-16 w-16 bg-muted border border-border rounded-xl flex items-center justify-center mx-auto text-muted-foreground">
                                    <Search className="h-7 w-7" />
                                </div>
                                <h3 className="text-lg font-bold tracking-tight font-display text-slate-900 dark:text-white">No bookings in this sector</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-sans">
                                    You don't have any scheduled drone {ordersTab === 'pilots' ? 'pilot hires' : 'service orders'} active. Request your flight mission today!
                                </p>
                                <Button asChild className="bg-slate-900 hover:bg-primary text-white dark:bg-white dark:hover:bg-primary dark:text-slate-900 dark:hover:text-white rounded-full px-8 h-11 text-xs font-bold transition-all border-0 shadow-sm cursor-pointer">
                                    <Link href="/drone-services">Explore Services</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {activeList.map((booking) => {
                                const computedCost = booking.total_amount 
                                    ? Number(booking.total_amount)
                                    : booking.pilot?.hourly_rate
                                    ? (Number(booking.pilot.hourly_rate) * Number(booking.duration_hours || 2))
                                    : (1500 * Number(booking.duration_hours || 2));

                                return (
                                    <Card key={booking.id} className="group border border-[#e8e3d9] dark:border-slate-800/80 bg-[#fdfcfa]/90 dark:bg-slate-900/60 backdrop-blur-md shadow-md rounded-[32px] overflow-hidden hover:scale-[1.005] hover:shadow-lg transition-all duration-300">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col lg:flex-row">
                                                {/* Left Accent Color bar */}
                                                <div className="lg:w-1.5 bg-gradient-to-b from-primary via-[#FF8243] to-orange-400"></div>

                                                {/* Main Content Area */}
                                                <div className="flex-1 p-6 sm:p-8">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                                        <div className="flex items-center gap-3.5">
                                                            <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                                                <Package className="h-6 w-6 text-primary" />
                                                            </div>
                                                            <div>
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="font-bold tracking-tight font-display text-lg text-slate-900 dark:text-white leading-tight">{booking.service_type}</span>
                                                                    <Badge className={`border ${getStatusColor(getTelemetryStatus(booking))} px-2.5 py-0.5 rounded-lg flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider`}>
                                                                        {getStatusIcon(getTelemetryStatus(booking))}
                                                                        {getTelemetryStatus(booking).replace('_', ' ')}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-[10px] text-primary font-bold mt-1.5 tracking-wider uppercase font-mono">Ref Name: {booking.booking_reference}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Cost Box */}
                                                        <div className="bg-[#faf8f5] dark:bg-slate-950 px-5 py-3 rounded-2xl border border-border/40 text-left sm:text-right min-w-[140px]">
                                                            <p className="text-[9px] text-slate-450 dark:text-slate-500 uppercase tracking-widest font-bold">Estimated Cost</p>
                                                            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-450">
                                                                ₹{computedCost.toLocaleString("en-IN")}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-y border-[#e8e3d9]/60 dark:border-slate-800/60">
                                                        <div className="bg-[#faf8f5] dark:bg-slate-950 rounded-xl p-3.5 border border-border/30 space-y-1">
                                                            <p className="text-[9px] uppercase tracking-widest text-slate-450 dark:text-slate-550 font-bold">Schedule Date</p>
                                                            <div className="flex items-center gap-2 text-slate-750 dark:text-slate-300">
                                                                <Calendar className="h-4 w-4 text-primary shrink-0" />
                                                                <span className="text-xs font-semibold">{new Date(booking.scheduled_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                                                            </div>
                                                        </div>
                                                        <div className="bg-[#faf8f5] dark:bg-slate-950 rounded-xl p-3.5 border border-border/30 space-y-1">
                                                            <p className="text-[9px] uppercase tracking-widest text-slate-450 dark:text-slate-550 font-bold">Start Time</p>
                                                            <div className="flex items-center gap-2 text-slate-750 dark:text-slate-300">
                                                                <Clock className="h-4 w-4 text-primary shrink-0" />
                                                                <span className="text-xs font-semibold">{booking.is_service ? booking.scheduled_at.split('@')[1] || booking.scheduled_at : new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>
                                                        </div>
                                                        <div className="bg-[#faf8f5] dark:bg-slate-950 rounded-xl p-3.5 border border-border/30 space-y-1">
                                                            <p className="text-[9px] uppercase tracking-widest text-slate-450 dark:text-slate-550 font-bold">{booking.is_service ? 'Operator' : 'Assigned Pilot'}</p>
                                                            <div className="flex items-center gap-2 text-slate-750 dark:text-slate-300">
                                                                <div className="h-6 w-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary uppercase shrink-0">
                                                                    {(booking.pilot?.full_name || 'O').charAt(0)}
                                                                </div>
                                                                <span className="text-xs font-semibold truncate max-w-[120px]">{booking.pilot?.full_name || 'Assigned Operator'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="bg-[#faf8f5] dark:bg-slate-950 rounded-xl p-3.5 border border-border/30 space-y-1">
                                                            <p className="text-[9px] uppercase tracking-widest text-slate-450 dark:text-slate-550 font-bold">Security OTP Code</p>
                                                            <div className="flex items-center gap-2">
                                                                {!booking.is_service ? (
                                                                    <Badge className="bg-amber-50 dark:bg-amber-955/20 text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-amber-955/30 font-mono text-xs tracking-widest px-2.5 py-0.5 rounded-lg font-bold">
                                                                        {booking.otp_code || '****'}
                                                                    </Badge>
                                                                ) : getTelemetryStatus(booking) === 'ON_SITE' ? (
                                                                    <Badge className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-950/30 font-mono text-xs tracking-widest px-2.5 py-0.5 rounded-lg font-bold">
                                                                        {booking.otp_code || '****'}
                                                                    </Badge>
                                                                ) : ['VERIFIED', 'IN_PROGRESS', 'COMPLETED', 'DONE'].includes(getTelemetryStatus(booking)) ? (
                                                                    <Badge className="bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-600 dark:text-emerald-500 border border-emerald-100 dark:border-emerald-950/20 text-[10px] font-bold px-2.5 py-0.5 rounded-lg">
                                                                        ✓ Verified
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge className="bg-slate-100 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border border-[#e8e3d9] dark:border-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-lg">
                                                                        ⏳ Pending Arrival
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                                                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-450 text-xs font-semibold">
                                                            <MapPin className="h-4 w-4 text-primary shrink-0" />
                                                            <span>Operational launch coordinates active</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Button 
                                                                variant="ghost" 
                                                                onClick={() => toggleOrderTracker(booking.id)}
                                                                className={`rounded-full transition-all font-bold text-xs h-10 px-4 cursor-pointer ${
                                                                    expandedOrders[booking.id] 
                                                                        ? "text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30" 
                                                                        : "text-primary hover:text-primary/90 bg-primary/10 border border-primary/20"
                                                                }`}
                                                            >
                                                                {expandedOrders[booking.id] ? "Close Steps" : "Track Steps"}
                                                            </Button>
                                                            <Button className="bg-slate-900 hover:bg-primary text-white dark:bg-slate-800 dark:hover:bg-slate-750 rounded-xl flex items-center gap-2 px-5 h-10 text-xs font-bold transition-all shadow-sm border-0 cursor-pointer" asChild>
                                                                <Link href={`/track/${booking.id}`}>
                                                                    Tracking Hub
                                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {/* Stepper tracker panel */}
                                                    {expandedOrders[booking.id] && (
                                                        <div className="mt-6">
                                                            <OrderLiveTracker 
                                                                bookingReference={booking.id} 
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
    const isCancelledOrDeclined = normalizedStatus === 'CANCELLED' || normalizedStatus === 'DECLINED' || normalizedStatus === 'REJECTED'

    return (
        <div className="border border-[#e8e3d9] dark:border-slate-800 bg-[#fdfcfa] dark:bg-slate-900/60 backdrop-blur-md p-6 sm:p-8 rounded-3xl space-y-6 mt-5 shadow-sm text-left">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-[10px] font-bold text-slate-550 dark:text-slate-400 flex items-center gap-2 uppercase tracking-widest font-sans">
                    {isCancelledOrDeclined ? (
                        <>
                            <span className="flex h-2 w-2 relative">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>
                            Mission Terminated
                        </>
                    ) : (
                        <>
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Live Telemetry Feed
                        </>
                    )}
                </h4>
                {loading ? (
                    <span className="text-[9px] text-slate-450 flex items-center gap-1.5 font-bold uppercase tracking-wider">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                        Syncing...
                    </span>
                ) : isCancelledOrDeclined ? (
                    <span className="text-[9px] text-rose-600 dark:text-rose-450 font-bold bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-950/30 px-2.5 py-0.5 rounded-lg flex items-center gap-1 uppercase">
                        ● Cancelled
                    </span>
                ) : (
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-450 font-bold bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-950/30 px-2.5 py-0.5 rounded-lg flex items-center gap-1 uppercase">
                        ● Re-establishing Stream
                    </span>
                )}
            </div>

            {/* Flight Details Grid */}
            {details && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#faf8f5] dark:bg-slate-950 border border-border/40">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                            <UserCheck className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 block uppercase tracking-widest">Pilot</span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">{details.pilotName || "Assigned Operator"}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-450 block font-medium mt-0.5">{details.pilotPhone || "+91 99999 99999"}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-emerald-650 dark:text-emerald-450 flex-shrink-0">
                            <IndianRupee className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-555 block uppercase tracking-widest">Charges</span>
                            <span className="text-xs font-bold text-emerald-705 dark:text-emerald-400">
                                ₹{(details.totalAmount || details.estimatedAmount || 3000).toLocaleString("en-IN")}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#faf8f5] dark:bg-slate-900 border border-border/40 flex items-center justify-center text-slate-650 dark:text-slate-350 flex-shrink-0">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-[9px] font-bold text-slate-450 dark:text-slate-550 block uppercase tracking-widest">Scheduled</span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                                {new Date(details.scheduledAt || details.scheduled_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-450 block font-medium mt-0.5">
                                {new Date(details.scheduledAt || details.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                            <Compass className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 block uppercase tracking-widest">Mission</span>
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">{details.serviceType || details.service_type || "Aero Operations"}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Stepper tracker */}
            {isCancelledOrDeclined ? (
                <div className="bg-rose-50/50 dark:bg-rose-955/10 border border-rose-200 dark:border-rose-900/30 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-650 dark:text-rose-400 flex items-center justify-center flex-shrink-0 animate-pulse">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                        <h5 className="font-bold text-sm text-rose-900 dark:text-rose-250 uppercase tracking-widest font-sans">Mission Booking Declined / Cancelled</h5>
                        <p className="text-xs text-rose-700 dark:text-rose-400 font-medium mt-1 leading-relaxed">
                            This mission ticket has been cancelled or rejected by the provider. Please explore other available crews or contact dispatch support.
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
                                            ? 'bg-emerald-500' 
                                            : 'bg-slate-200 dark:bg-slate-800'
                                    }`} />
                                )}

                                <div className="flex items-start md:flex-col md:items-center gap-4 text-left md:text-center">
                                    {/* Bubble indicator */}
                                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 relative z-10 ${
                                        isCompleted 
                                            ? 'bg-emerald-500 text-white shadow-sm' 
                                            : isCurrent
                                            ? 'bg-primary text-white ring-4 ring-primary/10 border border-primary/20 shadow-sm animate-pulse'
                                            : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-655 border border-slate-205 dark:border-slate-800'
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
                                            isCompleted ? 'text-slate-800 dark:text-slate-250' : isCurrent ? 'text-primary' : 'text-slate-400 dark:text-slate-600'
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
