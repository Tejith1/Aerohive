'use client'

import React, { useState, useEffect } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Loader2, MapPin, Calendar, Clock, Sparkles, User, Mail, ShieldAlert } from 'lucide-react'

interface BookingConfirmDialogProps {
    isOpen: boolean
    onConfirm: (details: {
        location: string
        scheduledAt: string
        durationHours: number
        totalAmount: number
        lat?: number
        lng?: number
        userName: string
        userEmail: string
    }) => void
    onCancel: () => void
    pilotName?: string
    pilotHourlyRate?: number
    currentUser?: any
}

const getDefaultScheduledTime = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(10, 0, 0, 0)
    
    const year = tomorrow.getFullYear()
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const day = String(tomorrow.getDate()).padStart(2, '0')
    const hours = String(tomorrow.getHours()).padStart(2, '0')
    const minutes = String(tomorrow.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function BookingConfirmDialog({
    isOpen,
    onConfirm,
    onCancel,
    pilotName,
    pilotHourlyRate = 1500,
    currentUser
}: BookingConfirmDialogProps) {
    const [userName, setUserName] = useState('')
    const [userEmail, setUserEmail] = useState('')
    const [location, setLocation] = useState('')
    const [lat, setLat] = useState<number | undefined>(undefined)
    const [lng, setLng] = useState<number | undefined>(undefined)
    const [scheduledAt, setScheduledAt] = useState('')
    const [durationHours, setDurationHours] = useState(2)
    const [isDetectingLocation, setIsDetectingLocation] = useState(false)
    const [error, setError] = useState('')

    // Reset fields on open and pre-fill details from currentUser
    useEffect(() => {
        if (isOpen) {
            setLocation('')
            setLat(undefined)
            setLng(undefined)
            setScheduledAt(getDefaultScheduledTime())
            setDurationHours(2)
            setError('')

            const defaultName = currentUser?.first_name 
                ? `${currentUser.first_name} ${currentUser.last_name || ''}`.trim()
                : currentUser?.email?.split('@')[0] || ''
            const defaultEmail = currentUser?.email || ''

            setUserName(defaultName)
            setUserEmail(defaultEmail)
        }
    }, [isOpen, currentUser])

    const hourlyRate = Number(pilotHourlyRate) || 1500
    const totalAmount = durationHours * hourlyRate

    const handleAutoDetectLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.")
            return
        }

        setIsDetectingLocation(true)
        setError('')

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                setLat(latitude)
                setLng(longitude)

                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                    const data = await res.json()
                    if (data.display_name) {
                        const addressParts = data.address || {}
                        const shortAddress = [
                            addressParts.suburb || addressParts.neighbourhood || addressParts.road,
                            addressParts.city || addressParts.town || addressParts.village,
                            addressParts.state
                        ].filter(Boolean).join(', ')
                        
                        setLocation(shortAddress || data.display_name)
                    } else {
                        setLocation(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`)
                    }
                } catch (e) {
                    console.error("Geocoding error:", e)
                    setLocation(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`)
                } finally {
                    setIsDetectingLocation(false)
                }
            },
            (err) => {
                console.error("Geolocation error:", err)
                setError("Unable to retrieve location. Please type manually.")
                setIsDetectingLocation(false)
            },
            { enableHighAccuracy: true, timeout: 8000 }
        )
    }

    const handleSubmit = (e: React.MouseEvent) => {
        e.preventDefault()
        if (!userName.trim()) {
            setError("Please specify client name.")
            return
        }
        if (!userEmail.trim() || !userEmail.includes('@')) {
            setError("Please specify a valid client email.")
            return
        }
        if (!location.trim()) {
            setError("Please specify a flight location/address.")
            return
        }
        if (!scheduledAt) {
            setError("Please select a scheduled date and time.")
            return
        }
        if (durationHours < 1 || durationHours > 24) {
            setError("Duration must be between 1 and 24 hours.")
            return
        }

        onConfirm({
            location,
            scheduledAt,
            durationHours,
            totalAmount,
            lat,
            lng,
            userName,
            userEmail
        })
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
            <AlertDialogContent className="max-w-lg bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                <AlertDialogHeader className="space-y-2 border-b border-slate-800 pb-4">
                    <AlertDialogTitle className="flex items-center gap-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                        <Sparkles className="h-5 w-5 text-blue-400" />
                        Complete Pilot Booking
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400 text-sm">
                        Specify details for scheduling your drone operations with {pilotName ? <strong className="text-blue-300">{pilotName}</strong> : "your selected pilot"}.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-4">
                    {error && (
                        <div className="bg-red-950/40 border border-red-800/80 rounded-lg p-3 text-red-300 text-xs flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Section 1: User Account Details (Editable) */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-950/50 border border-slate-800/50 p-3 rounded-lg">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
                                Client Name
                            </label>
                            <div className="relative flex items-center">
                                <User className="absolute left-2.5 h-3.5 w-3.5 text-slate-500" />
                                <input
                                    type="text"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-1.5 pl-8 pr-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
                                    placeholder="Enter your name"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold block">
                                Client Email
                            </label>
                            <div className="relative flex items-center">
                                <Mail className="absolute left-2.5 h-3.5 w-3.5 text-slate-500" />
                                <input
                                    type="email"
                                    value={userEmail}
                                    onChange={(e) => setUserEmail(e.target.value)}
                                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-1.5 pl-8 pr-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition"
                                    placeholder="Enter email address"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Location Detail Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-blue-400" />
                            Flight Location / Address
                        </label>
                        <div className="relative flex gap-2">
                            <input
                                type="text"
                                placeholder="E.g., Madhapur Sector 3, Hyderabad"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                            />
                            <button
                                type="button"
                                onClick={handleAutoDetectLocation}
                                disabled={isDetectingLocation}
                                className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs rounded-lg px-3 py-2 flex items-center gap-1.5 font-medium transition active:scale-95 disabled:opacity-50 shrink-0"
                            >
                                {isDetectingLocation ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Detecting...
                                    </>
                                ) : (
                                    <>
                                        Auto-Detect
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Section 3: Date & Hours Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-blue-400" />
                                Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition [color-scheme:dark]"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-blue-400" />
                                Duration (Hours)
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={24}
                                value={durationHours}
                                onChange={(e) => setDurationHours(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                            />
                        </div>
                    </div>

                    {/* Section 4: Live Money Counter display */}
                    <div className="bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-900/50 rounded-lg p-4 flex items-center justify-between mt-2">
                        <div className="space-y-1">
                            <p className="text-xs text-blue-300 font-semibold uppercase tracking-wider">
                                Dynamic Cost Estimation
                            </p>
                            <p className="text-[10px] text-slate-400">
                                Calculated at ₹{hourlyRate.toLocaleString()}/hour for {durationHours} hour{durationHours > 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                                ₹{totalAmount.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <AlertDialogFooter className="border-t border-slate-800 pt-4 mt-2 gap-2 sm:gap-0">
                    <AlertDialogCancel
                        onClick={onCancel}
                        className="bg-transparent hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleSubmit}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20 transition active:scale-95"
                    >
                        ✓ Request Secure Booking
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
