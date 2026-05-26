'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { getUserBookings, Booking } from '@/lib/supabase'
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
    RefreshCw
} from 'lucide-react'
import Link from 'next/link'

export default function OrdersPage() {
    const { user, isAuthenticated } = useAuth()
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

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
        } catch (error) {
            console.error('Error fetching bookings:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'bg-green-100 text-green-700 border-green-200'
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
            default: return 'bg-blue-100 text-blue-700 border-blue-200'
        }
    }

    const getStatusIcon = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return <CheckCircle2 className="h-4 w-4" />
            case 'pending': return <Clock4 className="h-4 w-4" />
            default: return <Package className="h-4 w-4" />
        }
    }

    if (!user && !isAuthenticated && !loading) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center container mx-auto px-4">
                <Card className="max-w-md w-full p-8 text-center border-0 shadow-2xl rounded-3xl">
                    <div className="h-20 w-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Package className="h-10 w-10 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">View Your Orders</h2>
                    <p className="text-gray-500 mb-8">Please sign in to track your drone missions and manage your bookings.</p>
                    <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl">
                        <Link href="/login">Sign In Now</Link>
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                        <p className="text-gray-500">Track & Manage</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={fetchBookings}
                            className="rounded-xl border-gray-200 hover:bg-white hover:border-blue-400 transition-all gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6">
                            <Link href="/drone-services">New Mission</Link>
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                        <p className="text-gray-500 font-medium">Retrieving mission data...</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <Card className="border-2 border-dashed border-gray-200 bg-transparent text-center p-16 rounded-[40px]">
                        <div className="h-24 w-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                            <Search className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No missions found</h3>
                        <p className="text-gray-500 mb-8 max-w-xs mx-auto">You haven't booked any drone missions yet. Start your first mission today!</p>
                        <Button asChild className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8 h-12">
                            <Link href="/drone-services">Explore Services</Link>
                        </Button>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {bookings.map((booking) => (
                            <Card key={booking.id} className="group border-0 shadow-sm border border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl hover:border-blue-100 transition-all duration-300">
                                <CardContent className="p-0">
                                    <div className="flex flex-col lg:flex-row">
                                        {/* Status Sidebar */}
                                        <div className="lg:w-1 bg-blue-600"></div>

                                        {/* Main Content Area */}
                                        <div className="flex-1 p-6 sm:p-8">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                                                        <Package className="h-6 w-6 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-lg text-gray-900">{booking.service_type}</span>
                                                            <Badge className={`border ${getStatusColor(booking.status)} px-2.5 py-0.5 rounded-full flex items-center gap-1.5 font-medium`}>
                                                                {getStatusIcon(booking.status)}
                                                                {booking.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm font-mono text-blue-600 font-medium mt-1">Ref: {booking.booking_reference}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                                                    <p className="text-xl font-bold text-gray-900">₹{booking.total_amount?.toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-y border-gray-50">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Scheduled Date</p>
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Calendar className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm font-semibold">{new Date(booking.scheduled_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Time Slot</p>
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <Clock className="h-4 w-4 text-gray-400" />
                                                        <span className="text-sm font-semibold">{new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Pilot Details</p>
                                                    <div className="flex items-center gap-2 text-gray-700">
                                                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 uppercase">
                                                            {booking.pilot?.full_name[0]}
                                                        </div>
                                                        <span className="text-sm font-semibold">{booking.pilot?.full_name || 'Assigned Pilot'}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Security Access</p>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className="bg-gray-100 text-gray-900 font-mono text-sm tracking-widest px-3 py-1 rounded-lg">
                                                            {booking.otp_code || '****'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>Mission Area Verified</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl" asChild>
                                                        <Link href={`/orders/${booking.id}`}>
                                                            Manage Mission
                                                        </Link>
                                                    </Button>
                                                    <Button className="bg-gray-900 hover:bg-black text-white rounded-xl flex items-center gap-2 px-6">
                                                        Tracking Hub
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
