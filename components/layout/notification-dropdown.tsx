"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle, ShoppingCart, Trash2, X, Sparkles, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { useNotifications } from "@/contexts/notification-context"
import { useActionNotificationsStore, BookingData } from "@/lib/action-notifications-store"
import { formatDistanceToNow } from "date-fns"
import { BookingDetailsDialog } from "@/components/BookingDetailsDialog"

type TabType = 'activity' | 'all'

export function NotificationDropdown() {
    const { notifications: dbNotifications, unreadCount: dbUnreadCount, markAsRead: markDbAsRead, markAllAsRead: markAllDbAsRead, isLoading } = useNotifications()
    const {
        notifications: actionNotifications,
        markAsRead: markActionAsRead,
        markAllAsRead: markAllActionAsRead,
        clearAll: clearActionNotifications,
        removeNotification: removeActionNotification
    } = useActionNotificationsStore()

    const [activeTab, setActiveTab] = useState<TabType>('activity')
    const [open, setOpen] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null)
    const [showBookingDialog, setShowBookingDialog] = useState(false)

    // Handle clicking on a notification
    const handleNotificationClick = (notification: typeof actionNotifications[0]) => {
        // Mark as read
        if (!notification.isRead) {
            markActionAsRead(notification.id)
        }

        // If it's a booking notification with data, show the dialog
        if (notification.type === 'booking' && notification.bookingData) {
            setSelectedBooking(notification.bookingData)
            setShowBookingDialog(true)
            setOpen(false) // Close dropdown
        }
    }

    // Calculate total unread count
    const actionUnreadCount = actionNotifications.filter(n => !n.isRead).length
    const totalUnreadCount = actionUnreadCount + dbUnreadCount

    // Get icon for action notification type
    const getActionIcon = (type: string, imageUrl?: string) => {
        if (imageUrl) {
            return (
                <img
                    src={imageUrl}
                    alt=""
                    className="h-8 w-8 rounded-lg object-cover"
                />
            )
        }

        switch (type) {
            case 'cart': return <ShoppingCart className="h-4 w-4 text-purple-500" />
            case 'booking': return <Calendar className="h-4 w-4 text-blue-500" />
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
            case 'error': return <XCircle className="h-4 w-4 text-red-500" />
            default: return <Info className="h-4 w-4 text-blue-500" />
        }
    }

    // Get icon for DB notification type
    const getDbIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
            case 'error': return <XCircle className="h-4 w-4 text-red-500" />
            case 'booking': return <Calendar className="h-4 w-4 text-blue-500" />
            case 'order': return <ShoppingCart className="h-4 w-4 text-purple-500" />
            default: return <Info className="h-4 w-4 text-blue-500" />
        }
    }

    const handleMarkAllAsRead = () => {
        if (activeTab === 'activity') {
            markAllActionAsRead()
        } else {
            markAllDbAsRead()
        }
    }

    const currentUnreadCount = activeTab === 'activity' ? actionUnreadCount : dbUnreadCount

    return (
        <>
            <DropdownMenuPrimitive.Root open={open} onOpenChange={setOpen} modal={false}>
                <DropdownMenuPrimitive.Trigger asChild>
                    <button
                        type="button"
                        className="relative h-10 w-10 rounded-xl bg-neutral-100/60 dark:bg-neutral-900/60 hover:bg-[#e65737]/10 dark:hover:bg-[#e65737]/15 text-neutral-600 dark:text-neutral-400 hover:text-[#e65737] dark:hover:text-[#e65737] border border-neutral-200/40 dark:border-neutral-800/40 transition-all duration-300 flex items-center justify-center cursor-pointer"
                    >
                        <Bell className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                        {totalUnreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-[10px] font-bold bg-[#e65737] text-white rounded-full border border-background shadow-md animate-pulse">
                                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                            </span>
                        )}
                    </button>
                </DropdownMenuPrimitive.Trigger>
                <DropdownMenuPrimitive.Portal>
                    <DropdownMenuPrimitive.Content
                        align="end"
                        sideOffset={8}
                        className="w-96 p-0 bg-white/95 dark:bg-[#121210]/95 backdrop-blur-xl border border-neutral-200/50 dark:border-neutral-800/60 rounded-2xl shadow-2xl overflow-hidden z-[9999] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-neutral-100/60 dark:border-neutral-800/60 bg-gradient-to-r from-neutral-50/50 to-white/50 dark:from-neutral-900/40 dark:to-neutral-950/40">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2 font-display uppercase tracking-tight text-sm">
                                    Notifications
                                </h3>
                                {currentUnreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleMarkAllAsRead}
                                        className="text-xs h-7 text-[#e65737] hover:text-[#cc5032] hover:bg-[#e65737]/10 rounded-lg font-mono-tech uppercase tracking-wider"
                                    >
                                        <Check className="h-3 w-3 mr-1" />
                                        Mark all read
                                    </Button>
                                )}
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-1.5 bg-neutral-100/80 dark:bg-neutral-900/80 rounded-xl p-1 border border-neutral-200/20 dark:border-neutral-800/20">
                                <button
                                    onClick={() => setActiveTab('activity')}
                                    className={`flex-1 text-xs font-semibold py-2 px-3 rounded-lg transition-all duration-300 font-mono-tech uppercase tracking-wider ${activeTab === 'activity'
                                        ? 'bg-white dark:bg-neutral-800 text-[#e65737] dark:text-white shadow-sm border border-neutral-200/20 dark:border-neutral-700/20'
                                        : 'text-neutral-500 hover:text-[#e65737] dark:text-neutral-400 dark:hover:text-[#e65737]'
                                        }`}
                                >
                                    Activity
                                    {actionUnreadCount > 0 && (
                                        <span className="ml-1.5 inline-flex items-center justify-center h-4 w-4 text-[9px] bg-[#e65737] text-white rounded-full font-bold">
                                            {actionUnreadCount}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`flex-1 text-xs font-semibold py-2 px-3 rounded-lg transition-all duration-300 font-mono-tech uppercase tracking-wider ${activeTab === 'all'
                                        ? 'bg-white dark:bg-neutral-800 text-[#e65737] dark:text-white shadow-sm border border-neutral-200/20 dark:border-neutral-700/20'
                                        : 'text-neutral-500 hover:text-[#e65737] dark:text-neutral-400 dark:hover:text-[#e65737]'
                                        }`}
                                >
                                    System
                                    {dbUnreadCount > 0 && (
                                        <span className="ml-1.5 inline-flex items-center justify-center h-4 w-4 text-[9px] bg-[#e65737] text-white rounded-full font-bold">
                                            {dbUnreadCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="max-h-[400px] overflow-y-auto divide-y divide-neutral-100/40 dark:divide-neutral-850/40">
                            {activeTab === 'activity' ? (
                                // Action Notifications (Local)
                                actionNotifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="h-14 w-14 bg-gradient-to-br from-[#e65737]/10 to-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#e65737]/20">
                                            <ShoppingCart className="h-7 w-7 text-[#e65737]" />
                                        </div>
                                        <p className="text-neutral-900 dark:text-white font-bold mb-1 font-display uppercase text-xs tracking-wider">No recent activity</p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono-tech uppercase tracking-wider">Your bookings and cart actions will flash here.</p>
                                    </div>
                                ) : (
                                    actionNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`relative px-5 py-4 hover:bg-[#e65737]/5 dark:hover:bg-[#e65737]/10 transition-all duration-300 cursor-pointer group ${!notification.isRead ? 'bg-[#e65737]/3 dark:bg-[#e65737]/5' : ''
                                                }`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex gap-4">
                                                <div className="mt-0.5 shrink-0 h-10 w-10 rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/30 dark:border-neutral-800/50 flex items-center justify-center shadow-inner transition-transform duration-300 group-hover:scale-105">
                                                    {getActionIcon(notification.type, notification.imageUrl)}
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className={`text-sm leading-tight transition-colors group-hover:text-[#e65737] ${!notification.isRead ? 'font-bold text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-350'}`}>
                                                            {notification.title}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            {!notification.isRead && (
                                                                <div className="h-2 w-2 rounded-full bg-[#e65737] shadow-[0_0_8px_#e65737]" />
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    removeActionNotification(notification.id)
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition-all text-neutral-400 dark:text-neutral-500 hover:text-[#e65737]"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-normal">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mt-1">
                                                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                            {notification.link && (
                                                <Link
                                                    href={notification.link}
                                                    className="absolute inset-0 z-0"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            )}
                                        </div>
                                    ))
                                )
                            ) : (
                                // DB Notifications
                                isLoading ? (
                                    <div className="p-8 text-center text-neutral-400 dark:text-neutral-500">
                                        <div className="animate-spin h-6 w-6 border-2 border-[#e65737] border-t-transparent rounded-full mx-auto mb-2"></div>
                                        <p className="text-xs font-mono-tech uppercase tracking-widest">Syncing logs...</p>
                                    </div>
                                ) : dbNotifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="h-14 w-14 bg-gradient-to-br from-[#e65737]/10 to-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#e65737]/20">
                                            <Bell className="h-7 w-7 text-[#e65737]" />
                                        </div>
                                        <p className="text-neutral-900 dark:text-white font-bold mb-1 font-display uppercase text-xs tracking-wider">No notifications</p>
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono-tech uppercase tracking-wider">Aviation dispatch notifications will appear here.</p>
                                    </div>
                                ) : (
                                    dbNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`relative px-5 py-4 hover:bg-[#e65737]/5 dark:hover:bg-[#e65737]/10 transition-all duration-300 cursor-pointer ${!notification.is_read ? 'bg-[#e65737]/3 dark:bg-[#e65737]/5' : ''
                                                }`}
                                            onClick={() => !notification.is_read && markDbAsRead(notification.id)}
                                        >
                                            <div className="flex gap-4">
                                                <div className="mt-0.5 shrink-0 h-10 w-10 rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200/30 dark:border-neutral-800/50 flex items-center justify-center shadow-inner transition-transform duration-300 group-hover:scale-105">
                                                    {getDbIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className={`text-sm leading-tight transition-colors group-hover:text-[#e65737] ${!notification.is_read ? 'font-bold text-neutral-900 dark:text-white' : 'text-neutral-700 dark:text-neutral-350'}`}>
                                                            {notification.title}
                                                        </p>
                                                        {!notification.is_read && (
                                                            <div className="h-2 w-2 rounded-full bg-[#e65737] shadow-[0_0_8px_#e65737] shrink-0 mt-1" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-normal">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-[9px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mt-1">
                                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                            {notification.link && (
                                                <Link href={notification.link} className="absolute inset-0 z-0" onClick={(e) => e.stopPropagation()} />
                                            )}
                                        </div>
                                    ))
                                )
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-neutral-50/50 dark:bg-neutral-950/50 border-t border-neutral-100/50 dark:border-neutral-800/50 flex gap-2">
                            {activeTab === 'activity' && actionNotifications.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearActionNotifications}
                                    className="flex-1 text-xs text-neutral-500 hover:text-[#e65737] hover:bg-[#e65737]/10 rounded-xl transition-all duration-200 h-9 font-semibold font-mono-tech uppercase tracking-wider"
                                >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Clear All
                                </Button>
                            )}
                            {activeTab === 'all' && dbNotifications.length > 0 && (
                                <Button variant="ghost" size="sm" asChild className="flex-1 text-xs text-neutral-500 hover:text-[#e65737] hover:bg-[#e65737]/10 rounded-xl transition-all duration-200 h-9 font-semibold font-mono-tech uppercase tracking-wider">
                                    <Link href="/account/notifications">View all notifications</Link>
                                </Button>
                            )}
                        </div>
                    </DropdownMenuPrimitive.Content>
                </DropdownMenuPrimitive.Portal>
            </DropdownMenuPrimitive.Root>

            {/* Booking Details Dialog */}
            <BookingDetailsDialog
                isOpen={showBookingDialog}
                onClose={() => {
                    setShowBookingDialog(false)
                    setSelectedBooking(null)
                }}
                booking={selectedBooking}
            />
        </>
    )
}
