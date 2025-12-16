'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, MapPin, User, Calendar, Clock, CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import { getCurrentUser, getNearbyPilots, createBooking, DronePilot } from '@/lib/supabase'
import { sendBookingNotification } from '@/lib/notifications'

type ChatState = 'INIT' | 'REQUIREMENTS' | 'LOCATION' | 'SEARCHING' | 'RESULTS' | 'CONFIRM' | 'BOOKING' | 'SUCCESS' | 'ERROR'

interface Message {
    id: string
    role: 'bot' | 'user'
    content: string | React.ReactNode
}

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
    const { toast } = useToast()

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    useEffect(() => {
        // Check auth on load
        getCurrentUser().then(user => {
            setCurrentUser(user)
        })
    }, [])

    const addMessage = (role: 'bot' | 'user', content: string | React.ReactNode) => {
        setMessages(prev => [...prev, { id: Math.random().toString(36), role, content }])
    }

    const handleOpen = () => {
        setIsOpen(true)
        if (messages.length === 0) {
            addMessage('bot', "Hello! I'm your AeroHive assistant. I can help you find nearby drone pilots and book their services. To get started, please tell me what kind of drone service you are looking for (e.g., 'Wedding photography', 'Surveying', 'Inspection').")
            setChatState('REQUIREMENTS')
        }
    }

    const handleSend = async () => {
        if (!inputValue.trim()) return

        const userMsg = inputValue
        setInputValue('')
        addMessage('user', userMsg)

        if (chatState === 'REQUIREMENTS') {
            setRequirements(userMsg)
            setChatState('LOCATION')
            addMessage('bot', (
                <div className="flex flex-col gap-2">
                    <span>Great! To find the best pilots near you, I need your location.</span>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="w-full flex items-center gap-2"
                        onClick={requestLocation}
                    >
                        <MapPin className="h-4 w-4" />
                        Share My Location
                    </Button>
                </div>
            ))
        }
    }

    const requestLocation = () => {
        if (!navigator.geolocation) {
            addMessage('bot', "Geolocation is not supported by your browser. Please chat with support manually.")
            setChatState('ERROR')
            return
        }

        addMessage('user', "Sharing location...")
        setChatState('SEARCHING')

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                setUserLocation({ lat: latitude, lng: longitude })

                // Find pilots
                addMessage('bot', "Thank you! Searching for pilots within 10km...")

                try {
                    // Fake delay for effect
                    await new Promise(r => setTimeout(r, 1500))

                    const pilots = await getNearbyPilots(latitude, longitude, 10) // 10km default
                    setFoundPilots(pilots)

                    if (pilots.length === 0) {
                        addMessage('bot', "I couldn't find any pilots within 10km radius. Would you like to expand the search?")
                        // In a real app we'd handle expanding search
                        setChatState('ERROR')
                    } else {
                        setChatState('RESULTS')
                        addMessage('bot', (
                            <div className="flex flex-col gap-2">
                                <span>I found {pilots.length} pilot(s) near you! Here are the best matches:</span>
                                <div className="flex flex-col gap-2 mt-2">
                                    {pilots.map(pilot => (
                                        <Card key={pilot.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => handleSelectPilot(pilot)}>
                                            <CardContent className="p-3 flex items-start gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                    {pilot.profile_image_url ? (
                                                        <img src={pilot.profile_image_url} alt={pilot.full_name} className="h-10 w-10 rounded-full object-cover" />
                                                    ) : (
                                                        <User className="h-5 w-5 text-primary" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm">{pilot.full_name}</p>
                                                    <p className="text-xs text-muted-foreground">{pilot.specializations}</p>
                                                    <p className="text-xs font-medium mt-1">${pilot.hourly_rate}/hr • {pilot.rating} ★</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))
                    }
                } catch (e) {
                    console.error(e)
                    addMessage('bot', "Something went wrong while searching for pilots.")
                    setChatState('ERROR')
                }
            },
            (error) => {
                console.error(error)
                addMessage('bot', "I couldn't get your location. Please check your browser permissions.")
                setChatState('ERROR')
            }
        )
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
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Location: Your shared location</div>
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
        addMessage('bot', <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Processing your booking...</div>)

        try {
            const bookingData = {
                client_id: currentUser.id,
                pilot_id: pilot.id,
                status: 'confirmed' as const,
                scheduled_at: new Date().toISOString(),
                duration_hours: 2, // Hardcoded for demo
                client_location_lat: userLocation.lat,
                client_location_lng: userLocation.lng,
                client_notes: requirements,
                total_amount: pilot.hourly_rate * 2
            }

            const booking = await createBooking(bookingData)

            // Send notifications mock
            await sendBookingNotification(booking, pilot, {
                name: currentUser.first_name || 'Valued Client',
                phone: currentUser.phone || 'N/A'
            })

            setChatState('SUCCESS')
            addMessage('bot', (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-green-600 font-bold">
                        <CheckCircle className="h-5 w-5" /> Booking Confirmed!
                    </div>
                    <p className="text-sm">We have sent a confirmation details to your registered data and the pilot.</p>
                    <div className="p-3 bg-muted rounded-md text-xs space-y-1">
                        <p><strong>Pilot:</strong> {pilot.full_name}</p>
                        <p><strong>Booking ID:</strong> {booking.id.slice(0, 8)}</p>
                        <p><strong>Contact:</strong> 🔒 Secure details sent via SMS</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>Close Chat</Button>
                </div>
            ))

        } catch (e) {
            console.error(e)
            addMessage('bot', "There was an error creating your booking. Please try again.")
            setChatState('ERROR')
        }
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
            {isOpen && (
                <Card className="w-[350px] mb-4 shadow-xl border-primary/20 animate-in slide-in-from-bottom-5 bg-white">
                    <div className="p-3 border-b flex items-center justify-between bg-primary text-primary-foreground rounded-t-lg">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-1 rounded-full"><MessageCircle className="h-4 w-4" /></div>
                            <span className="font-semibold text-sm">AeroHive Support</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <CardContent className="p-0">
                        <ScrollArea className="h-[400px] p-4">
                            <div className="flex flex-col gap-4">
                                {messages.map(msg => (
                                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-lg p-3 text-sm ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-br-none'
                                            : 'bg-muted text-foreground rounded-bl-none'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        <div className="p-3 border-t bg-background mt-auto">
                            <form
                                className="flex gap-2"
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    handleSend()
                                }}
                            >
                                <Input
                                    placeholder="Type a message..."
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    disabled={['LOCATION', 'SEARCHING', 'RESULTS', 'CONFIRM', 'BOOKING'].includes(chatState)}
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!inputValue.trim() || ['LOCATION', 'SEARCHING', 'RESULTS', 'CONFIRM', 'BOOKING'].includes(chatState)}
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Button
                onClick={() => isOpen ? setIsOpen(false) : handleOpen()}
                size="lg"
                className="h-14 w-14 rounded-full shadow-lg p-0 hover:scale-110 transition-transform"
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
            </Button>
        </div>
    )
}
