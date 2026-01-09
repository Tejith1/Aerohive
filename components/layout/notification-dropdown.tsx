"use client"

import React from "react"
import Link from "next/link"
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle, Package, ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useNotifications } from "@/contexts/notification-context"
import { formatDistanceToNow } from "date-fns"

export function NotificationDropdown() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications()

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
            case 'error': return <XCircle className="h-4 w-4 text-red-500" />
            case 'booking': return <Package className="h-4 w-4 text-blue-500" />
            case 'order': return <ShoppingCart className="h-4 w-4 text-purple-500" />
            default: return <Info className="h-4 w-4 text-blue-500" />
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all duration-200"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-red-500 to-pink-500 border-0 animate-in fade-in zoom-in duration-300">
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 bg-white/95 backdrop-blur-lg border border-gray-200/50 rounded-2xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-xs h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-400">
                            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                            <p className="text-sm">Loading...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Bell className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-gray-900 font-medium">No notifications</p>
                            <p className="text-sm text-gray-500">We'll notify you when something important happens.</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`relative px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer group ${!notification.is_read ? 'bg-blue-50/30' : ''}`}
                                onClick={() => !notification.is_read && markAsRead(notification.id)}
                            >
                                <div className="flex gap-3">
                                    <div className="mt-1 shrink-0">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between">
                                            <p className={`text-sm leading-none ${!notification.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                                {notification.title}
                                            </p>
                                            {!notification.is_read && (
                                                <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1" />
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
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="p-2 border-t border-gray-100 bg-gray-50/50">
                        <Button variant="ghost" size="sm" asChild className="w-full text-xs text-gray-500 hover:text-gray-700">
                            <Link href="/account/notifications">View all notifications</Link>
                        </Button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
