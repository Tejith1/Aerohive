'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { MessageCircle, X, Send, MapPin, User, Calendar, Clock, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { getCurrentUser, getNearbyPilots, createBooking, DronePilot } from '@/lib/supabase'
import { sendBookingNotification } from '@/lib/notifications'

type ChatState = 'INIT' | 'REQUIREMENTS' | 'LOCATION' | 'RADIUS' | 'SEARCHING' | 'RESULTS' | 'CONFIRM' | 'BOOKING' | 'SUCCESS' | 'ERROR'

interface Message {
    id: string
    role: 'bot' | 'user'
    content: string | React.ReactNode
}

import type { MissionMapProps } from './MissionMap'

// Dynamic import for Leaflet (SSR safe)
const MissionMap = dynamic<MissionMapProps>(() => import('./MissionMap'), {
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-muted animate-pulse rounded-md flex items-center justify-center text-xs">Initializing Mission Map...</div>
})

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
    const scrollRef = useRef<HTMLDivElement>(null)
    const [userAddress, setUserAddress] = useState<string>('')
    const { toast } = useToast()

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    const [trackingData, setTrackingData] = useState<{ lat: number, lng: number } | null>(null)
    const socketRef = useRef<WebSocket | null>(null)

    useEffect(() => {
        // Check auth on load
        getCurrentUser().then(user => {
            setCurrentUser(user)
        })

        return () => {
            if (socketRef.current) socketRef.current.close()
        }
    }, [])

    const startTracking = (bookingId: string) => {
        if (socketRef.current) socketRef.current.close()

        const wsUrl = `ws://localhost:8000/ws/tracking/${bookingId}`
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

    const addMessage = (role: 'bot' | 'user', content: string | React.ReactNode) => {
        setMessages(prev => [...prev, { id: Math.random().toString(36), role, content }])
    }

    const handleOpen = async () => {
        setIsOpen(true)
        if (messages.length === 0) {
            try {
                // Initial call to backend to get greeting
                const res = await callBackend("hello", "INIT")
                addMessage('bot', res.message)
                setChatState(res.next_state as ChatState)
            } catch (e) {
                console.error("Backend offline, falling back", e)
                addMessage('bot', "Hello! I'm your AeroHive assistant. (Offline Mode)")
                setChatState('REQUIREMENTS')
            }
        }
    }

    const callBackend = async (msg: string, state: ChatState, context?: any) => {
        try {
            const fullContext = {
                lat: userLocation?.lat,
                lng: userLocation?.lng,
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

    const handleSend = async () => {
        if (!inputValue.trim()) return

        const userMsg = inputValue
        setInputValue('')
        addMessage('user', userMsg)

        try {
            // General handling via Backend
            const res = await callBackend(userMsg, chatState, {
                lat: userLocation?.lat,
                lng: userLocation?.lng,
                requirements: requirements
            })

            addMessage('bot', res.message)

            // Capture location if returned by backend (e.g. from text-based extraction)
            if (res.data?.lat && res.data?.lng) {
                setUserLocation({ lat: res.data.lat, lng: res.data.lng })
            }

            setChatState(res.next_state as ChatState)

            // Handle actions returned by AI
            if (res.action === 'request_location') {
                setRequirements(userMsg)
                addMessage('bot', (
                    <div className="flex flex-col gap-2 mt-2">
                        <Button variant="secondary" size="sm" className="w-full flex items-center gap-2" onClick={requestLocation}>
                            <MapPin className="h-4 w-4" /> Share My Location
                        </Button>
                    </div>
                ))
            } else if (res.action === 'request_radius') {
                setChatState('RADIUS')
                addMessage('bot', (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {[10, 20, 50].map(r => (
                            <Button key={r} variant="outline" size="sm" onClick={() => handleSelectRadius(r)}>
                                {r} km
                            </Button>
                        ))}
                    </div>
                ))
            } else if (res.action === 'show_results' && res.data?.pilots) {
                const pilots = res.data.pilots
                setFoundPilots(pilots)
                addMessage('bot', (
                    <div className="flex flex-col gap-2 mt-2 max-h-[200px] overflow-y-auto pr-2">
                        {pilots.map((pilot: any) => (
                            <Card key={pilot.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSelectPilot(pilot)}>
                                <CardContent className="p-3 flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm truncate">{pilot.full_name}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">{pilot.specialization || pilot.specializations}</p>
                                        <p className="text-xs font-medium mt-1">${pilot.hourly_rate}/hr • {pilot.rating} ★</p>
                                        {pilot.distance_km != null && <p className="text-[10px] text-muted-foreground">{pilot.distance_km}km away</p>}
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

            try {
                // 1. Call backend immediately with coordinates (Fastest interaction)
                const aiRes = await callBackend("Location Shared", "LOCATION", { lat: latitude, lng: longitude })
                addMessage('bot', aiRes.message)
                setChatState(aiRes.next_state as ChatState)

                if (aiRes.action === 'request_radius' || aiRes.action === 'show_results') {
                    // The handleSend logic already handles these actions
                }

                // 2. Reverse geocode in background (UI enhancement only)
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                    const data = await res.json()
                    if (data.address) {
                        const city = data.address.city || data.address.town || ""
                        const state = data.address.state || ""
                        const addr = city && state ? `${city}, ${state}` : (city || state)
                        if (addr) setUserAddress(addr)
                    }
                } catch (err) {
                    console.error("Geocoding failed", err)
                }

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
        try {
            const res = await callBackend(`${radius}km`, 'RADIUS', { radius_km: radius })
            addMessage('bot', res.message)
            setChatState(res.next_state as ChatState)
            if (res.action === 'show_results' && res.data?.pilots) {
                const pilots = res.data.pilots
                setFoundPilots(pilots)
                addMessage('bot', (
                    <div className="flex flex-col gap-2 mt-2 max-h-[200px] overflow-y-auto pr-2">
                        {pilots.map((pilot: any) => (
                            <Card key={pilot.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSelectPilot(pilot)}>
                                <CardContent className="p-3 flex items-start gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm truncate">{pilot.full_name}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">{pilot.specialization || pilot.specializations}</p>
                                        <p className="text-xs font-medium mt-1">${pilot.hourly_rate}/hr • {pilot.rating} ★</p>
                                        {pilot.distance_km != null && <p className="text-[10px] text-muted-foreground">{pilot.distance_km}km away</p>}
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
        }
    }

    const handleSelectPilot = (pilot: DronePilot) => {
        setSelectedPilot(pilot)
        setChatState('CONFIRM')
        addMessage('bot', (
            <div className="flex flex-col gap-2">
                <span>You selected <strong>{pilot.full_name}</strong>.</span>
                <span>Please confirm the booking details:</span>
                <div className="p-3 border rounded-md bg-background text-sm space-y-2">
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Date: Today (ASAP)</div>
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> Duration: 2 Hours</div>
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Location: {userAddress || "Your shared location"}</div>
                    <div className="border-t pt-2 mt-2 font-bold">Total Estimate: ${pilot.hourly_rate * 2}</div>
                </div>
                {!currentUser ? (
                    <Button variant="destructive" className="w-full mt-2" onClick={() => window.location.href = '/login'}>
                        Log in to Book
                    </Button>
                ) : (
                    <Button className="w-full mt-2" onClick={() => processBooking(pilot)}>
                        Confirm & Book
                    </Button>
                )}
            </div>
        ))
    }

    const processBooking = async (pilot: DronePilot) => {
        if (!currentUser || !userLocation) return

        setChatState('BOOKING')
        addMessage('user', "Confirm & Book")
        addMessage('bot', <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Finalizing production booking...</div>)

        try {
            // Production API Call
            const bookingRes = await fetch('/api/bookings/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_id: currentUser.id,
                    pilot_id: pilot.id,
                    service_type: pilot.specializations || "General",
                    lat: userLocation.lat,
                    lng: userLocation.lng,
                    scheduled_at: new Date().toISOString(),
                    duration_hours: 2,
                    payment_method: 'UPI',
                    requirements: { note: requirements }
                })
            })

            const bookingDataRes = await bookingRes.json()
            if (!bookingRes.ok) throw new Error(bookingDataRes.detail || "Booking failed")

            setChatState('SUCCESS')
            startTracking(bookingDataRes.booking_id)

            addMessage('bot', (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600 font-bold">
                        <CheckCircle className="h-5 w-5" /> Mission Hub Initialized
                    </div>
                    <p className="text-xs">Mission <strong>{bookingDataRes.booking_id}</strong> is active. Our Pilot is receiving the coordinates.</p>

                    <div className="space-y-3 mt-2">
                        <div className="p-3 bg-muted rounded-md text-xs space-y-1">
                            <p><strong>Pilot:</strong> {pilot.full_name}</p>
                            <p><strong>System ID:</strong> {bookingDataRes.booking_id}</p>
                            <p className="text-[10px] text-blue-600 font-medium">✨ Live tracking active - Leaflet OSM</p>
                        </div>

                        <div className="h-[220px] w-full rounded-md overflow-hidden border bg-muted/20">
                            <MissionMap
                                pilotLocation={trackingData || { lat: pilot.latitude || 28.6139, lng: pilot.longitude || 77.2090 }}
                                clientLocation={userLocation}
                                bookingId={bookingDataRes.booking_id}
                            />
                        </div>

                        <Button variant="outline" size="sm" className="w-full flex items-center gap-2" onClick={() => setIsOpen(false)}>
                            Minimize Hub
                        </Button>
                    </div>
                </div>
            ))

        } catch (e: any) {
            console.error(e)
            addMessage('bot', (
                <div className="text-destructive text-xs p-2 bg-destructive/10 rounded-md">
                    <strong>Booking Failed:</strong> {e.message || "Unknown Error"}
                </div>
            ))
            setChatState('CONFIRM')
        }
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            {isOpen && (
                <Card className="w-[380px] mb-4 shadow-2xl border-primary/10 animate-in slide-in-from-bottom-5 bg-white/80 backdrop-blur-lg overflow-hidden flex flex-col">
                    <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm shadow-inner"><MessageCircle className="h-4 w-4" /></div>
                            <div>
                                <span className="font-bold text-sm block leading-none">AeroHive AI</span>
                                <span className="text-[10px] text-primary-foreground/70 uppercase tracking-widest font-medium">Principal Architect</span>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-white/10 rounded-full transition-colors" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <CardContent className="p-0 flex flex-col h-[480px]">
                        <ScrollArea className="flex-1 p-4">
                            <div className="flex flex-col gap-5">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[88%] rounded-2xl p-3.5 text-sm shadow-sm transition-all duration-200 ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-br-none'
                                            : 'bg-muted/50 text-foreground rounded-bl-none border border-border/50'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {['SEARCHING', 'BOOKING'].includes(chatState) && (
                                    <div className="flex justify-start">
                                        <div className="bg-muted/50 rounded-2xl px-4 py-2 border border-border/50 flex items-center gap-2">
                                            <span className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-1.5 h-1.5 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">AI Processing...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t bg-white/50 backdrop-blur-md">
                            <form
                                className="flex gap-2"
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    handleSend()
                                }}
                            >
                                <Input
                                    placeholder="Consult with Mission Coordinator..."
                                    className="bg-muted/30 border-none shadow-inner focus-visible:ring-1 focus-visible:ring-primary h-11"
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    disabled={['SEARCHING', 'BOOKING'].includes(chatState)}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    className="h-11 w-11 shrink-0 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                                    disabled={!inputValue.trim() || ['SEARCHING', 'BOOKING'].includes(chatState)}
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Button
                onClick={() => isOpen ? setIsOpen(false) : handleOpen()}
                size="lg"
                className="h-16 w-16 rounded-[22px] shadow-2xl p-0 hover:scale-110 active:scale-90 transition-all duration-300 bg-primary group overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                {isOpen ? <X className="h-7 w-7" /> : <MessageCircle className="h-8 w-8" />}
            </Button>
        </div>
    )
}
