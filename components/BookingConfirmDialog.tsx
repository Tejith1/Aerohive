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
import { Loader2, MapPin, Calendar, Clock, ShieldCheck, User, Mail, ShieldAlert, Phone } from 'lucide-react'

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
        userPhone: string
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
    const [userPhone, setUserPhone] = useState('')
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
            const defaultPhone = currentUser?.phone || ''

            setUserName(defaultName)
            setUserEmail(defaultEmail)
            setUserPhone(defaultPhone)
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
        if (!userPhone.trim()) {
            setError("Please specify a client phone number.")
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
            userEmail,
            userPhone
        })
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
            <AlertDialogContent className="max-w-xl bg-background border border-border text-foreground rounded-2xl shadow-2xl p-8 max-h-[95vh] overflow-y-auto">
                <AlertDialogHeader className="space-y-3 border-b border-border pb-6 text-left">
                    <AlertDialogTitle className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        Complete Pilot Booking
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed">
                        Specify details for scheduling your drone operations with {pilotName ? <strong className="text-foreground font-semibold">{pilotName}</strong> : "your selected pilot"}.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-5 py-5 text-left">
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive text-xs flex items-center gap-2 font-sans font-medium">
                            <ShieldAlert className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Section 1: User Account Details (Editable) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/40 border border-border p-4 rounded-xl">
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold font-sans block">
                                Client Name
                           </label>
                           <div className="relative flex items-center">
                               <User className="absolute left-3 h-4 w-4 text-muted-foreground" />
                               <input
                                   type="text"
                                   value={userName}
                                   onChange={(e) => setUserName(e.target.value)}
                                   className="w-full bg-background border border-border rounded-lg py-2 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                                   placeholder="Your name"
                                   style={{ paddingLeft: '2.2rem' }}
                               />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold font-sans block">
                                Client Email
                           </label>
                           <div className="relative flex items-center">
                               <Mail className="absolute left-3 h-4 w-4 text-muted-foreground" />
                               <input
                                   type="email"
                                   value={userEmail}
                                   onChange={(e) => setUserEmail(e.target.value)}
                                   className="w-full bg-background border border-border rounded-lg py-2 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                                   placeholder="Email address"
                                   style={{ paddingLeft: '2.2rem' }}
                               />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold font-sans block">
                                Client Phone
                           </label>
                           <div className="relative flex items-center">
                               <Phone className="absolute left-3 h-4 w-4 text-muted-foreground" />
                               <input
                                   type="tel"
                                   value={userPhone}
                                   onChange={(e) => setUserPhone(e.target.value)}
                                   className="w-full bg-background border border-border rounded-lg py-2 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                                   placeholder="Phone number"
                                   style={{ paddingLeft: '2.2rem' }}
                               />
                           </div>
                        </div>
                    </div>

                    {/* Section 2: Location Detail Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 font-sans">
                            <MapPin className="h-4 w-4 text-primary" />
                            Flight Location / Address
                        </label>
                        <div className="relative flex gap-2">
                            <input
                                type="text"
                                placeholder="E.g., Madhapur Sector 3, Hyderabad"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg py-2.5 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                            />
                            <button
                                type="button"
                                onClick={handleAutoDetectLocation}
                                disabled={isDetectingLocation}
                                className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/25 text-xs rounded-lg px-4 py-2 flex items-center gap-1.5 font-bold tracking-wider uppercase font-sans transition active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
                            >
                                {isDetectingLocation ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Detecting...
                                    </>
                                ) : (
                                    "Auto-Detect"
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Section 3: Date & Hours Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 font-sans">
                                <Calendar className="h-4 w-4 text-primary" />
                                Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                                className="w-full bg-background border border-border rounded-lg py-2 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 font-sans">
                                <Clock className="h-4 w-4 text-primary" />
                                Duration (Hours)
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={24}
                                value={durationHours}
                                onChange={(e) => setDurationHours(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full bg-background border border-border rounded-lg py-2 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
                            />
                        </div>
                    </div>

                    {/* Section 4: Live Money Counter display */}
                    <div className="bg-muted/30 border border-border rounded-xl p-5 flex items-center justify-between mt-2 shadow-sm">
                        <div className="space-y-1">
                            <p className="text-xs text-primary font-bold uppercase tracking-widest font-sans">
                                Dynamic Cost Estimation
                            </p>
                            <p className="text-[11px] text-muted-foreground font-sans">
                                Calculated at ₹{hourlyRate.toLocaleString()}/hour for {durationHours} hour{durationHours > 1 ? 's' : ''}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-500 font-sans">
                                ₹{totalAmount.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <AlertDialogFooter className="border-t border-border pt-5 mt-2 gap-3 sm:gap-0 justify-end flex items-center">
                    <AlertDialogCancel
                        onClick={onCancel}
                        className="bg-transparent hover:bg-muted border border-border text-muted-foreground hover:text-foreground rounded-lg px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleSubmit}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-5 py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] border-0 cursor-pointer"
                    >
                        ✓ Request Secure Booking
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
