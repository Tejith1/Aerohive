'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Phone, Mail, MapPin, Calendar, Shield, Copy, Check, Star, CheckCircle2, User, Landmark, Layers } from "lucide-react"
import { useState } from "react"

interface ProviderDetails {
    id: string
    companyName: string
    phone?: string
    email?: string
    rating?: number
    location?: string
}

interface ServiceBookingDetails {
    bookingId: string
    serviceType: string
    location: string
    scheduledAt: string
    landscapeSize: string
    estimatedCost: number
    provider: ProviderDetails
}

interface ServiceBookingDetailsDialogProps {
    isOpen: boolean
    onClose: () => void
    booking: ServiceBookingDetails | null
}

export function ServiceBookingDetailsDialog({
    isOpen,
    onClose,
    booking
}: ServiceBookingDetailsDialogProps) {
    const [copiedId, setCopiedId] = useState(false)

    if (!booking) return null

    const handleCopyId = () => {
        navigator.clipboard.writeText(booking.bookingId)
        setCopiedId(true)
        setTimeout(() => setCopiedId(false), 2000)
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md bg-background border border-border text-foreground rounded-2xl shadow-2xl p-6">
                <DialogHeader className="space-y-2 border-b border-border pb-4 text-left">
                    <DialogTitle className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground animate-fade-in-scale">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-500 shrink-0" />
                        Service Requested!
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm">
                        Your booking request has been submitted to the provider.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5 py-4 text-left">
                    {/* Booking Reference & Cost */}
                    <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans font-bold">Booking ID</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <p className="text-sm font-bold text-primary font-mono truncate max-w-[160px]">{booking.bookingId}</p>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCopyId}
                                        className="h-6 w-6 p-0 hover:bg-primary/10 rounded text-muted-foreground hover:text-primary"
                                    >
                                        {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                                    </Button>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-sans font-bold">Est. Cost</p>
                                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-500 font-sans mt-0.5">₹{booking.estimatedCost.toLocaleString('en-IN')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Provider Info */}
                    <div className="bg-muted/30 rounded-xl p-4 border border-border">
                        <div className="flex items-center gap-3.5 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold text-base text-foreground">{booking.provider.companyName}</p>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                                    <span>{booking.provider.rating || 5.0} Rating</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 pt-3 border-t border-border">
                            {booking.provider.phone && (
                                <a
                                    href={`tel:+91${booking.provider.phone}`}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-background text-sm text-foreground transition-colors font-medium"
                                >
                                    <Phone className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                                    <span>+91-{booking.provider.phone}</span>
                                </a>
                            )}
                            {booking.provider.email && (
                                <a
                                    href={`mailto:${booking.provider.email}`}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-background text-sm text-foreground transition-colors font-medium"
                                >
                                    <Mail className="h-4 w-4 text-primary" />
                                    <span>{booking.provider.email}</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-3 text-sm px-1 bg-muted/20 p-3 rounded-xl border border-border/50">
                        <div className="flex items-center gap-3 text-muted-foreground font-sans">
                            <Layers className="h-4 w-4 shrink-0 text-muted-foreground/75" />
                            <span className="font-semibold text-foreground">{booking.serviceType}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground font-sans">
                            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground/75" />
                            <span>{booking.location}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground font-sans">
                            <Calendar className="h-4 w-4 shrink-0 text-muted-foreground/75" />
                            <span>{booking.scheduledAt}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground font-sans">
                            <Landmark className="h-4 w-4 shrink-0 text-muted-foreground/75" />
                            <span>Landscape size: {booking.landscapeSize}</span>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                        <Shield className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 shrink-0" />
                        <div className="text-xs text-amber-800 dark:text-amber-300 space-y-1">
                            <p className="font-bold uppercase tracking-wider text-[10px]">OTP Protocol</p>
                            <p className="leading-relaxed">Security verification OTP is generated once the operator accepts and reaches your site. You will find it in your active operations hub.</p>
                        </div>
                    </div>
                </div>

                <div className="flex pt-2">
                    <Button onClick={onClose} className="flex-1 bg-foreground hover:bg-primary text-background hover:text-primary-foreground rounded-lg py-5 shadow-sm transition-all cursor-pointer border-0">
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
