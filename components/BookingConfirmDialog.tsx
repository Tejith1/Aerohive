'use client'

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

interface BookingConfirmDialogProps {
    isOpen: boolean
    onConfirm: () => void
    onCancel: () => void
    currentBookings: number
    maxBookings: number
    pilotName?: string
}

export function BookingConfirmDialog({
    isOpen,
    onConfirm,
    onCancel,
    currentBookings,
    maxBookings,
    pilotName
}: BookingConfirmDialogProps) {
    const remainingSlots = maxBookings - currentBookings

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-xl">
                        <span>🚁</span> Confirm Booking
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-3 pt-2">
                            <p className="text-base text-foreground">
                                {pilotName ? (
                                    <>You are about to book <strong className="text-primary">{pilotName}</strong>.</>
                                ) : (
                                    <>You are about to book a drone pilot.</>
                                )}
                            </p>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">⚠️</span>
                                    <div>
                                        <p className="font-semibold text-amber-800">Booking Limit</p>
                                        <p className="text-sm text-amber-700 mt-1">
                                            You can book up to <strong>{maxBookings} drone pilots</strong> at a time.
                                        </p>
                                        <p className="text-sm text-amber-700 mt-1">
                                            Current bookings: <strong>{currentBookings}/{maxBookings}</strong>
                                            {remainingSlots > 0 && (
                                                <span className="ml-2 text-green-600">
                                                    ({remainingSlots} slot{remainingSlots > 1 ? 's' : ''} remaining)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                Do you want to proceed with this booking?
                            </p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-0">
                    <AlertDialogCancel onClick={onCancel} className="mt-0">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-primary hover:bg-primary/90"
                    >
                        ✓ Confirm Booking
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
