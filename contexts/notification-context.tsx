"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { supabase, Notification, getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/supabase"
import { useAuth } from "./auth-context"
import { toast } from "@/hooks/use-toast"

interface NotificationContextType {
    notifications: Notification[]
    unreadCount: number
    isLoading: boolean
    markAsRead: (id: string) => Promise<void>
    markAllAsRead: () => Promise<void>
    refreshNotifications: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const { user, isAuthenticated } = useAuth()

    const fetchNotifications = useCallback(async () => {
        if (!user) return

        setIsLoading(true)
        try {
            const data = await getNotifications(user.id)
            setNotifications(data)
            setUnreadCount(data.filter(n => !n.is_read).length)
        } catch (error) {
            console.error("Error fetching notifications:", error)
        } finally {
            setIsLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchNotifications()

            // Set up real-time subscription (only if supabase is initialized)
            if (!supabase) {
                setIsLoading(false)
                return
            }

            const channel = supabase
                .channel(`user-notifications-${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload: any) => {
                        const newNotification = payload.new as Notification
                        setNotifications(prev => [newNotification, ...prev])
                        setUnreadCount(prev => prev + 1)

                        // Show a toast for the new notification
                        toast({
                            title: newNotification.title,
                            description: newNotification.message,
                            duration: 5000,
                        })
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    },
                    (payload: any) => {
                        const updatedNotification = payload.new as Notification
                        setNotifications(prev =>
                            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
                        )
                        setUnreadCount(prev => {
                            const prevNotifications = notifications
                            const oldNotification = prevNotifications.find(n => n.id === updatedNotification.id)
                            if (oldNotification?.is_read === false && updatedNotification.is_read === true) {
                                return Math.max(0, prev - 1)
                            }
                            if (oldNotification?.is_read === true && updatedNotification.is_read === false) {
                                return prev + 1
                            }
                            return prev
                        })
                    }
                )
                .subscribe()

            return () => {
                supabase.removeChannel(channel)
            }
        } else {
            setNotifications([])
            setUnreadCount(0)
            setIsLoading(false)
        }
    }, [isAuthenticated, user, fetchNotifications])

    const markAsRead = async (id: string) => {
        try {
            await markNotificationAsRead(id)
            // Real-time update will handle state refresh, but we can optimistically update
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Error marking notification as read:", error)
        }
    }

    const markAllAsRead = async () => {
        if (!user) return
        try {
            await markAllNotificationsAsRead(user.id)
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error("Error marking all notifications as read:", error)
        }
    }

    const value = {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications
    }

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider")
    }
    return context
}
