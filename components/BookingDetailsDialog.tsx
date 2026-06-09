'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Phone, Mail, MapPin, Calendar, Shield, Copy, Check, Star, CheckCircle2, User } from "lucide-react"
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
            <DialogContent className="max-w-md bg-[#fbf9f6] dark:bg-slate-900 border border-[#e8e3d9] dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-[32px] shadow-2xl p-6">
                <DialogHeader className="space-y-2 border-b border-[#e8e3d9]/60 dark:border-slate-800/60 pb-4 text-left">
                    <DialogTitle className="flex items-center gap-2.5 text-2xl font-serif font-normal text-slate-900 dark:text-slate-100">
                        <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                        Booking Confirmed!
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400 font-serif italic text-[15px]">
                        Your drone pilot has been booked successfully.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4 text-left">
                    {/* Booking Reference */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/15 dark:to-primary/5 rounded-2xl p-4 border border-primary/20 dark:border-primary/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans font-bold">Booking Reference</p>
                                <p className="text-2xl font-bold text-primary font-sans">{booking.bookingId}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans font-bold">Security OTP</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-450 font-sans">{booking.otp}</p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCopyOtp}
                                        className="h-8 w-8 p-0 hover:bg-primary/10 rounded-lg text-slate-500 hover:text-primary"
                                    >
                                        {copiedOtp ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pilot Info */}
                    <div className="bg-[#fdfcfa] dark:bg-slate-950 rounded-2xl p-4 border border-[#e8e3d9] dark:border-slate-800/80">
                        <div className="flex items-center gap-3.5 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary shrink-0 shadow-inner">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-serif font-normal text-lg text-slate-900 dark:text-slate-100">{booking.pilot.full_name}</p>
                                <div className="flex items-center gap-1.5 text-xs text-primary font-sans font-semibold">
                                    <Star className="h-3.5 w-3.5 fill-[#FF8243] text-[#FF8243]" />
                                    <span>{booking.pilot.rating || 4.9} Rating</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-3 border-t border-[#e8e3d9]/60 dark:border-slate-800/60">
                            {booking.pilot.phone && (
                                <a
                                    href={`tel:+91${booking.pilot.phone}`}
                                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 transition-colors font-sans text-sm font-medium"
                                >
                                    <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-450" />
                                    <span>+91-{booking.pilot.phone}</span>
                                </a>
                            )}
                            {booking.pilot.email && (
                                <a
                                    href={`mailto:${booking.pilot.email}`}
                                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 transition-colors font-sans text-sm font-medium"
                                >
                                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-450" />
                                    <span>{booking.pilot.email}</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-2.5 text-sm px-1">
                        <div className="flex items-center gap-3 text-slate-650 dark:text-slate-400 font-sans">
                            <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                            <span>{booking.location}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-650 dark:text-slate-400 font-sans">
                            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                            <span>{booking.scheduledAt}</span>
                        </div>
                    </div>

                    {/* OTP Warning */}
                    <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 rounded-2xl p-4 flex items-start gap-3">
                        <Shield className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                        <div className="text-xs text-amber-800 dark:text-amber-300 font-sans space-y-1">
                            <p className="font-bold uppercase tracking-wider text-[10px]">Security Protocol</p>
                            <p className="leading-relaxed">Provide the security verification OTP to the operator only when they arrive at the launch coordinate location.</p>
                        </div>
                    </div>
                </div>

                <div className="flex pt-2">
                    <Button onClick={onClose} className="flex-1 bg-slate-900 hover:bg-primary text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 rounded-full font-sans text-xs font-semibold uppercase tracking-wider py-5 shadow-md hover:scale-[1.01] transition-all cursor-pointer">
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
