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
                        className="relative h-10 w-10 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all duration-200 flex items-center justify-center"
                    >
                        <Bell className="h-5 w-5" />
                        {totalUnreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full">
                                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
                            </span>
                        )}
                    </button>
                </DropdownMenuPrimitive.Trigger>
                <DropdownMenuPrimitive.Portal>
                    <DropdownMenuPrimitive.Content
                        align="end"
                        sideOffset={8}
                        className="w-96 p-0 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-[9999] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-blue-500" />
                                    Notifications
                                </h3>
                                {currentUnreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleMarkAllAsRead}
                                        className="text-xs h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                                    >
                                        <Check className="h-3 w-3 mr-1" />
                                        Mark all read
                                    </Button>
                                )}
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => setActiveTab('activity')}
                                    className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-all duration-200 ${activeTab === 'activity'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Recent Activity
                                    {actionUnreadCount > 0 && (
                                        <span className="ml-1.5 inline-flex items-center justify-center h-4 w-4 text-[10px] bg-blue-500 text-white rounded-full">
                                            {actionUnreadCount}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`flex-1 text-xs font-medium py-1.5 px-3 rounded-md transition-all duration-200 ${activeTab === 'all'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    All Notifications
                                    {dbUnreadCount > 0 && (
                                        <span className="ml-1.5 inline-flex items-center justify-center h-4 w-4 text-[10px] bg-purple-500 text-white rounded-full">
                                            {dbUnreadCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {activeTab === 'activity' ? (
                                // Action Notifications (Local)
                                actionNotifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="h-14 w-14 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <ShoppingCart className="h-7 w-7 text-blue-500" />
                                        </div>
                                        <p className="text-gray-900 font-medium mb-1">No recent activity</p>
                                        <p className="text-sm text-gray-500">Your cart and booking activities will appear here.</p>
                                    </div>
                                ) : (
                                    actionNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`relative px-4 py-3 hover:bg-gray-50/80 transition-all duration-200 cursor-pointer group ${!notification.isRead ? 'bg-blue-50/40' : ''
                                                }`}
                                            onClick={() => handleNotificationClick(notification)}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-0.5 shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center shadow-sm">
                                                    {getActionIcon(notification.type, notification.imageUrl)}
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className={`text-sm leading-tight ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                            {notification.title}
                                                        </p>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            {!notification.isRead && (
                                                                <div className="h-2 w-2 rounded-full bg-blue-600" />
                                                            )}
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    removeActionNotification(notification.id)
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-md transition-all"
                                                            >
                                                                <X className="h-3 w-3 text-gray-400" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400">
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
                                    <div className="p-8 text-center text-gray-400">
                                        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                                        <p className="text-sm">Loading...</p>
                                    </div>
                                ) : dbNotifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="h-14 w-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Bell className="h-7 w-7 text-purple-500" />
                                        </div>
                                        <p className="text-gray-900 font-medium mb-1">No notifications</p>
                                        <p className="text-sm text-gray-500">We'll notify you when something important happens.</p>
                                    </div>
                                ) : (
                                    dbNotifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`relative px-4 py-3 hover:bg-gray-50/80 transition-all duration-200 cursor-pointer ${!notification.is_read ? 'bg-purple-50/40' : ''
                                                }`}
                                            onClick={() => !notification.is_read && markDbAsRead(notification.id)}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-0.5 shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center shadow-sm">
                                                    {getDbIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className={`text-sm leading-tight ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                            {notification.title}
                                                        </p>
                                                        {!notification.is_read && (
                                                            <div className="h-2 w-2 rounded-full bg-purple-600 shrink-0 mt-1" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400">
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
                        <div className="p-2 border-t border-gray-100 bg-gray-50/50 flex gap-2">
                            {activeTab === 'activity' && actionNotifications.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearActionNotifications}
                                    className="flex-1 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Clear All
                                </Button>
                            )}
                            {activeTab === 'all' && dbNotifications.length > 0 && (
                                <Button variant="ghost" size="sm" asChild className="flex-1 text-xs text-gray-500 hover:text-gray-700 rounded-lg">
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
