"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
import { getDronePilots, DronePilot, supabase, getCurrentUser } from "@/lib/supabase"
import { BookingConfirmDialog } from "@/components/BookingConfirmDialog"
import { BookingDetailsDialog } from "@/components/BookingDetailsDialog"
import { BookingLimitReachedDialog } from "@/components/BookingLimitReachedDialog"
import { useToast } from "@/hooks/use-toast"
import { addBookingNotification } from "@/lib/action-notifications-store"
import {
  MapPin,
  Star,
  Award,
  Clock,
  Phone,
  Mail,
  Search,
  Filter,
  UserPlus,
  Plane,
  CheckCircle2,
  TrendingUp,
  Loader2,
  SlidersHorizontal
} from "lucide-react"
import { FAQSection } from "@/components/layout/faq-section"

const pilotFAQs = [
  {
    question: "How do you verify the pilots on your platform?",
    answer: "Every pilot must undergo a rigorous verification process, including background checks, certification validation, and flight skill assessments before being listed."
  },
  {
    question: "What is the booking process for a drone operator?",
    answer: "Browse our network, select a pilot, click 'Contact' to book. You'll receive details and an OTP. The pilot will then reach out to coordinate the mission."
  },
  {
    question: "How can I join the AeroHive pilot network?",
    answer: "Click the 'Register as a Drone Pilot' button above to fill out our application. Our team will review your credentials and contact you for next steps."
  }
]

export default function DronePilotsPage() {
  const [selectedLocation, setSelectedLocation] = useState("All Locations")
  const [selectedArea, setSelectedArea] = useState("All Areas")
  const [searchQuery, setSearchQuery] = useState("")
  const [pilots, setPilots] = useState<DronePilot[]>([])
  const [locations, setLocations] = useState<string[]>(["All Locations"])
  const [areas, setAreas] = useState<string[]>(["All Areas"])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // User and booking state
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showLimitDialog, setShowLimitDialog] = useState(false)
  const [bookingLimitData, setBookingLimitData] = useState<{
    canBook: boolean
    currentCount: number
    maxBookings: number
    bookings: any[]
  } | null>(null)
  const [pendingPilot, setPendingPilot] = useState<DronePilot | null>(null)
  const [completedBooking, setCompletedBooking] = useState<any>(null)
  const [bookingInProgress, setBookingInProgress] = useState(false)

  // Fetch current user on mount
  useEffect(() => {
    getCurrentUser().then(user => setCurrentUser(user))
  }, [])

  // Handle Contact button click - check limit and show confirm dialog
  const handleContactClick = async (pilot: DronePilot) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please log in to contact a drone pilot.",
        variant: "destructive"
      })
      window.location.href = '/login'
      return
    }

    setPendingPilot(pilot)

    try {
      const limitRes = await fetch(`/api/bookings/check-limit?userId=${currentUser.id}`)
      const limitData = await limitRes.json()
      setBookingLimitData(limitData)

      if (!limitData.canBook) {
        setShowLimitDialog(true)
        return
      }

      setShowConfirmDialog(true)
    } catch (err) {
      console.error('Error checking booking limit:', err)
      setBookingLimitData({ canBook: true, currentCount: 0, maxBookings: 2, bookings: [] })
      setShowConfirmDialog(true)
    }
  }

  // Process booking after confirmation
  const processBooking = async (bookingDetails: {
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
    if (!currentUser || !pendingPilot) return

    setShowConfirmDialog(false)
    setBookingInProgress(true)

    try {
      const bookingRes = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: currentUser.id,
          pilot_id: pendingPilot.id,
          service_type: pendingPilot.specializations || "General",
          lat: bookingDetails.lat || 0,
          lng: bookingDetails.lng || 0,
          location_name: bookingDetails.location,
          scheduled_at: bookingDetails.scheduledAt,
          duration_hours: bookingDetails.durationHours,
          payment_method: 'UPI',
          requirements: {},
          user_name: bookingDetails.userName,
          user_phone: bookingDetails.userPhone || currentUser.phone || '',
          user_email: bookingDetails.userEmail
        })
      })

      const bookingData = await bookingRes.json()
      if (!bookingRes.ok) throw new Error(bookingData.detail || "Booking failed")

      setCompletedBooking({
        bookingId: bookingData.booking_id,
        otp: bookingData.otp,
        serviceType: pendingPilot.specializations || "General",
        location: `${pendingPilot.area}, ${pendingPilot.location}`,
        scheduledAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        pilot: {
          id: pendingPilot.id,
          full_name: bookingData.pilot_name || pendingPilot.full_name,
          phone: bookingData.pilot_phone || pendingPilot.phone,
          email: bookingData.pilot_email || pendingPilot.email,
          rating: bookingData.pilot_rating || pendingPilot.rating
        }
      })

      setShowDetailsDialog(true)

      // Add notification to the notification bar with full booking data
      addBookingNotification({
        bookingId: bookingData.booking_id,
        otp: bookingData.otp,
        serviceType: pendingPilot.specializations || "General",
        location: `${pendingPilot.area}, ${pendingPilot.location}`,
        scheduledAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        pilot: {
          id: pendingPilot.id,
          full_name: bookingData.pilot_name || pendingPilot.full_name,
          phone: bookingData.pilot_phone || pendingPilot.phone,
          email: bookingData.pilot_email || pendingPilot.email,
          rating: bookingData.pilot_rating || pendingPilot.rating
        }
      })

      toast({
        title: "🎉 Booking Confirmed!",
        description: `You've booked ${pendingPilot.full_name}. Check your email for details.`
      })

    } catch (err: any) {
      console.error('Booking error:', err)
      toast({
        title: "Booking Failed",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setBookingInProgress(false)
    }
  }


  // Fetch all pilots and extract unique locations/areas
  useEffect(() => {
    fetchAllPilotsForFilters()
  }, [])

  useEffect(() => {
    fetchPilots()

    // Set up real-time subscription for drone pilots (only if supabase is initialized)
    if (!supabase) return

    const channel = supabase
      .channel('drone_pilots_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'drone_pilots'
        },
        (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => {
          console.log('Real-time pilot change detected:', payload)
          // Refresh the list when a change is detected
          fetchPilots()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedLocation, selectedArea, searchQuery])

  const fetchAllPilotsForFilters = async () => {
    try {
      // Fetch all pilots without filters to get unique locations and areas
      const allPilots = await getDronePilots({})

      // Extract unique locations
      const uniqueLocations = Array.from(new Set(allPilots.map(pilot => pilot.location))).sort()
      setLocations(["All Locations", ...uniqueLocations])

      // Extract unique areas
      const uniqueAreas = Array.from(new Set(allPilots.map(pilot => pilot.area))).sort()
      setAreas(["All Areas", ...uniqueAreas])
    } catch (err) {
      console.error('Error fetching filter options:', err)
    }
  }

  const fetchPilots = async () => {
    try {
      setLoading(true)
      const data = await getDronePilots({
        location: selectedLocation !== "All Locations" ? selectedLocation : undefined,
        area: selectedArea !== "All Areas" ? selectedArea : undefined,
        search: searchQuery || undefined
      })
      setPilots(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching pilots:', err)
      setError('Failed to load drone pilots')
    } finally {
      setLoading(false)
    }
  }

  const filteredPilots = pilots

  // Helper function to parse comma-separated strings to arrays with fallback sanitization
  const parseArray = (str: string | null | undefined, fallbackType?: 'specializations' | 'certifications'): string[] => {
    if (!str) {
      return fallbackType === 'specializations'
        ? ["Aerial Cinematography", "Surveillance Mapping"]
        : ["FAA Part 107", "DGCA Certified"];
    }
    const arr = str.split(',').map(item => item.trim()).filter(item => item.length > 0);
    const cleaned = arr.filter(item => !/^\d+$/.test(item) && item.toLowerCase() !== "n/a" && item.toLowerCase() !== "none");
    if (cleaned.length === 0) {
      return fallbackType === 'specializations'
        ? ["Aerial Cinematography", "Surveillance Mapping"]
        : ["FAA Part 107", "DGCA Certified"];
    }
    return cleaned;
  }

  // Generate dynamic premium SVG avatars for pilots with initials
  const getAvatarFallback = (name: string) => {
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%230f172a"/><circle cx="50" cy="50" r="38" fill="%23cc6543" opacity="0.12"/><text x="50" y="55" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="28" font-weight="600" fill="%23cc6543" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
  }

  return (
    <>
      <ModernHeader />
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        {/* Elegant Editorial Hero Section */}
        <section className="relative pt-28 lg:pt-36 pb-20 overflow-hidden text-center">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.01] pointer-events-none"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Custom Pilot HUD Logo */}
              <div className="flex justify-center mb-2">
                <svg className="w-20 h-20 text-primary animate-pulse" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {/* Wings left */}
                  <path d="M10 50 C20 40, 35 45, 45 50 C35 55, 20 52, 10 50 Z" />
                  <path d="M15 45 C23 38, 33 42, 40 47" />
                  {/* Wings right */}
                  <path d="M90 50 C80 40, 65 45, 55 50 C65 55, 80 52, 90 50 Z" />
                  <path d="M85 45 C77 38, 67 42, 60 47" />
                  {/* Center pilot helmet & HUD visor */}
                  <circle cx="50" cy="50" r="12" className="stroke-primary fill-background" />
                  <path d="M41 50 Q50 38 59 50 Q50 54 41 50 Z" fill="currentColor" fillOpacity="0.2" className="stroke-primary" />
                  {/* Center HUD crosshair */}
                  <circle cx="50" cy="48" r="2" className="fill-primary" />
                  <path d="M50 38 V42" />
                  <path d="M50 58 V62" />
                </svg>
              </div>

              {/* Subtle top indicator */}
              <div className="inline-flex items-center justify-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
                <span className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase font-mono">
                  // OPERATOR NETWORK
                </span>
              </div>
              
              {/* Beautiful editorial headline */}
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-normal tracking-tight font-display text-foreground leading-tight">
                Connect with professional operators
              </h1>
              
              {/* Large book-like summary */}
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-sans font-light">
                Find verified, licensed, and highly-experienced drone pilots in your area for custom aerial cinematography, structural surveying, thermal inspection, and precision mapping.
              </p>

              {/* Pilot Registration & Login Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-foreground hover:bg-primary text-background rounded-full px-6 py-3.5 text-sm font-medium transition-all duration-300 border-0"
                >
                  <Link href="/drone-pilots/register">
                    Register as a Drone Pilot
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border border-border text-foreground hover:bg-muted rounded-full px-6 py-3.5 text-sm font-medium transition-all duration-300 bg-card/50 backdrop-blur-sm"
                >
                  <Link href="/pilot-panel/login">
                    Pilot Login
                  </Link>
                </Button>
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground font-sans tracking-wide uppercase sm:ml-4">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                  <span>{pilots.length}+ Certified Pilots Available</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="container mx-auto px-6 -mt-8 mb-12 relative z-20">
          <Card className="border border-border bg-card/75 backdrop-blur-md rounded-2xl shadow-sm p-2">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search Input */}
                <div className="relative md:col-span-2">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by name or specialization..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 h-12 rounded-full border-border bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary transition-all font-sans text-sm"
                  />
                </div>

                {/* Location Filter */}
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-full border border-border focus:ring-1 focus:ring-primary focus:border-primary bg-background text-foreground appearance-none cursor-pointer font-sans text-sm transition-all"
                  >
                    {locations.map(loc => (
                      <option key={loc} value={loc} className="bg-background">{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Area Filter */}
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-full border border-border focus:ring-1 focus:ring-primary focus:border-primary bg-background text-foreground appearance-none cursor-pointer font-sans text-sm transition-all"
                  >
                    {areas.map(area => (
                      <option key={area} value={area} className="bg-background">{area}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filters Display */}
              {(selectedLocation !== "All Locations" || selectedArea !== "All Areas" || searchQuery) && (
                <div className="mt-4 flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-sans">Active Filters:</span>
                  {selectedLocation !== "All Locations" && (
                    <Badge variant="secondary" className="rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-sans text-xs px-3 py-1 border-0">
                      {selectedLocation}
                      <button onClick={() => setSelectedLocation("All Locations")} className="ml-2 font-bold hover:text-red-600">×</button>
                    </Badge>
                  )}
                  {selectedArea !== "All Areas" && (
                    <Badge variant="secondary" className="rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-sans text-xs px-3 py-1 border-0">
                      {selectedArea}
                      <button onClick={() => setSelectedArea("All Areas")} className="ml-2 font-bold hover:text-red-600">×</button>
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="secondary" className="rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-sans text-xs px-3 py-1 border-0">
                      Search: {searchQuery}
                      <button onClick={() => setSearchQuery("")} className="ml-2 font-bold hover:text-red-600">×</button>
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Results Section */}
        <section className="container mx-auto px-6 pb-20">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-serif font-normal text-slate-800 dark:text-slate-200">
              {loading ? 'Searching network...' : `${filteredPilots.length} pilot${filteredPilots.length !== 1 ? 's' : ''} found`}
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6 bg-white/40 dark:bg-[#121215]/60 backdrop-blur-sm rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-sm max-w-lg mx-auto animate-pulse matrix-scanner">
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Glowing Radar Sweep Ring */}
                <div className="absolute inset-0 rounded-full border border-[#069494]/10 dark:border-[#069494]/20 animate-ping opacity-60"></div>
                <div className="absolute inset-2 rounded-full border border-[#FF8243]/20 dark:border-[#FF8243]/30 animate-pulse"></div>
                
                {/* Custom Miniature Perspective Animated Drone Loader */}
                <svg className="w-16 h-16 text-[#069494] animate-bounce" style={{ animationDuration: '2s' }} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Guards */}
                  <ellipse cx="30" cy="35" rx="14" ry="5.5" stroke="currentColor" strokeWidth="2" opacity="0.6" />
                  <ellipse cx="70" cy="35" rx="14" ry="5.5" stroke="currentColor" strokeWidth="2" opacity="0.6" />
                  <ellipse cx="20" cy="65" rx="18" ry="7" stroke="currentColor" strokeWidth="2.5" />
                  <ellipse cx="80" cy="65" rx="18" ry="7" stroke="currentColor" strokeWidth="2.5" />
                  
                  {/* Arms */}
                  <path d="M50 48 L30 35 M50 48 L70 35 M50 48 L20 65 M50 48 L80 65" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
                  
                  {/* Center Body */}
                  <path d="M44 43 C44 40, 56 40, 56 43 L54 57 C54 60, 46 60, 46 57 Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="50" cy="47" r="2.5" fill="#FF8243" />
                  
                  {/* High Speed Rotor Animations */}
                  <style>{`
                    @keyframes loader-spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                    .l-rotor { animation: loader-spin 0.05s linear infinite; }
                    .l-rotor-rev { animation: loader-spin 0.04s linear infinite reverse; }
                  `}</style>
                  
                  {/* TL Propeller */}
                  <g transform="translate(30, 35) scale(1, 0.38)">
                    <g className="l-rotor" style={{ transformOrigin: '0px 0px' }}>
                      <path d="M-13 0 H13" stroke="#FF8243" strokeWidth="2.5" />
                    </g>
                  </g>
                  {/* TR Propeller */}
                  <g transform="translate(70, 35) scale(1, 0.38)">
                    <g className="l-rotor-rev" style={{ transformOrigin: '0px 0px' }}>
                      <path d="M-13 0 H13" stroke="currentColor" strokeWidth="2.5" />
                    </g>
                  </g>
                  {/* BL Propeller */}
                  <g transform="translate(20, 65) scale(1, 0.4)">
                    <g className="l-rotor-rev" style={{ transformOrigin: '0px 0px' }}>
                      <path d="M-17 0 H17" stroke="currentColor" strokeWidth="3" />
                    </g>
                  </g>
                  {/* BR Propeller */}
                  <g transform="translate(80, 65) scale(1, 0.4)">
                    <g className="l-rotor" style={{ transformOrigin: '0px 0px' }}>
                      <path d="M-17 0 H17" stroke="#FF8243" strokeWidth="3" />
                    </g>
                  </g>
                </svg>
              </div>
              <div className="text-center space-y-1">
                <p className="text-base font-serif italic text-slate-800 dark:text-slate-200 tracking-wide">DGCA Telemetry Uplink Active...</p>
                <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">Synchronizing operator logbooks</p>
              </div>
            </div>
          ) : error ? (
            <Card className="text-center py-16 border border-red-100 dark:border-red-950 bg-red-50/50 dark:bg-red-950/20 rounded-3xl">
              <CardContent>
                <p className="text-red-600 dark:text-red-400 font-serif mb-4">{error}</p>
                <Button onClick={fetchPilots} variant="outline" className="rounded-full border-red-200 dark:border-red-900">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : filteredPilots.length === 0 ? (
            <Card className="text-center py-16 border border-slate-100/50 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.015)] bg-white dark:bg-slate-900 rounded-[28px]">
              <CardContent>
                <div className="w-16 h-16 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <SlidersHorizontal className="h-6 w-6 text-slate-400 dark:text-slate-500 stroke-[1.5]" />
                </div>
                <h3 className="text-2xl font-serif font-normal text-slate-900 dark:text-slate-100 mb-2">No Pilots Found</h3>
                <p className="text-slate-650 dark:text-slate-450 font-serif mb-6">Try adjusting your filters or search criteria to view active crew.</p>
                <Button
                  onClick={() => {
                    setSelectedLocation("All Locations")
                    setSelectedArea("All Areas")
                    setSearchQuery("")
                  }}
                  variant="outline"
                  className="rounded-full font-sans text-xs font-semibold uppercase tracking-wider dark:border-slate-800"
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPilots.map((pilot) => (
                <div 
                  key={pilot.id} 
                  className="group relative bg-[#ffffff]/70 dark:bg-[#0f172a]/55 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 hover:border-primary/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] rounded-3xl transition-all duration-500 overflow-hidden flex flex-col justify-between p-6"
                >
                  {/* Top-Right Experience Badge */}
                  <div className="absolute top-6 right-6 z-10">
                    <span className="inline-block px-3 py-1 bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/60 text-[10px] font-bold text-muted-foreground rounded-full font-mono uppercase tracking-wider shadow-sm">
                      {pilot.experience}
                    </span>
                  </div>
 
                  <div>
                    {/* Header Info Block */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <img
                          src={pilot.profile_image_url || getAvatarFallback(pilot.full_name)}
                          alt={pilot.full_name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getAvatarFallback(pilot.full_name);
                          }}
                          className="h-16 w-16 rounded-2xl object-cover border border-slate-250/60 dark:border-slate-850/60 shadow-sm transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute -bottom-1 -right-1 h-5.5 w-5.5 rounded-full bg-primary border-2 border-background flex items-center justify-center shadow-md">
                          <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-primary transition-colors duration-300 font-display">
                            {pilot.full_name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-primary font-mono uppercase tracking-wider">
                          <MapPin className="h-3 w-3" />
                          <span>{pilot.area}, {pilot.location}</span>
                        </div>
                      </div>
                    </div>
 
                    {/* Stats section */}
                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-slate-150/40 dark:border-slate-800/40 mb-6 bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl px-4">
                      <div className="space-y-0.5">
                        <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider font-mono">Rating</p>
                        <div className="flex items-center gap-1 text-slate-800 dark:text-slate-100 font-bold text-xs font-mono">
                          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                          <span>{pilot.rating || "5.0"}</span>
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider font-mono">Missions</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">
                          {pilot.completed_jobs} Completed
                        </p>
                      </div>
                    </div>
 
                    {/* Certifications / Accreditations */}
                    <div className="space-y-2 mb-4">
                      <h4 className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">Licenses & Certifications</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {parseArray(pilot.certifications, 'certifications').map((cert, idx) => (
                          <span 
                            key={idx} 
                            className="inline-block text-[10px] font-mono px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-muted-foreground rounded-xl shadow-sm"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
 
                    {/* Specializations */}
                    <div className="space-y-2 mb-6">
                      <h4 className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">Operations Focus</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {parseArray(pilot.specializations, 'specializations').map((spec, idx) => (
                          <span 
                            key={idx} 
                            className="inline-block text-[10px] font-mono px-2.5 py-1 bg-primary/5 border border-primary/10 text-primary rounded-xl font-medium"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
 
                  {/* Hourly Rate & CTA Button Footer */}
                  <div className="pt-4 border-t border-slate-150/40 dark:border-slate-800/40 flex items-center justify-between mt-auto">
                    <div>
                      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider font-mono">Hourly Rate</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
                        ₹{pilot.hourly_rate}
                        <span className="text-xs text-muted-foreground font-normal">/hr</span>
                      </p>
                    </div>
                    <Button
                      className="bg-foreground hover:bg-primary text-background dark:bg-foreground dark:hover:bg-primary dark:text-background dark:hover:text-primary-foreground rounded-full px-5 py-2 text-xs font-semibold tracking-wide transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-sm border-0"
                      onClick={() => handleContactClick(pilot)}
                      disabled={bookingInProgress}
                    >
                      {bookingInProgress && pendingPilot?.id === pilot.id ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          Booking...
                        </>
                      ) : (
                        'Hire Crew'
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Premium Claude-Style Capabilities Section */}
        <section className="container mx-auto px-6 pb-24">
          <div className="border-t border-border pt-16">
            
            {/* Header */}
            <div className="max-w-3xl text-left mb-16 space-y-4">
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.25em] font-sans">
                Core Capabilities
              </span>
              <h2 className="text-4xl md:text-5xl font-serif text-foreground font-normal leading-tight">
                AeroHive Airspace Capabilities
              </h2>
              <p className="text-lg text-muted-foreground font-light font-serif italic">
                Architected for high-fidelity civilian flight coordination and mission-critical commercial analytics.
              </p>
            </div>

            {/* Grid Layout inspired by Claude's clean, humanist layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              
              {/* Column 1: Cinematography */}
              <div className="space-y-6 flex flex-col justify-between p-4 rounded-3xl hover:bg-card/75 border border-transparent hover:border-border/50 backdrop-blur-sm transition-all duration-300">
                <div className="space-y-5">
                  <div className="h-10 w-10 bg-foreground text-background rounded-xl flex items-center justify-center">
                    <Plane className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-serif font-normal text-foreground">
                    Cinematography
                  </h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed font-sans">
                    Deploy high-end cinematic quadcopters for seamless, broadcast-ready dynamic filming. Capture stunning RAW video feeds with calibrated color profiling.
                  </p>
                </div>
                <Button variant="outline" className="border-border hover:bg-foreground hover:text-background text-foreground rounded-full px-5 py-2 text-xs font-semibold tracking-wide transition-colors self-start mt-4">
                  Learn more
                </Button>
              </div>

              {/* Column 2: Industrial Surveying */}
              <div className="space-y-6 flex flex-col justify-between p-4 rounded-3xl hover:bg-card/75 border border-transparent hover:border-border/50 backdrop-blur-sm transition-all duration-300">
                <div className="space-y-5">
                  <div className="h-10 w-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center">
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-serif font-normal text-foreground">
                    Industrial Surveying
                  </h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed font-sans">
                    Conduct deep structure audits, automated thermal leak isolation, and high-frequency elevation analytics with minimal physical setup.
                  </p>
                </div>
                <Button variant="outline" className="border-border hover:bg-foreground hover:text-background text-foreground rounded-full px-5 py-2 text-xs font-semibold tracking-wide transition-colors self-start mt-4">
                  Learn more
                </Button>
              </div>

              {/* Column 3: Precision Mapping */}
              <div className="space-y-6 flex flex-col justify-between p-4 rounded-3xl hover:bg-card/75 border border-transparent hover:border-border/50 backdrop-blur-sm transition-all duration-300">
                <div className="space-y-5">
                  <div className="h-10 w-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-serif font-normal text-foreground">
                    Precision Mapping
                  </h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed font-sans">
                    Generate millimetric elevation maps, multispectral crop analytics, and real-time absolute coordinate grids integrated instantly to GIS.
                  </p>
                </div>
                <Button variant="outline" className="border-border hover:bg-foreground hover:text-background text-foreground rounded-full px-5 py-2 text-xs font-semibold tracking-wide transition-colors self-start mt-4">
                  Learn more
                </Button>
              </div>

              {/* Column 4: Airspace Compliance */}
              <div className="space-y-6 flex flex-col justify-between p-4 rounded-3xl hover:bg-card/75 border border-transparent hover:border-border/50 backdrop-blur-sm transition-all duration-300">
                <div className="space-y-5">
                  <div className="h-10 w-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-serif font-normal text-foreground">
                    Compliance Ops
                  </h3>
                  <p className="text-sm text-muted-foreground font-light leading-relaxed font-sans">
                    Guaranteed digital flight authorization checks, active regulator compliance validations, and certified flight crew logs maintained automatically.
                  </p>
                </div>
                <Button variant="outline" className="border-border hover:bg-foreground hover:text-background text-foreground rounded-full px-5 py-2 text-xs font-semibold tracking-wide transition-colors self-start mt-4">
                  Learn more
                </Button>
              </div>

            </div>
          </div>
        </section>
      </div>
      <FAQSection pageName="Drone Pilots" customFAQs={pilotFAQs} />
      <ModernFooter />

      {/* Booking Confirmation Dialog */}
      <BookingConfirmDialog
        isOpen={showConfirmDialog}
        onConfirm={processBooking}
        onCancel={() => {
          setShowConfirmDialog(false)
          setPendingPilot(null)
        }}
        pilotName={pendingPilot?.full_name}
        pilotHourlyRate={pendingPilot?.hourly_rate}
        currentUser={currentUser}
      />

      {/* Booking Details Dialog */}
      <BookingDetailsDialog
        isOpen={showDetailsDialog}
        onClose={() => {
          setShowDetailsDialog(false)
          setCompletedBooking(null)
          setPendingPilot(null)
        }}
        booking={completedBooking}
      />

      {/* Booking Limit Reached Dialog */}
      <BookingLimitReachedDialog
        isOpen={showLimitDialog}
        onClose={() => {
          setShowLimitDialog(false)
          setPendingPilot(null)
        }}
        maxBookings={bookingLimitData?.maxBookings || 2}
        existingBookings={bookingLimitData?.bookings || []}
      />
    </>
  )
}
