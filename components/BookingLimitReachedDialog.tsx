'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react"

interface BookingLimitReachedDialogProps {
    isOpen: boolean
    onClose: () => void
    maxBookings: number
    existingBookings?: Array<{
        booking_reference: string
        drone_pilots?: {
            full_name: string
        }
    }>
}

export function BookingLimitReachedDialog({
    isOpen,
    onClose,
    maxBookings,
    existingBookings = []
}: BookingLimitReachedDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-xl text-red-600">
                        <AlertTriangle className="h-6 w-6" />
                        Booking Limit Reached
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-4 pt-2">
                            <p className="text-base text-foreground">
                                You have already booked the maximum of <strong className="text-red-600">{maxBookings} drone pilots</strong>.
                            </p>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm font-medium text-red-800 mb-2">
                                    Your current bookings:
                                </p>
                                <ul className="space-y-2">
                                    {existingBookings.map((booking, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-sm text-red-700">
                                            <span className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center text-xs font-bold">
                                                {idx + 1}
                                            </span>
                                            <span>
                                                {booking.drone_pilots?.full_name || 'Pilot'} - {booking.booking_reference}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                Please wait for your existing bookings to be completed before booking new pilots.
                            </p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={onClose}>
                        Understood
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
