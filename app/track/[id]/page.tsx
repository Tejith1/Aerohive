'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Loader2, Calendar, Clock, Phone, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Dynamically import Map to avoid SSR issues with Leaflet
const MissionMap = dynamic(() => import('@/components/MissionMap'), {
    ssr: false,
    loading: () => <div className="h-64 bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Loading Map...</div>
})

export default function TrackingPage() {
    const params = useParams()
    const id = params?.id as string
    const [job, setJob] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        if (id) {
            fetchJobDetails()
            // Poll for updates every 5 seconds for a "clean" live experience
            const interval = setInterval(fetchJobDetails, 5000)
            return () => clearInterval(interval)
        }
    }, [id])

    const fetchJobDetails = async () => {
        try {
            const res = await fetch(`/api/jobs/details?uuid=${id}`)
            if (!res.ok) {
                if (res.status === 404) throw new Error('Tracking link invalid or expired')
                throw new Error('Failed to load tracking details')
            }
            const data = await res.json()
            setJob(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

    if (error) return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-2">Tracking Unavailable</h1>
                <p className="text-gray-600">{error}</p>
            </div>
        </div>
    )

    if (!job) return null

    // Parse locations
    const clientLoc = { lat: job.lat || 0, lng: job.lng || 0 }

    // Use pilot location if available, otherwise default to client location (or slight offset?)
    // If not active, map might look weird if both are same.
    // If pilotLocation is returned (active), use it.
    // Else check if we have a "base" location or just hide map?
    // We'll show map always as "Site Location".
    let pilotLoc = clientLoc

    if (job.pilotLocation) {
        // format might be { type: 'Point', coordinates: [lng, lat] } (GeoJSON) or object
        // Supabase often returns GeoJSON object for geography column
        if (job.pilotLocation.coordinates) {
            pilotLoc = {
                lat: job.pilotLocation.coordinates[1],
                lng: job.pilotLocation.coordinates[0]
            }
        } else if (typeof job.pilotLocation === 'string') {
            // Try to parse if string
            try {
                const parsed = JSON.parse(job.pilotLocation)
                if (parsed.coordinates) {
                    pilotLoc = { lat: parsed.coordinates[1], lng: parsed.coordinates[0] }
                }
            } catch (e) { }
        }
    }

    const isActive = job.status === 'IN_PROGRESS'

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">AeroHive Tracking</h1>
                        <p className="text-xs text-slate-500">Order #{job.id || 'Unknown'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {isActive && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100 animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                <span className="text-[10px] font-bold uppercase tracking-wider">Live Sync</span>
                            </div>
                        )}
                        <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-600 hover:bg-green-700" : ""}>
                            {job.status}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

                {/* Map Section */}
                <div className="h-[400px] rounded-xl overflow-hidden shadow-lg border bg-white relative">
                    {clientLoc.lat !== 0 ? (
                        <MissionMap
                            bookingId={job.id}
                            clientLocation={clientLoc}
                            pilotLocation={pilotLoc}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400">
                            Location data unavailable
                        </div>
                    )}

                    {!isActive && (
                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-[1px] z-[1000]">
                            <div className="bg-white px-6 py-4 rounded-lg shadow-xl text-center">
                                <p className="font-bold text-slate-800">Tracking Not Active</p>
                                <p className="text-sm text-slate-600">Pilot has not started the mission yet.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Details Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Mission Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Schedule</p>
                                    <p className="text-sm text-slate-600">
                                        {new Date(job.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Location</p>
                                    <p className="text-sm text-slate-600 max-w-[200px] truncate">
                                        Lat: {job.lat}, Lng: {job.lng}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Pilot Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-xl">
                                    👨‍✈️
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{job.pilotName || 'Assigning...'}</p>
                                    <p className="text-xs text-slate-500">Certified AeroHive Pilot</p>
                                </div>
                            </div>

                            {job.pilotPhone && (
                                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded">
                                    <Phone className="w-4 h-4" />
                                    <span>{job.pilotPhone}</span>
                                </div>
                            )}

                            <div className="bg-amber-50 border border-amber-100 p-3 rounded-md text-center">
                                <p className="text-xs text-amber-800 uppercase font-bold mb-1">Security OTP</p>
                                <p className="text-2xl font-mono font-bold text-amber-600 tracking-widest">{job.otp}</p>
                                <p className="text-[10px] text-amber-700 mt-1">Share with pilot upon arrival</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
