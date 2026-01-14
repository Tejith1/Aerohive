'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Phone, Mail, MapPin, Calendar, Shield, Copy, Check } from "lucide-react"
import { useState } from "react"

interface PilotDetails {
    id: string
    full_name: string
    phone?: string
    email?: string
    rating?: number
}

interface BookingDetails {
    bookingId: string
    otp: string
    serviceType: string
    location: string
    scheduledAt: string
    pilot: PilotDetails
}

interface BookingDetailsDialogProps {
    isOpen: boolean
    onClose: () => void
    booking: BookingDetails | null
}

export function BookingDetailsDialog({
    isOpen,
    onClose,
    booking
}: BookingDetailsDialogProps) {
    const [copiedOtp, setCopiedOtp] = useState(false)

    if (!booking) return null

    const handleCopyOtp = () => {
        navigator.clipboard.writeText(booking.otp)
        setCopiedOtp(true)
        setTimeout(() => setCopiedOtp(false), 2000)
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <span className="text-2xl">🎉</span> Booking Confirmed!
                    </DialogTitle>
                    <DialogDescription>
                        Your drone pilot has been booked successfully.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Booking Reference */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 border border-primary/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Booking Reference</p>
                                <p className="text-2xl font-bold text-primary">{booking.bookingId}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground uppercase tracking-wide">Security OTP</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold text-green-600">{booking.otp}</p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCopyOtp}
                                        className="h-8 w-8 p-0"
                                    >
                                        {copiedOtp ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pilot Info */}
                    <div className="bg-slate-50 rounded-xl p-4 border">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                                👨‍✈️
                            </div>
                            <div>
                                <p className="font-semibold text-lg">{booking.pilot.full_name}</p>
                                <div className="flex items-center gap-1 text-sm text-amber-600">
                                    <span>⭐</span>
                                    <span>{booking.pilot.rating || 4.9} Rating</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-2 border-t">
                            {booking.pilot.phone && (
                                <a
                                    href={`tel:+91${booking.pilot.phone}`}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors"
                                >
                                    <Phone className="h-4 w-4 text-green-600" />
                                    <span className="text-sm">+91-{booking.pilot.phone}</span>
                                </a>
                            )}
                            {booking.pilot.email && (
                                <a
                                    href={`mailto:${booking.pilot.email}`}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors"
                                >
                                    <Mail className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm">{booking.pilot.email}</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{booking.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{booking.scheduledAt}</span>
                        </div>
                    </div>

                    {/* OTP Warning */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                        <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div className="text-sm text-amber-800">
                            <p className="font-medium">Security Note</p>
                            <p className="text-amber-700">Share the OTP with the pilot only when they arrive at your location.</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button onClick={onClose} className="flex-1">
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
