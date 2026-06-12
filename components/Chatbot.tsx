'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { MessageCircle, X, Send, MapPin, User, Calendar, Clock, CheckCircle, Loader2, Sparkles, Bot, Shield, Zap, ArrowRight, Star, Map, Wrench, Sprout, Compass, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { getCurrentUser, DronePilot, supabase } from '@/lib/supabase'
import { BookingConfirmDialog } from '@/components/BookingConfirmDialog'
import { BookingDetailsDialog } from '@/components/BookingDetailsDialog'
import { BookingLimitReachedDialog } from '@/components/BookingLimitReachedDialog'

type ChatState = 'INIT' | 'REQUIREMENTS' | 'LOCATION' | 'RADIUS' | 'SEARCHING' | 'RESULTS' | 'CONFIRM' | 'BOOKING' | 'SUCCESS' | 'ERROR'

interface Message {
    id: string
    role: 'bot' | 'user'
    content: string | React.ReactNode
    type?: 'text' | 'action_request' | 'pilot_list' | 'booking_details' | 'booking_confirm' | 'booking_success' | 'error_box'
    data?: any
}

// Dynamic import for Leaflet (SSR safe) - with no SSR and custom loading
const MissionMap = dynamic(
    () => import('./MissionMap').then(mod => mod.default),
    {
        ssr: false,
        loading: () => <div className="h-full w-full bg-[#f4f1ea] animate-pulse rounded-md flex items-center justify-center text-xs text-slate-400">Initializing Mission Map...</div>
    }
)

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState('')
    const [chatState, setChatState] = useState<ChatState>('INIT')
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)
    const [foundPilots, setFoundPilots] = useState<DronePilot[]>([])
    const [selectedPilot, setSelectedPilot] = useState<DronePilot | null>(null)
    const [requirements, setRequirements] = useState('')
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const [userAddress, setUserAddress] = useState<string>('')
    const [savedAddress, setSavedAddress] = useState<string>('')
    const [userName, setUserName] = useState<string>('')
    const [userPhone, setUserPhone] = useState<string>('')
    const { toast } = useToast()

    // Booking dialogs state
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [showDetailsDialog, setShowDetailsDialog] = useState(false)
    const [showLimitDialog, setShowLimitDialog] = useState(false)
    const [bookingLimitData, setBookingLimitData] = useState<{
        canBook: boolean
        currentCount: number
        maxBookings: number
        bookings: any[]
    } | null>(null)
    const [pendingBookingPilot, setPendingBookingPilot] = useState<DronePilot | null>(null)
    const [completedBookingDetails, setCompletedBookingDetails] = useState<any>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    const [trackingData, setTrackingData] = useState<{ lat: number, lng: number } | null>(null)
    const socketRef = useRef<WebSocket | null>(null)

    useEffect(() => {
        // Check auth and load saved address details
        getCurrentUser().then(user => {
            setCurrentUser(user)
            if (user) {
                supabase
                    .from('addresses')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('is_default', true)
                    .maybeSingle()
                    .then(({ data, error }: { data: any, error: any }) => {
                        if (data && !error) {
                            const addrString = `${data.address_line_1}${data.address_line_2 ? ', ' + data.address_line_2 : ''}, ${data.city}, ${data.state} - ${data.postal_code}`
                            setSavedAddress(addrString)
                        }
                    })
            }
        })

        return () => {
            if (socketRef.current) socketRef.current.close()
        }
    }, [])

    const startTracking = (bookingId: string) => {
        if (socketRef.current) socketRef.current.close()

        const sanitizedId = bookingId.replace('#', '')
        const wsUrl = `ws://localhost:8000/ws/tracking/${sanitizedId}`
        const ws = new WebSocket(wsUrl)

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                if (data.location) {
                    setTrackingData(data.location)
                }
            } catch (err) {
                console.error("WS Parse Error", err)
            }
        }

        socketRef.current = ws
    }

    const [language, setLanguage] = useState<'en' | 'te' | 'hi' | null>(null)

    const addMessage = (role: 'bot' | 'user', content: string | React.ReactNode, type?: Message['type'], data?: any) => {
        setMessages(prev => [...prev, { id: Math.random().toString(36), role, content, type, data }])
    }

    const handleOpen = async () => {
        setIsOpen(true)
        if (messages.length === 0 && !language) {
            addMessage('bot', (
                <div className="flex flex-col gap-3 py-1">
                    <p className="text-xs font-semibold text-[#8a806a] uppercase tracking-wider">Choose your operations language:</p>
                    <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" className="border-[#e5dfd3] hover:border-[#c26244] bg-[#f7f5f0] text-[#191919] text-xs py-2 rounded-xl hover:bg-[#f0ede4] transition" onClick={() => handleLanguageSelect('en')}>English</Button>
                        <Button variant="outline" className="border-[#e5dfd3] hover:border-[#c26244] bg-[#f7f5f0] text-[#191919] text-xs py-2 rounded-xl hover:bg-[#f0ede4] transition" onClick={() => handleLanguageSelect('te')}>Telugu</Button>
                        <Button variant="outline" className="border-[#e5dfd3] hover:border-[#c26244] bg-[#f7f5f0] text-[#191919] text-xs py-2 rounded-xl hover:bg-[#f0ede4] transition" onClick={() => handleLanguageSelect('hi')}>Hindi</Button>
                    </div>
                </div>
            ))
        }
    }

    const handleLanguageSelect = async (lang: 'en' | 'te' | 'hi') => {
        setLanguage(lang)
        const langLabel = lang === 'en' ? "English" : lang === 'te' ? "Telugu" : "Hindi"
        addMessage('user', langLabel)
        setIsLoading(true)

        try {
            const res = await callBackend("hello", "INIT", { language: lang })
            if (res.message && res.message.trim() !== '') {
                addMessage('bot', res.message)
            }
            setChatState(res.next_state as ChatState)
        } catch (e) {
            console.error("Backend offline, falling back", e)
            addMessage('bot', "Hello! I'm your AeroChat assistant. (Offline Mode)")
            setChatState('REQUIREMENTS')
        } finally {
            setIsLoading(false)
        }
    }

    const callBackend = async (msg: string, state: ChatState, context?: any) => {
        try {
            const resolvedLat = context?.lat || userLocation?.lat || (typeof window !== 'undefined' && (window as any).__last_lat) || null;
            const resolvedLng = context?.lng || userLocation?.lng || (typeof window !== 'undefined' && (window as any).__last_lng) || null;
            const fullContext = {
                lat: resolvedLat,
                lng: resolvedLng,
                language: language || context?.language || 'en',
                ...(context || {})
            }
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: msg,
                    state: state,
                    context: fullContext
                })
            })
            if (!response.ok) throw new Error("Backend error")
            return await response.json()
        } catch (e) {
            console.error(e)
            throw e
        }
     }

    const handleSend = async (customValue?: string) => {
        const textToSubmit = customValue || inputValue
        if (!textToSubmit.trim()) return

        setInputValue('')
        addMessage('user', textToSubmit)
        setIsLoading(true)

        try {
            const res = await callBackend(textToSubmit, chatState, {
                requirements: requirements
            })

            if (res.message && res.message.trim() !== '') {
                addMessage('bot', res.message)
            }

            if (res.data?.lat && res.data?.lng) {
                setUserLocation({ lat: res.data.lat, lng: res.data.lng })
                if (typeof window !== 'undefined') {
                    (window as any).__last_lat = res.data.lat;
                    (window as any).__last_lng = res.data.lng;
                }
            }

            if (res.user_name) setUserName(res.user_name)
            if (res.user_phone) setUserPhone(res.user_phone)

            setChatState(res.next_state as ChatState)

            if (res.action === 'request_location') {
                setRequirements(textToSubmit)
                addMessage('bot', (
                    <div className="flex flex-col gap-2 mt-2">
                        <Button variant="secondary" size="sm" className="w-full flex items-center justify-center gap-2 bg-[#c26244] hover:bg-[#a95237] text-white border-none font-bold py-2.5 rounded-xl shadow transition active:scale-95" onClick={requestLocation}>
                            <MapPin className="h-4 w-4 text-white" /> Share My Location
                        </Button>
                    </div>
                ))
            } else if (res.action === 'request_radius') {
                setChatState('RADIUS')
                addMessage('bot', (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {[10, 20, 50].map(r => (
                            <Button key={r} variant="outline" size="sm" className="border-[#e5dfd3] hover:border-[#c26244] bg-[#f7f5f0] text-[#191919] rounded-xl transition" onClick={() => handleSelectRadius(r)}>
                                {r} km
                            </Button>
                        ))}
                    </div>
                ))
            } else if (res.action === 'show_results' && res.data?.pilots) {
                const pilots = res.data.pilots
                setFoundPilots(pilots)
                addMessage('bot', (
                    <div className="flex flex-col gap-2.5 mt-2 max-h-[340px] overflow-y-auto pr-1.5 aero-scroll">
                        {pilots.map((pilot: any) => (
                            <Card key={pilot.id} className="border border-[#e5dfd3] bg-white hover:border-[#c26244] transition-all duration-300 cursor-pointer shadow-sm rounded-2xl group overflow-hidden" onClick={() => handleSelectPilot(pilot)}>
                                <CardContent className="p-4 flex items-start gap-3.5 relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#c26244] transform scale-y-0 group-hover:scale-y-100 transition-all duration-300" />
                                    
                                    <div className="h-10 w-10 rounded-xl bg-[#f7f5f0] border border-[#e5dfd3] flex items-center justify-center shrink-0 shadow-inner group-hover:border-[#c26244]/20 transition">
                                        <User className="h-5 w-5 text-[#c26244]/80 group-hover:text-[#c26244] transition" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-sm text-[#191919] group-hover:text-[#c26244] truncate transition">{pilot.full_name}</p>
                                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{pilot.specialization || pilot.specializations || 'General Specialization'}</p>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-xs font-extrabold text-[#c26244]">₹{pilot.hourly_rate}/hr</span>
                                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {pilot.rating.toFixed(1)}
                                            </span>
                                        </div>
                                        {pilot.distance_km != null && (
                                            <p className="text-[10px] text-[#c26244] font-semibold mt-2 flex items-center gap-1">
                                                <Compass className="h-3 w-3 text-[#c26244]" /> {pilot.distance_km} km away
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ))
            }
            else if (res.action === 'process_booking') {
                if (selectedPilot) processBooking(selectedPilot)
            }

        } catch (e) {
            addMessage('bot', "I'm having trouble connecting to my AI brain. Please try again later.")
        } finally {
            setIsLoading(false)
        }
    }

    const requestLocation = () => {
        if (!navigator.geolocation) {
            addMessage('bot', "Geolocation is not supported by your browser.")
            setChatState('ERROR')
            return
        }

        addMessage('user', "Sharing location...")
        setChatState('SEARCHING')

        const getLocation = (options: PositionOptions): Promise<GeolocationPosition> => {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, options)
            })
        }

        const processPosition = async (position: GeolocationPosition) => {
            const { latitude, longitude } = position.coords
            setUserLocation({ lat: latitude, lng: longitude })
            if (typeof window !== 'undefined') {
                (window as any).__last_lat = latitude;
                (window as any).__last_lng = longitude;
            }

            let currentAddr = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                const data = await res.json()
                if (data.display_name) {
                    const addressParts = data.address || {}
                    currentAddr = [
                        addressParts.suburb || addressParts.neighbourhood || addressParts.road,
                        addressParts.city || addressParts.town || addressParts.village,
                        addressParts.state
                    ].filter(Boolean).join(', ') || data.display_name
                }
            } catch (err) {
                console.error("Geocoding failed", err)
            }

            setUserAddress(currentAddr)

            const syncDisplay = (
                <div className="space-y-2.5 text-xs text-[#191919]">
                    <p className="font-bold text-[#c26244] flex items-center gap-1.5">
                        Location Details Synced
                    </p>
                    <div className="bg-[#f7f5f0] border border-[#e5dfd3] rounded-2xl p-4 space-y-3 shadow-inner">
                        <div>
                            <span className="text-[9px] text-[#8a806a] font-extrabold uppercase tracking-wider block">Detected GPS Location</span>
                            <span className="font-semibold text-[#191919] mt-0.5 block">{currentAddr}</span>
                        </div>
                        {savedAddress && (
                            <div className="border-t border-[#e5dfd3] pt-2.5">
                                <span className="text-[9px] text-[#8a806a] font-extrabold uppercase tracking-wider block">Account Profile Address</span>
                                <span className="font-semibold text-[#191919] mt-0.5 block">{savedAddress}</span>
                            </div>
                        )}
                    </div>
                </div>
            )

            addMessage('bot', syncDisplay)

            try {
                const aiRes = await callBackend("Location Shared", "LOCATION", { lat: latitude, lng: longitude, location_name: currentAddr })
                if (aiRes.message && aiRes.message.trim() !== '') {
                    addMessage('bot', aiRes.message)
                }
                setChatState(aiRes.next_state as ChatState)
            } catch (e) {
                console.error(e)
                addMessage('bot', "Error communicating with backend.")
                setChatState('ERROR')
            }
        }

        getLocation({ enableHighAccuracy: true, timeout: 5000, maximumAge: 0 })
            .then(processPosition)
            .catch((err) => {
                console.warn("High accuracy location failed, trying low accuracy...", err)
                getLocation({ enableHighAccuracy: false, timeout: 10000, maximumAge: 0 })
                    .then(processPosition)
                    .catch((finalErr) => {
                        console.error("All location attempts failed", finalErr)
                        let errorMsg = "I couldn't get your location."
                        if (finalErr.code === 1) errorMsg = "Location permission denied. Please enable it in browser settings."
                        else if (finalErr.code === 3) errorMsg = "Location request timed out."

                        addMessage('bot', errorMsg + " You can type your city name instead.")
                        setChatState('LOCATION')
                    })
            })
    }

    const handleSelectRadius = async (radius: number) => {
        addMessage('user', `${radius} km radius`)
        setChatState('SEARCHING')
        setIsLoading(true)
        try {
            const res = await callBackend(`${radius}km`, 'RADIUS', { radius_km: radius })
            if (res.message && res.message.trim() !== '') {
                addMessage('bot', res.message)
            }
            setChatState(res.next_state as ChatState)
            if (res.action === 'show_results' && res.data?.pilots) {
                const pilots = res.data.pilots
                setFoundPilots(pilots)
                addMessage('bot', (
                    <div className="flex flex-col gap-2.5 mt-2 max-h-[340px] overflow-y-auto pr-1.5 aero-scroll">
                        {pilots.map((pilot: any) => (
                            <Card key={pilot.id} className="border border-[#e5dfd3] bg-white hover:border-[#c26244] transition-all duration-300 cursor-pointer shadow-sm rounded-2xl group overflow-hidden" onClick={() => handleSelectPilot(pilot)}>
                                <CardContent className="p-4 flex items-start gap-3.5 relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#c26244] transform scale-y-0 group-hover:scale-y-100 transition-all duration-300" />
                                    
                                    <div className="h-10 w-10 rounded-xl bg-[#f7f5f0] border border-[#e5dfd3] flex items-center justify-center shrink-0 shadow-inner group-hover:border-[#c26244]/20 transition">
                                        <User className="h-5 w-5 text-[#c26244]/80 group-hover:text-[#c26244] transition" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold text-sm text-[#191919] group-hover:text-[#c26244] truncate transition">{pilot.full_name}</p>
                                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{pilot.specialization || pilot.specializations || 'General Specialization'}</p>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-xs font-extrabold text-[#c26244]">₹{pilot.hourly_rate}/hr</span>
                                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                                <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {pilot.rating.toFixed(1)}
                                            </span>
                                        </div>
                                        {pilot.distance_km != null && (
                                            <p className="text-[10px] text-[#c26244] font-semibold mt-2 flex items-center gap-1">
                                                <Compass className="h-3 w-3 text-[#c26244]" /> {pilot.distance_km} km away
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ))
            }
        } catch (e) {
            addMessage('bot', "Search failed. Please try again.")
            setChatState('RADIUS')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSelectPilot = (pilot: DronePilot) => {
        setSelectedPilot(pilot)
        setChatState('CONFIRM')
        addMessage('bot', (
            <div className="flex flex-col gap-2 text-xs text-[#191919]">
                <span className="text-slate-800 text-sm">Selected: <strong className="text-[#191919]">{pilot.full_name}</strong></span>
                <span className="text-[#8a806a] block mb-1">Set custom billing details and schedules inside our secure booking window:</span>
                {!currentUser ? (
                    <Button variant="destructive" className="w-full mt-2 font-bold py-2.5 rounded-xl shadow" onClick={() => window.location.href = '/login'}>
                        Log in to Confirm Booking
                    </Button>
                ) : (
                    <Button className="w-full mt-2 bg-[#c26244] hover:bg-[#a95237] text-white font-extrabold py-2.5 rounded-xl shadow transition active:scale-95 border-none" onClick={() => initiateBooking(pilot)}>
                        Customize & Confirm Booking
                    </Button>
                )}
            </div>
        ))
    }

    const initiateBooking = async (pilot: DronePilot) => {
        if (!currentUser) return

        setPendingBookingPilot(pilot)

        try {
            const limitRes = await fetch(`/api/bookings/check-limit?userId=${currentUser.id}`)
            const limitData = await limitRes.json()

            setBookingLimitData(limitData)

            if (!limitData.canBook) {
                setShowLimitDialog(true)
                return
            }

            setShowConfirmDialog(true)

        } catch (error) {
            console.error('Error checking booking limit:', error)
            setBookingLimitData({ canBook: true, currentCount: 0, maxBookings: 100, bookings: [] })
            setShowConfirmDialog(true)
        }
    }

    const processBookingAfterConfirm = async (bookingDetails: {
        location: string
        scheduledAt: string
        durationHours: number
        totalAmount: number
        lat?: number
        lng?: number
        userName: string
        userEmail: string
        userPhone: string
    }) => {
        setShowConfirmDialog(false)

        const pilot = pendingBookingPilot
        if (!currentUser || !pilot) return

        setChatState('BOOKING')
        addMessage('user', "Confirm & Book")
        addMessage('bot', <div className="flex items-center gap-2 text-[#c26244] font-bold"><Loader2 className="h-4 w-4 animate-spin text-[#c26244]" /> Finalizing production booking...</div>)

        try {
            const bookingRes = await fetch('/api/bookings/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: currentUser.id,
                    pilot_id: pilot.id,
                    service_type: pilot.specializations || "General",
                    lat: bookingDetails.lat || userLocation?.lat || 0,
                    lng: bookingDetails.lng || userLocation?.lng || 0,
                    location_name: bookingDetails.location,
                    scheduled_at: bookingDetails.scheduledAt,
                    duration_hours: bookingDetails.durationHours,
                    payment_method: 'UPI',
                    requirements: { note: requirements },
                    user_name: bookingDetails.userName,
                    user_phone: bookingDetails.userPhone || currentUser.phone || '',
                    user_email: bookingDetails.userEmail
                })
            })

            const bookingDataRes = await bookingRes.json()
            if (!bookingRes.ok) throw new Error(bookingDataRes.detail || "Booking failed")

            setChatState('SUCCESS')
            startTracking(bookingDataRes.booking_id)

            setCompletedBookingDetails({
                bookingId: bookingDataRes.booking_id,
                otp: bookingDataRes.otp,
                serviceType: pilot.specializations || "General",
                location: bookingDetails.location || userAddress || `${userLocation?.lat.toFixed(4)}, ${userLocation?.lng.toFixed(4)}`,
                scheduledAt: new Date(bookingDetails.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
                pilot: {
                    id: pilot.id,
                    full_name: bookingDataRes.pilot_name || pilot.full_name,
                    phone: bookingDataRes.pilot_phone || pilot.phone,
                    email: bookingDataRes.pilot_email || pilot.email,
                    rating: bookingDataRes.pilot_rating || pilot.rating
                }
            })

            setShowDetailsDialog(true)

            addMessage('bot', "Mission Hub Initialized", 'booking_success', {
                booking_id: bookingDataRes.booking_id,
                pilot: pilot,
                otp: bookingDataRes.otp,
                client_message: bookingDataRes.client_message,
                pilot_message: bookingDataRes.pilot_message
            })

        } catch (e: any) {
            console.error(e)
            addMessage('bot', (
                <div className="text-destructive text-xs p-3 bg-red-50 border border-red-200 rounded-xl">
                    <strong>Booking Failed:</strong> {e.message || "Unknown Error"}
                </div>
            ))
            setChatState('CONFIRM')
        }
    }

    const processBooking = async (pilot: DronePilot) => {
        initiateBooking(pilot)
    }

    // Auto-formatted bold highlights with clean Warm Tan backgrounds (No Emojis)
    const renderFormattedContent = (content: string | React.ReactNode) => {
        if (typeof content !== 'string') return content

        const parts = content.split(/(\*\*.*?\*\*)/g)
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                const inner = part.slice(2, -2)
                return (
                    <strong key={index} className="text-[#c26244] font-extrabold bg-[#f0ede4] px-1.5 py-0.5 rounded-md border border-[#e5dfd3] shadow-sm inline-block my-0.5 aero-body-font">
                        {inner}
                    </strong>
                )
            }
            return part
        })
    }

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Arvo:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Inter:wght@300;400;500;600;700&display=swap');
                .aero-font {
                    font-family: 'Inter', -apple-system, sans-serif !important;
                }
                .aero-serif {
                    font-family: 'Playfair Display', Georgia, serif !important;
                }
                .aero-body-font {
                    font-family: 'Sreda', 'Arvo', 'Courier Prime', serif !important;
                    font-weight: 400;
                    line-height: 1.65;
                    letter-spacing: -0.01em;
                }
                .aero-heading-font {
                    font-family: 'Playfair Display', Georgia, serif !important;
                    font-weight: 700;
                }
                .animate-outer-arrows {
                    animation: continuous-spin 3s linear infinite;
                    transform-origin: 50px 50px;
                }
                .animate-inner-core {
                    animation: stepped-spin 4s cubic-bezier(0.77, 0, 0.175, 1) infinite;
                    transform-origin: 50px 50px;
                }
                @keyframes continuous-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes stepped-spin {
                    0% { transform: rotate(0deg); }
                    20% { transform: rotate(0deg); }
                    25% { transform: rotate(90deg); }
                    45% { transform: rotate(90deg); }
                    50% { transform: rotate(180deg); }
                    70% { transform: rotate(180deg); }
                    75% { transform: rotate(270deg); }
                    95% { transform: rotate(270deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes helix-ring-1 {
                    0% { transform: rotateX(50deg) rotateY(45deg) rotateZ(0deg); }
                    100% { transform: rotateX(50deg) rotateY(45deg) rotateZ(360deg); }
                }
                @keyframes helix-ring-2 {
                    0% { transform: rotateX(50deg) rotateY(-45deg) rotateZ(360deg); }
                    100% { transform: rotateX(50deg) rotateY(-45deg) rotateZ(0deg); }
                }
                @keyframes helix-ring-3 {
                    0% { transform: rotateX(80deg) rotateY(0deg) rotateZ(0deg); }
                    100% { transform: rotateX(80deg) rotateY(0deg) rotateZ(360deg); }
                }
                .animate-helix-ring-1 {
                    transform-style: preserve-3d;
                    animation: helix-ring-1 2.2s linear infinite;
                }
                .animate-helix-ring-2 {
                    transform-style: preserve-3d;
                    animation: helix-ring-2 2.2s linear infinite;
                }
                .animate-helix-ring-3 {
                    transform-style: preserve-3d;
                    animation: helix-ring-3 1.8s linear infinite;
                }
                /* Styling custom scrollbars for elite paper aesthetic */
                .aero-scroll::-webkit-scrollbar {
                    width: 5px;
                }
                .aero-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .aero-scroll::-webkit-scrollbar-thumb {
                    background: #e5dfd3;
                    border-radius: 10px;
                }
            `}</style>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-[#1c1a16]/30 backdrop-blur-[2px] z-[40] animate-in fade-in duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className="fixed bottom-5 right-5 z-[50] flex flex-col items-end aero-font">
                {isOpen && (
                    <Card className="w-[430px] h-[600px] max-h-[calc(100vh-120px)] mb-4 shadow-[0_20px_50px_rgba(28,26,22,0.15)] border border-[#e5dfd3] animate-in slide-in-from-bottom-6 duration-300 bg-[#fbfaf7] overflow-hidden flex flex-col rounded-[24px]">
                        <div className="p-5 border-b border-[#e5dfd3] flex items-center justify-between bg-[#fbfaf7] text-[#191919]">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 bg-white rounded-xl flex items-center justify-center border border-[#e5dfd3] shadow-sm p-1">
                                    {/* Custom Aero Logo SVG */}
                                    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                                        <defs>
                                            <linearGradient id="aeroLogoGradientHeader" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#9edbf9" />
                                                <stop offset="25%" stopColor="#a0cbf7" />
                                                <stop offset="60%" stopColor="#e8a8b5" />
                                                <stop offset="100%" stopColor="#8b5cf6" />
                                            </linearGradient>
                                            <mask id="aeroLogoMaskHeader">
                                                <rect x="0" y="0" width="100" height="100" fill="white" />
                                                <rect x="44" y="32" width="12" height="36" rx="6" fill="black" />
                                                <rect x="30" y="44" width="40" height="12" rx="6" fill="black" />
                                            </mask>
                                        </defs>
                                        <path d="M 50,12 C 58,12 64,18 70,28 L 88,60 C 95,73 85,84 72,84 C 64,84 59,77 59,69 C 59,62 55,58 50,58 C 45,58 41,62 41,69 C 41,77 36,84 28,84 C 15,84 5,73 12,60 L 30,28 C 36,18 42,12 50,12 Z" fill="url(#aeroLogoGradientHeader)" mask="url(#aeroLogoMaskHeader)" />
                                    </svg>
                                </div>
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-[17px] tracking-tight text-[#191919] aero-font">
                                            AeroChat
                                        </span>
                                        <div className="h-1.5 w-1.5 rounded-full bg-[#c26244] shadow-[0_0_8px_#c26244]" />
                                    </div>
                                    <span className="text-[10px] text-[#8a806a] font-bold uppercase tracking-wider block">Operations Assistant</span>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#8a806a] hover:text-[#191919] hover:bg-[#f0ede4]/50 rounded-full transition-all" onClick={() => setIsOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <CardContent className="p-0 flex flex-col flex-1 min-h-0">
                            {/* Messages Scroll Area */}
                            <ScrollArea className="flex-1 p-5 overscroll-contain bg-[#fbfaf7] overflow-hidden">
                                <div className="flex flex-col gap-6">
                                    
                                    {/* Claude-grade Warm Greeting grid */}
                                    {messages.length === 0 && (
                                        <div className="flex flex-col items-center justify-center text-center py-8 px-2 space-y-6">
                                            <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center border border-[#e5dfd3] shadow-sm p-2">
                                                {/* Custom Aero Logo SVG */}
                                                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                                                    <defs>
                                                        <linearGradient id="aeroLogoGradientGreet" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#9edbf9" />
                                                            <stop offset="25%" stopColor="#a0cbf7" />
                                                            <stop offset="60%" stopColor="#e8a8b5" />
                                                            <stop offset="100%" stopColor="#8b5cf6" />
                                                        </linearGradient>
                                                        <mask id="aeroLogoMaskGreet">
                                                            <rect x="0" y="0" width="100" height="100" fill="white" />
                                                            <rect x="44" y="32" width="12" height="36" rx="6" fill="black" />
                                                            <rect x="30" y="44" width="40" height="12" rx="6" fill="black" />
                                                        </mask>
                                                    </defs>
                                                    <path d="M 50,12 C 58,12 64,18 70,28 L 88,60 C 95,73 85,84 72,84 C 64,84 59,77 59,69 C 59,62 55,58 50,58 C 45,58 41,62 41,69 C 41,77 36,84 28,84 C 15,84 5,73 12,60 L 30,28 C 36,18 42,12 50,12 Z" fill="url(#aeroLogoGradientGreet)" mask="url(#aeroLogoMaskGreet)" />
                                                </svg>
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-bold text-[#191919] tracking-tight aero-font">
                                                    Deploy drone missions with AeroChat
                                                </h3>
                                                <p className="text-xs text-[#8a806a] max-w-[290px] leading-relaxed">
                                                    Welcome. Choose a quick-start action below to geolocate and query nearest drone operators immediately:
                                                </p>
                                            </div>
                                            
                                            {/* Quick Actions Paper Pills */}
                                            <div className="w-full grid grid-cols-1 gap-2.5 pt-3">
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleSend("Hire a 3D Mapping Pilot")}
                                                    className="w-full bg-white hover:bg-[#f7f5f0] border border-[#e5dfd3] hover:border-[#c26244] text-left p-4 rounded-xl transition group duration-300 flex items-center justify-between shadow-sm"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-[#fbfaf7] border border-[#e5dfd3] flex items-center justify-center">
                                                            <Map className="h-4 w-4 text-[#8a806a]" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <span className="text-xs font-bold text-[#191919] block transition">3D Mapping Mission</span>
                                                            <span className="text-[10px] text-[#8a806a] block">Topographical photogrammetry routing</span>
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="h-3.5 w-3.5 text-[#8a806a] group-hover:text-[#c26244] group-hover:translate-x-0.5 transition-all" />
                                                </button>

                                                <button 
                                                    type="button" 
                                                    onClick={() => handleSend("Agricultural Spraying Drone")}
                                                    className="w-full bg-white hover:bg-[#f7f5f0] border border-[#e5dfd3] hover:border-[#c26244] text-left p-4 rounded-xl transition group duration-300 flex items-center justify-between shadow-sm"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-[#fbfaf7] border border-[#e5dfd3] flex items-center justify-center">
                                                            <Sprout className="h-4 w-4 text-[#8a806a]" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <span className="text-xs font-bold text-[#191919] block transition">Crop Spraying Services</span>
                                                            <span className="text-[10px] text-[#8a806a] block">Shield crops via agricultural drones</span>
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="h-3.5 w-3.5 text-[#8a806a] group-hover:text-[#c26244] group-hover:translate-x-0.5 transition-all" />
                                                </button>

                                                <button 
                                                    type="button" 
                                                    onClick={() => handleSend("Drone Repair & Diagnostic Service")}
                                                    className="w-full bg-white hover:bg-[#f7f5f0] border border-[#e5dfd3] hover:border-[#c26244] text-left p-4 rounded-xl transition group duration-300 flex items-center justify-between shadow-sm"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-[#fbfaf7] border border-[#e5dfd3] flex items-center justify-center">
                                                            <Wrench className="h-4 w-4 text-[#8a806a]" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <span className="text-xs font-bold text-[#191919] block transition">Drone Care & Diagnostics</span>
                                                            <span className="text-[10px] text-[#8a806a] block">Maintain hardware at certified centers</span>
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="h-3.5 w-3.5 text-[#8a806a] group-hover:text-[#c26244] group-hover:translate-x-0.5 transition-all" />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {messages.map(msg => (
                                        <div key={msg.id} className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.role !== 'user' && (
                                                <div className="h-8 w-8 rounded-xl bg-[#f0ede4] border border-[#e5dfd3] flex items-center justify-center shrink-0 shadow-sm">
                                                    <Bot className="h-4 w-4 text-[#8a806a]" />
                                                </div>
                                            )}
                                            
                                            <div className={`max-w-[80%] rounded-[20px] px-4.5 py-3 text-[13.5px] leading-relaxed shadow-sm transition-all duration-300 relative aero-body-font ${msg.role === 'user'
                                                ? 'bg-[#f0ede4] text-[#191919] border border-[#e5dfd3] rounded-tr-none font-medium'
                                                : 'text-[#191919] px-1'
                                                }`}>
                                                {msg.type === 'booking_success' ? (
                                                    <div className="space-y-4">
                                                        <div className="bg-[#f7f5f0] border border-[#e5dfd3] p-3.5 rounded-xl space-y-2.5">
                                                            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-extrabold text-[#c26244]">
                                                                <span>Booking Confirmed</span>
                                                                <span className="flex items-center gap-1"><Check className="h-3 w-3 text-[#c26244]" /> Encrypted</span>
                                                            </div>
                                                            <div className="flex justify-between items-end gap-2 pt-1 border-t border-[#e5dfd3]">
                                                                <div>
                                                                    <p className="text-[9px] text-[#8a806a] uppercase font-bold tracking-wider">Reference</p>
                                                                    <p className="text-sm font-extrabold text-[#191919] mt-0.5">{msg.data?.booking_id}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-[9px] text-[#8a806a] uppercase font-bold tracking-wider">Security OTP</p>
                                                                    <p className="text-sm font-black text-[#c26244] tracking-wider mt-0.5">{msg.data?.otp}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3.5">
                                                            <div className="p-3 bg-[#f7f5f0] border border-[#e5dfd3] rounded-xl text-xs shadow-inner">
                                                                <p className="text-[9px] font-bold text-[#8a806a] mb-1.5 uppercase tracking-wider">Instructions for Client</p>
                                                                <div className="whitespace-pre-wrap leading-relaxed text-slate-700">
                                                                    {msg.data?.client_message}
                                                                </div>
                                                            </div>

                                                            <div className="p-3 bg-[#f7f5f0] border border-[#e5dfd3] rounded-xl text-xs shadow-inner">
                                                                <p className="text-[9px] font-bold text-[#8a806a] mb-1.5 uppercase tracking-wider">Instructions for Pilot</p>
                                                                <div className="whitespace-pre-wrap leading-relaxed text-slate-700">
                                                                    {msg.data?.pilot_message}
                                                                </div>
                                                            </div>

                                                            <div className="h-[170px] w-full rounded-xl overflow-hidden border border-[#e5dfd3] bg-[#f4f1ea] relative group">
                                                                <div className="absolute top-2.5 right-2.5 z-10 bg-white/90 backdrop-blur px-2 py-0.5 rounded-lg text-[8px] font-bold border border-[#e5dfd3] shadow-sm flex items-center gap-1.5">
                                                                    <div className="w-1.5 h-1.5 bg-[#c26244] rounded-full animate-pulse" /> LIVE TELEMETRY
                                                                </div>
                                                                {userLocation ? (
                                                                    <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-500 font-semibold bg-[#f4f1ea]">
                                                                        Map Coordinates: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                                                                    </div>
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400 animate-pulse bg-[#f4f1ea]">
                                                                        Syncing coordinates...
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="w-full text-xs h-9 font-bold bg-white hover:bg-[#f7f5f0] text-slate-700 rounded-xl border-[#e5dfd3]"
                                                                onClick={() => setIsOpen(false)}
                                                            >
                                                                Minimize Aero Hub
                                                            </Button>
                                                        </div>
                                                     </div>
                                                ) : renderFormattedContent(msg.content)}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Typing indicator */}
                                    {(isLoading || ['SEARCHING', 'BOOKING'].includes(chatState)) && (
                                        <div className="flex justify-start items-center gap-3.5 animate-in fade-in duration-300">
                                            <div className="h-8 w-8 rounded-xl bg-[#f0ede4] border border-[#e5dfd3] flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
                                                {/* Premium 3D Helix Rotating Rings Loader inside the avatar button */}
                                                <div className="h-4.5 w-4.5 flex items-center justify-center relative [perspective:800px] [transform-style:preserve-3d]">
                                                    {/* Outer Helix Ring (Slanted Right, Spins Forward) */}
                                                    <div className="absolute inset-0 rounded-full border-[1.2px] border-t-[#c26244] border-r-indigo-500 border-b-transparent border-l-transparent animate-helix-ring-1" />
                                                    
                                                    {/* Inner Helix Ring (Slanted Left, Spins Backward) */}
                                                    <div className="absolute inset-0 rounded-full border-[1.2px] border-t-purple-500 border-l-[#c26244] border-b-transparent border-r-transparent animate-helix-ring-2" />
                                                    
                                                    {/* Interlocking Core Ring */}
                                                    <div className="absolute inset-0.5 rounded-full border-[0.8px] border-b-indigo-500 border-l-blue-500 border-t-transparent border-r-transparent animate-helix-ring-3" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-[10px] text-[#8a806a] font-bold uppercase tracking-wider pl-0.5">Aero coordinating...</span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={scrollRef} />
                                </div>
                             </ScrollArea>

                            {/* Minimalist Floating Input Box */}
                            <div className="p-4.5 border-t border-[#e5dfd3] bg-[#fbfaf7]">
                                <form
                                    className="flex gap-2 bg-white border border-[#e5dfd3] focus-within:border-[#c26244] rounded-2xl p-1.5 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                                    onSubmit={(e) => {
                                        e.preventDefault()
                                        handleSend()
                                    }}
                                >
                                    <Input
                                        placeholder="Ask aero to book a pilot..."
                                        className="bg-transparent border-none text-[#191919] placeholder:text-[#8a806a]/50 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 px-2 text-[13.5px] w-full"
                                        value={inputValue}
                                        onChange={e => setInputValue(e.target.value)}
                                        disabled={['SEARCHING', 'BOOKING'].includes(chatState)}
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        className="h-10 w-10 shrink-0 rounded-xl bg-[#c26244] hover:bg-[#a95237] text-white shadow-sm transition-all duration-300 border-none active:scale-95"
                                        disabled={!inputValue.trim() || ['SEARCHING', 'BOOKING'].includes(chatState)}
                                    >
                                        <Send className="h-4.5 w-4.5" />
                                    </Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Main Floating Trigger Button (Claude Premium Minimal Circle) */}
                <div className="relative group">
                    <Button
                        onClick={() => isOpen ? setIsOpen(false) : handleOpen()}
                        size="lg"
                        className={`relative h-13 w-13 rounded-full shadow-[0_12px_30px_rgba(28,26,22,0.12)] p-0 hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden border border-[#e5dfd3] z-[50]
                            ${isOpen ? 'bg-[#f0ede4]' : 'bg-[#fbfaf7]'}
                        `}
                    >
                        {isOpen ? (
                            <X className="h-5 w-5 text-[#8a806a]" />
                        ) : (
                            <div className="relative flex items-center justify-center h-8 w-8">
                                {/* Custom Aero Logo SVG */}
                                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                                    <defs>
                                        <linearGradient id="aeroLogoGradientTrigger" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#9edbf9" />
                                            <stop offset="25%" stopColor="#a0cbf7" />
                                            <stop offset="60%" stopColor="#e8a8b5" />
                                            <stop offset="100%" stopColor="#8b5cf6" />
                                        </linearGradient>
                                        <mask id="aeroLogoMaskTrigger">
                                            <rect x="0" y="0" width="100" height="100" fill="white" />
                                            <rect x="44" y="32" width="12" height="36" rx="6" fill="black" />
                                            <rect x="30" y="44" width="40" height="12" rx="6" fill="black" />
                                        </mask>
                                    </defs>
                                    <path d="M 50,12 C 58,12 64,18 70,28 L 88,60 C 95,73 85,84 72,84 C 64,84 59,77 59,69 C 59,62 55,58 50,58 C 45,58 41,62 41,69 C 41,77 36,84 28,84 C 15,84 5,73 12,60 L 30,28 C 36,18 42,12 50,12 Z" fill="url(#aeroLogoGradientTrigger)" mask="url(#aeroLogoMaskTrigger)" />
                                </svg>
                            </div>
                        )}
                    </Button>
                </div>
            </div>

            {/* Booking Confirmation Dialog */}
            <BookingConfirmDialog
                isOpen={showConfirmDialog}
                onConfirm={processBookingAfterConfirm}
                onCancel={() => {
                    setShowConfirmDialog(false)
                    setPendingBookingPilot(null)
                }}
                pilotName={pendingBookingPilot?.full_name}
                pilotHourlyRate={pendingBookingPilot?.hourly_rate}
                currentUser={currentUser}
            />

            {/* Booking Details Dialog (shown after successful booking) */}
            <BookingDetailsDialog
                isOpen={showDetailsDialog}
                onClose={() => {
                    setShowDetailsDialog(false)
                    setCompletedBookingDetails(null)
                }}
                booking={completedBookingDetails}
            />

            {/* Booking Limit Reached Dialog */}
            <BookingLimitReachedDialog
                isOpen={showLimitDialog}
                onClose={() => {
                    setShowLimitDialog(false)
                    setPendingBookingPilot(null)
                }}
                maxBookings={bookingLimitData?.maxBookings || 2}
                existingBookings={bookingLimitData?.bookings || []}
            />
        </>
    )
}
