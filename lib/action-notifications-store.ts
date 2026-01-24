"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ActionNotificationType = 'cart' | 'booking' | 'success' | 'info' | 'warning' | 'error'

// Booking data structure for popup
export interface BookingData {
    bookingId: string
    otp: string
    serviceType: string
    location: string
    scheduledAt: string
    pilot: {
        id: string
        full_name: string
        phone?: string
        email?: string
        rating?: number
    }
}

export interface ActionNotification {
    id: string
    title: string
    message: string
    type: ActionNotificationType
    icon?: string
    imageUrl?: string
    link?: string
    isRead: boolean
    timestamp: number
    bookingData?: BookingData // For booking notifications
}

interface ActionNotificationsStore {
    notifications: ActionNotification[]
    addNotification: (notification: Omit<ActionNotification, 'id' | 'isRead' | 'timestamp'>) => void
    removeNotification: (id: string) => void
    markAsRead: (id: string) => void
    markAllAsRead: () => void
    clearAll: () => void
    getUnreadCount: () => number
}

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

// Max notifications to keep
const MAX_NOTIFICATIONS = 50

// Auto-expire after 24 hours
const EXPIRY_TIME = 24 * 60 * 60 * 1000

export const useActionNotificationsStore = create<ActionNotificationsStore>()(
    persist(
        (set, get) => ({
            notifications: [],

            addNotification: (notification) => {
                const newNotification: ActionNotification = {
                    ...notification,
                    id: generateId(),
                    isRead: false,
                    timestamp: Date.now(),
                }

                set((state) => {
                    // Filter out expired notifications and add new one
                    const now = Date.now()
                    const validNotifications = state.notifications
                        .filter(n => now - n.timestamp < EXPIRY_TIME)
                        .slice(0, MAX_NOTIFICATIONS - 1) // Keep room for new notification

                    return {
                        notifications: [newNotification, ...validNotifications]
                    }
                })
            },

            removeNotification: (id) => {
                set((state) => ({
                    notifications: state.notifications.filter(n => n.id !== id)
                }))
            },

            markAsRead: (id) => {
                set((state) => ({
                    notifications: state.notifications.map(n =>
                        n.id === id ? { ...n, isRead: true } : n
                    )
                }))
            },

            markAllAsRead: () => {
                set((state) => ({
                    notifications: state.notifications.map(n => ({ ...n, isRead: true }))
                }))
            },

            clearAll: () => {
                set({ notifications: [] })
            },

            getUnreadCount: () => {
                return get().notifications.filter(n => !n.isRead).length
            },
        }),
        {
            name: "action-notifications-storage",
        }
    )
)

// Helper function to add cart notification
export const addCartNotification = (productName: string, imageUrl?: string) => {
    useActionNotificationsStore.getState().addNotification({
        title: "Added to Cart",
        message: `${productName} has been added to your cart`,
        type: 'cart',
        imageUrl,
        link: '/cart',
    })
}

// Helper function to add booking notification with full details
export const addBookingNotification = (bookingData: BookingData) => {
    useActionNotificationsStore.getState().addNotification({
        title: "Booking Confirmed! 🎉",
        message: `Your booking with ${bookingData.pilot.full_name} has been confirmed (ID: ${bookingData.bookingId})`,
        type: 'booking',
        bookingData,
    })
}

// Helper function to add success notification
export const addSuccessNotification = (title: string, message: string, link?: string) => {
    useActionNotificationsStore.getState().addNotification({
        title,
        message,
        type: 'success',
        link,
    })
}

// Helper function to add info notification
export const addInfoNotification = (title: string, message: string, link?: string) => {
    useActionNotificationsStore.getState().addNotification({
        title,
        message,
        type: 'info',
        link,
    })
}
