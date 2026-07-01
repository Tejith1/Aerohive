"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, MapPin, Clock, Star, Camera, Plane, Droplets, Map, DollarSign, Calendar, Shield, Award, Loader2, Sparkles, ShieldCheck, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
import { calculateDistance, supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useSettings } from "@/contexts/settings-context"
import { ComingSoonOverlay } from "@/components/ui/coming-soon-overlay"
import { FAQSection } from "@/components/layout/faq-section"
import { toast } from "@/hooks/use-toast"
import { ServiceBookingDetailsDialog } from "@/components/ServiceBookingDetailsDialog"
import { FeatureGridMosaic } from "@/components/ui/feature-grid-mosaic"

const serviceFAQs = [
  {
    question: "What types of drone services do you offer?",
    answer: "We offer a wide range of services including aerial mapping, photography, agricultural spraying, surveillance, and industrial inspections."
  },
  {
    question: "How are service prices determined?",
    answer: "Prices are set by the service providers and can be based on hourly rates, daily rates, per-project fees, or per-acre for agricultural services."
  },
  {
    question: "Are the service providers insured?",
    answer: "Many of our providers carry professional liability insurance. You can check the 'Insurance' status on each provider's card."
  }
]

interface ServiceProvider {
  id: string
  companyName: string
  description: string
  location: string
  rating: number
  reviewCount: number
  isVerified: boolean
  licenseNumber?: string
  insurance: boolean
  yearsExperience: number
  commissionRate: number
  responseTime: string
  equipment: string[]
  certifications: string[]
  profileImage: string
  portfolio: string[]
  contactInfo: {
    phone: string
    email: string
    website?: string
  }
  lat?: number
  lng?: number
}

interface DroneService {
  id: string
  providerId: string
  title: string
  description: string
  serviceType: "mapping" | "surveillance" | "spraying" | "photography" | "inspection" | "delivery"
  priceType: "hourly" | "daily" | "per_project" | "per_acre"
  basePrice: number
  minDuration?: number
  maxCoverage?: number
  deliverables: string[]
  equipment: string[]
  turnaroundTime: string
  features: string[]
  sampleWork?: string[]
}

const getSlotPrice = (slotString: string, defaultPrice: number) => {
  if (!slotString) return defaultPrice;
  const match = slotString.match(/₹\s*(\d+)/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return defaultPrice;
};

export default function DroneServicesPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"services" | "providers">("services")
  const [searchTerm, setSearchTerm] = useState("")
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState("")
  const [priceRangeFilter, setPriceRangeFilter] = useState<string>("all")
  
  const [dbProviders, setDbProviders] = useState<any[]>([])
  const [dbServices, setDbServices] = useState<any[]>([])
  const [filteredServices, setFilteredServices] = useState<any[]>([])
  const [filteredProviders, setFilteredProviders] = useState<any[]>([])
  
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const { user, isAdmin, isLoading: authLoading } = useAuth()
  const { settings: siteSettings, isLoading: settingsLoading } = useSettings()
  const isLoading = authLoading || settingsLoading

  // Booking Modal State
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [selectedService, setSelectedService] = useState<any | null>(null)
  const [bookingSubmitting, setBookingSubmitting] = useState(false)
  const [isDetectingBookingLocation, setIsDetectingBookingLocation] = useState(false)
  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    address: "",
    landscapeSize: "Under 1 acre",
    date: "",
    timeSlot: "",
    notes: ""
  })

  // Details dialog states after successful booking
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [completedBooking, setCompletedBooking] = useState<any | null>(null)

  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([])
  
  const currentSlotPrice = selectedService 
    ? getSlotPrice(bookingForm.timeSlot, selectedService.basePrice) 
    : 0;
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [bookingAddressSuggestions, setBookingAddressSuggestions] = useState<any[]>([])
  const [showBookingAddressSuggestions, setShowBookingAddressSuggestions] = useState(false)

  // Pre-fill user data when booking dialog opens
  useEffect(() => {
    if (user && showBookingDialog) {
      setBookingForm(prev => ({
        ...prev,
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        phone: user.phone || ""
      }))
    }
  }, [user, showBookingDialog])

  // Fetch suggestions for locationFilter (search)
  useEffect(() => {
    if (!locationFilter || locationFilter.trim().length < 3 || locationFilter === "Current Location") {
      setLocationSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationFilter)}&format=json&addressdetails=1&limit=5&accept-language=en`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setLocationSuggestions(data);
        }
      } catch (err) {
        console.error("Autocomplete location fetch failed", err);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [locationFilter]);

  // Fetch suggestions for bookingForm.address (booking)
  useEffect(() => {
    if (!bookingForm.address || bookingForm.address.trim().length < 3) {
      setBookingAddressSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(bookingForm.address)}&format=json&addressdetails=1&limit=5&accept-language=en`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setBookingAddressSuggestions(data);
        }
      } catch (err) {
        console.error("Autocomplete booking address fetch failed", err);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [bookingForm.address]);

  // Load data and ask for location on mount
  useEffect(() => {
    async function loadData() {
      if (!supabase) return
      try {
        const { data: providers, error: providersErr } = await supabase
          .from("service_providers")
          .select("*")
        const { data: services, error: servicesErr } = await supabase
          .from("drone_services")
          .select("*")

        if (providers) {
          const mappedProviders = providers.map((p: any) => {
            const addr = typeof p.address === 'object' && p.address ? p.address : {} as any
            return {
              id: p.id,
              companyName: p.name,
              description: p.description || "",
              location: addr.location || addr.city || p.service_areas?.[0] || "",
              rating: p.rating || 5.0,
              reviewCount: p.total_jobs || 0,
              isVerified: p.is_verified || false,
              licenseNumber: p.website || "",
              insurance: true,
              yearsExperience: 3,
              commissionRate: 10,
              responseTime: "Under 2 hours",
              equipment: addr.drone_type ? [addr.drone_type] : [],
              certifications: [],
              profileImage: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=200&h=200&fit=crop",
              portfolio: [],
              contactInfo: {
                phone: p.phone || "",
                email: p.email || ""
              },
              pincode: addr.pincode || "",
              timeSlots: addr.time_slots || [],
              lat: 12.9716,
              lng: 77.5946
            }
          })
          setDbProviders(mappedProviders)
        }

        if (services) {
          const mappedServices = services.map((s: any) => ({
            id: s.id,
            providerId: s.provider_id,
            title: s.title,
            description: s.description || "",
            serviceType: s.category || "photography",
            priceType: s.price_type || "hourly",
            basePrice: s.base_price || 0,
            deliverables: s.equipment_provided || [],
            equipment: s.equipment_provided || [],
            turnaroundTime: "2-3 days",
            features: s.requirements ? [s.requirements] : []
          }))
          setDbServices(mappedServices)
        }
      } catch (err) {
        console.error("Error loading services data:", err)
      }
    }

    loadData()
    handleUseMyLocation()
  }, [])

  // Filtering logic
  useEffect(() => {
    if (!locationFilter) {
      setFilteredServices([])
      setFilteredProviders([])
      return
    }

    const allProviders = dbProviders
    const allServices = dbServices

    const searchTokens = locationFilter
      .toLowerCase()
      .split(/[\s,]+/)
      .filter(t => t.trim().length > 0)

    if (activeTab === "services") {
      let filtered = allServices.filter(service => {
        const provider = allProviders.find(p => p.id === service.providerId)
        const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = serviceTypeFilter === "all" || service.serviceType === serviceTypeFilter
        const matchesLocation = searchTokens.length === 0 || searchTokens.some(token => {
          return provider && (
            provider.location.toLowerCase().includes(token) ||
            (provider.pincode && provider.pincode.toLowerCase().includes(token))
          )
        })

        let matchesDistance = true
        if (userLocation && locationFilter === "Current Location" && provider?.lat && provider?.lng) {
          const distance = calculateDistance(userLocation.lat, userLocation.lng, provider.lat, provider.lng)
          matchesDistance = distance <= 500
        }

        return matchesSearch && matchesType && matchesLocation && matchesDistance && (!user || service.providerId !== user.id)
      })

      setFilteredServices(filtered)
    } else {
      const filtered = allProviders.filter(provider => {
        const matchesLocation = searchTokens.length === 0 || searchTokens.some(token => {
          return (
            provider.location.toLowerCase().includes(token) ||
            (provider.pincode && provider.pincode.toLowerCase().includes(token))
          )
        })
        const matchesText = provider.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          provider.description.toLowerCase().includes(searchTerm.toLowerCase())

        let matchesDistance = true
        if (userLocation && locationFilter === "Current Location" && provider.lat && provider.lng) {
          const distance = calculateDistance(userLocation.lat, userLocation.lng, provider.lat, provider.lng)
          matchesDistance = distance <= 500
        }

        if (locationFilter === "Current Location") {
          return matchesDistance && (provider.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || provider.description.toLowerCase().includes(searchTerm.toLowerCase()))
        }

        return matchesText && matchesLocation && (!user || provider.id !== user.id)
      })
      setFilteredProviders(filtered)
    }
  }, [activeTab, searchTerm, serviceTypeFilter, locationFilter, priceRangeFilter, userLocation, dbProviders, dbServices, user])

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setLocationFilter("Current Location")

        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`)
          const data = await response.json()
          if (data.address) {
            const addr = data.address
            const area = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || addr.town || addr.village || addr.city || ""
            const postcode = addr.postcode || ""
            let detected = ""
            if (area && postcode) {
              detected = `${area}, ${postcode}`
            } else {
              detected = area || postcode || ""
            }

            if (detected) {
              setLocationFilter(detected)
            }
          }
        } catch (e) {
          console.error("Reverse geocoding failed", e)
        }
        setIsLocating(false)
      },
      (error) => {
        console.error(error)
        setIsLocating(false)
      }
    )
  }

  const getProviderById = (id: string) => {
    return dbProviders.find(provider => provider.id === id)
  }

  const formatPrice = (service: any) => {
    switch (service.priceType) {
      case "hourly": return `₹${service.basePrice.toLocaleString('en-IN')}/hr`
      case "daily": return `₹${service.basePrice.toLocaleString('en-IN')}/day`
      case "per_project": return `₹${service.basePrice.toLocaleString('en-IN')}/proj`
      case "per_acre": return `₹${service.basePrice.toLocaleString('en-IN')}/acre`
      default: return `₹${service.basePrice.toLocaleString('en-IN')}`
    }
  }

  const handleOpenBooking = (service: any) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to place a booking request.",
        variant: "destructive"
      })
      router.push('/login?redirect=/drone-services')
      return
    }
    
    setSelectedService(service)
    const provider = getProviderById(service.providerId)
    const firstSlot = provider?.timeSlots?.[0] || "08:00 AM - 10:00 AM"
    
    setBookingForm({
      name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      phone: user.phone || "",
      address: "",
      landscapeSize: "Under 1 acre",
      date: new Date().toISOString().split('T')[0],
      timeSlot: firstSlot,
      notes: ""
    })
    setShowBookingDialog(true)
  }

  const handleAutoDetectBookingLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive"
      })
      return
    }

    setIsDetectingBookingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`)
          const data = await res.json()
          if (data.display_name) {
            const addressParts = data.address || {}
            const shortAddress = [
              addressParts.suburb || addressParts.neighbourhood || addressParts.road,
              addressParts.city || addressParts.town || addressParts.village,
              addressParts.state
            ].filter(Boolean).join(', ')
            
            setBookingForm(prev => ({
              ...prev,
              address: shortAddress || data.display_name
            }))
          } else {
            setBookingForm(prev => ({
              ...prev,
              address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
            }))
          }
        } catch (e) {
          console.error("Geocoding error:", e)
          setBookingForm(prev => ({
            ...prev,
            address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
          }))
        } finally {
          setIsDetectingBookingLocation(false)
        }
      },
      (err) => {
        console.error("Geolocation error:", err)
        toast({
          title: "Detection Failed",
          description: "Unable to retrieve location. Please type manually.",
          variant: "destructive"
        })
        setIsDetectingBookingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedService) return

    if (!bookingForm.name || !bookingForm.phone || !bookingForm.address || !bookingForm.date || !bookingForm.timeSlot) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required booking information.",
        variant: "destructive"
      })
      return
    }

    setBookingSubmitting(true)
    try {
      const response = await fetch('/api/drone-services/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: user.id,
          providerId: selectedService.providerId,
          serviceId: selectedService.id,
          name: bookingForm.name,
          address: bookingForm.address,
          phone: bookingForm.phone,
          landscapeSize: bookingForm.landscapeSize,
          date: bookingForm.date,
          timeSlot: bookingForm.timeSlot,
          notes: bookingForm.notes,
          estimatedCost: currentSlotPrice
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to place booking')
      }

      toast({
        title: "Booking Submitted! 🚁",
        description: "Your request is registered with the provider.",
      })
      
      setShowBookingDialog(false)
      
      // Store details for success confirmation card popup
      const provider = getProviderById(selectedService.providerId)
      setCompletedBooking({
        bookingId: data.booking.id,
        serviceType: selectedService.title,
        location: bookingForm.address,
        scheduledAt: `${bookingForm.date} @ ${bookingForm.timeSlot}`,
        landscapeSize: bookingForm.landscapeSize,
        estimatedCost: currentSlotPrice,
        provider: {
          id: provider?.id || selectedService.providerId,
          companyName: provider?.companyName || 'Registered Provider',
          phone: provider?.contactInfo?.phone,
          email: provider?.contactInfo?.email,
          rating: provider?.rating || 5.0,
          location: provider?.location
        }
      })
      setShowDetailsDialog(true)

    } catch (err: any) {
      toast({
        title: "Booking Error",
        description: err.message || "Could not process booking.",
        variant: "destructive"
      })
    } finally {
      setBookingSubmitting(false)
    }
  }

  function ServiceCategoryIcon({ type, className }: { type: string; className?: string }) {
    const baseClass = className || "w-5 h-5";
    switch (type) {
      case "mapping":
        return <Map className={baseClass} />
      case "photography":
        return <Camera className={baseClass} />
      case "spraying":
        return <Droplets className={baseClass} />
      case "surveillance":
        return <Shield className={baseClass} />
      case "inspection":
        return <Search className={baseClass} />
      default:
        return <Plane className={baseClass} />
    }
  }

  const selectedProviderForBooking = selectedService ? getProviderById(selectedService.providerId) : null
  const bookingTimeSlots = selectedProviderForBooking?.timeSlots?.length > 0 
    ? selectedProviderForBooking.timeSlots 
    : [
        "06:00 AM - 08:00 AM",
        "08:00 AM - 10:00 AM",
        "10:00 AM - 12:00 PM",
        "12:00 PM - 02:00 PM",
        "02:00 PM - 04:00 PM",
        "04:00 PM - 06:00 PM",
        "06:00 PM - 08:00 PM",
        "08:00 PM - 10:00 PM"
      ]

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <ModernHeader />

      <main className="flex-1 relative pt-20">
        {/* Decorative ambient gradients */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

        <div className={siteSettings?.hide_sections && siteSettings?.hide_services && !isAdmin && !isLoading ? "opacity-20 blur-sm pointer-events-none transition-all duration-300 w-full" : "transition-all duration-300 w-full"}>

          {/* Apple-grade Hero Section */}
          <section className="relative py-20 overflow-hidden text-center">
            <div className="container mx-auto px-6 relative z-10">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="inline-flex items-center gap-2.5 bg-white dark:bg-card border border-slate-200/60 dark:border-border px-5 py-2 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:scale-[1.01] transition-transform duration-300">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 fill-blue-500/10" />
                  <span className="text-[10px] font-bold tracking-[0.12em] text-slate-850 dark:text-zinc-200 uppercase font-sans">
                    Premium On-Demand Marketplace
                  </span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight font-display text-slate-900 dark:text-white leading-none">
                  Drone <span className="font-serif italic font-normal text-slate-900 dark:text-white">Services</span> Hub
                </h1>
                
                <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-sans max-w-2xl mx-auto leading-relaxed">
                  Book verified operators equipped with advanced hardware for industrial surveying, agriculture, cinematography, and surveillance.
                </p>
                
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <Button size="lg" className="bg-slate-900 hover:bg-primary text-white dark:bg-white dark:hover:bg-primary dark:text-slate-900 dark:hover:text-white rounded-full px-8 py-6 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] border-0" onClick={() => {
                    const el = document.getElementById("listings-section")
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }}>
                    Browse Operations <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border border-[#e8e3d9] dark:border-border bg-[#fdfcfa]/60 dark:bg-card/50 backdrop-blur-md text-slate-700 dark:text-slate-300 hover:bg-[#fbf9f6] dark:hover:bg-accent rounded-full px-8 py-6 text-sm font-semibold transition-all duration-300 hover:scale-[1.02]">
                    <Link href="/drone-services/register">Become a Provider</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border border-[#e8e3d9] dark:border-border bg-[#fdfcfa]/60 dark:bg-card/50 backdrop-blur-md text-slate-700 dark:text-slate-300 hover:bg-[#fbf9f6] dark:hover:bg-accent rounded-full px-8 py-6 text-sm font-semibold transition-all duration-300 hover:scale-[1.02]">
                    <Link href="/provider-panel/login">Provider Login</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Premium Filter Controls */}
          <section id="listings-section" className="py-6 border-y border-[#e8e3d9]/80 dark:border-border/80 bg-white/60 dark:bg-background/40 backdrop-blur-xl sticky top-[72px] z-30">
            <div className="container mx-auto px-4">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                
                {/* Segmented Toggle Control */}
                <div className="flex bg-[#fdfcfa] dark:bg-[#1c2e4a] rounded-full p-1 border border-[#e8e3d9] dark:border-border shadow-sm shrink-0">
                  <button
                    onClick={() => setActiveTab("services")}
                    className={`rounded-full px-6 py-2.5 text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                      activeTab === "services" 
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm" 
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Plane className="w-3.5 h-3.5" /> Services
                  </button>
                  <button
                    onClick={() => setActiveTab("providers")}
                    className={`rounded-full px-6 py-2.5 text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                      activeTab === "providers" 
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm" 
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" /> Providers
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center justify-end">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder={`Search ${activeTab}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 rounded-full border-[#e8e3d9] dark:border-border bg-[#fdfcfa] dark:bg-card placeholder:text-slate-450 h-11 text-xs"
                    />
                  </div>

                  <div className="relative w-full sm:w-56">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="City or Pincode"
                      value={locationFilter}
                      onChange={(e) => {
                        setLocationFilter(e.target.value)
                        setShowLocationSuggestions(true)
                      }}
                      onFocus={() => setShowLocationSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 250)}
                      className="pl-10 pr-10 rounded-full border-[#e8e3d9] dark:border-border bg-[#fdfcfa] dark:bg-card placeholder:text-slate-450 h-11 text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-slate-400 hover:text-primary rounded-full"
                      onClick={handleUseMyLocation}
                      disabled={isLocating}
                      title="Use my location"
                    >
                      {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                    </Button>
                    
                    {showLocationSuggestions && locationSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#fdfcfa] dark:bg-card border border-[#e8e3d9] dark:border-border rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto text-left">
                        {locationSuggestions.map((sug) => {
                          const addr = sug.address || {}
                          const area = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || addr.town || addr.village || addr.city || ""
                          const postcode = addr.postcode || ""
                          const label = area && postcode ? `${area}, ${postcode}` : (area || sug.display_name.split(',')[0])
                          return (
                            <button
                              key={sug.place_id}
                              type="button"
                              className="w-full text-left px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-accent text-xs transition-colors border-b border-[#e8e3d9]/40 dark:border-border/40 last:border-0 block"
                              onClick={() => {
                                setLocationFilter(label)
                                if (sug.lat && sug.lon) {
                                  setUserLocation({ lat: parseFloat(sug.lat), lng: parseFloat(sug.lon) })
                                }
                                setShowLocationSuggestions(false)
                              }}
                            >
                              <div className="font-semibold text-slate-800 dark:text-white truncate">{label}</div>
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{sug.display_name}</div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {activeTab === "services" && (
                    <select
                      value={serviceTypeFilter}
                      onChange={(e) => setServiceTypeFilter(e.target.value)}
                      className="border border-[#e8e3d9] dark:border-border rounded-full px-4 h-11 text-xs bg-[#fdfcfa] dark:bg-card text-slate-700 dark:text-slate-350 focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer w-full sm:w-auto"
                    >
                      <option value="all">All Service Types</option>
                      <option value="mapping">Mapping & Surveying</option>
                      <option value="photography">Cinematography</option>
                      <option value="spraying">Crop Spraying</option>
                      <option value="surveillance">Surveillance</option>
                      <option value="inspection">Industrial Inspection</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Cards & Content Listings */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              {!locationFilter ? (
                <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-[#fdfcfa]/80 dark:bg-card/30 rounded-3xl border border-dashed border-[#e8e3d9] dark:border-border max-w-lg mx-auto shadow-sm">
                  <div className="p-4 bg-primary/10 rounded-2xl mb-5">
                    <MapPin className="w-9 h-9 text-primary animate-bounce" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight font-display mb-2 text-slate-900 dark:text-white">Location Filter Required</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mb-6 leading-relaxed">
                    AeroHive indexes operators based on coordinates. Please share your location or type a region to match certified local crews.
                  </p>
                  <Button onClick={handleUseMyLocation} disabled={isLocating} className="rounded-full bg-slate-900 hover:bg-primary text-white dark:bg-white dark:text-slate-900 dark:hover:text-white border-0 py-2.5 h-11 px-6 font-semibold shadow-md transition-all">
                    {isLocating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MapPin className="w-4 h-4 mr-2" />}
                    Share Location Coordinate
                  </Button>
                </div>
              ) : (
                <>
                  {activeTab === "services" ? (
                    <FeatureGridMosaic
                      services={filteredServices}
                      providers={dbProviders}
                      user={user}
                      formatPrice={formatPrice}
                      handleOpenBooking={handleOpenBooking}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredProviders.map((provider) => (
                        <Card key={provider.id} className="overflow-hidden hover:scale-[1.01] hover:shadow-xl transition-all duration-300 border border-[#e8e3d9] dark:border-border/80 bg-[#fdfcfa] dark:bg-card/60 rounded-3xl p-6 flex flex-col justify-between">
                          <div className="space-y-4 text-center">
                            {provider.isVerified && (
                              <div className="flex justify-center">
                                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20 py-0.5 px-3 text-[10px] rounded-full flex items-center gap-1 font-bold">
                                  <ShieldCheck className="w-3.5 h-3.5" /> Certified Provider
                                </Badge>
                              </div>
                            )}
                            
                            <div>
                              <CardTitle className="text-xl font-bold tracking-tight font-display text-slate-900 dark:text-white">{provider.companyName}</CardTitle>
                              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed line-clamp-2">{provider.description}</p>
                            </div>

                            <div className="flex items-center justify-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-bold text-slate-850 dark:text-white">{provider.rating}</span>
                              <span className="text-xs text-slate-400">({provider.reviewCount} jobs completed)</span>
                            </div>

                            <div className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-muted border border-border/40 py-1 px-3.5 rounded-full">
                              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span>{provider.location}</span>
                            </div>
                          </div>

                          <div className="space-y-4 mt-6 border-t border-[#e8e3d9]/40 dark:border-border/40 pt-4">
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div className="bg-[#faf8f5] dark:bg-muted p-2.5 rounded-xl border border-border/20 text-left">
                                <span className="text-slate-450 dark:text-slate-500 block text-[9px] uppercase tracking-wider font-bold">Experience</span>
                                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{provider.yearsExperience} years active</p>
                              </div>
                              <div className="bg-[#faf8f5] dark:bg-muted p-2.5 rounded-xl border border-border/20 text-left">
                                <span className="text-slate-450 dark:text-slate-550 block text-[9px] uppercase tracking-wider font-bold">Response</span>
                                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{provider.responseTime}</p>
                              </div>
                            </div>

                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-slate-450 dark:text-slate-550 font-bold mb-1.5 text-left">Hardware Fleet Availability:</p>
                              <div className="flex flex-wrap gap-1">
                                {provider.equipment.map((item: string, index: number) => (
                                  <Badge key={index} variant="secondary" className="text-[9px] font-semibold bg-slate-100 dark:bg-muted text-slate-650 border border-border/30">
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {((activeTab === "services" && filteredServices.length === 0) ||
                    (activeTab === "providers" && filteredProviders.length === 0)) && (
                      <div className="text-center py-16 bg-[#fdfcfa]/50 dark:bg-card/20 rounded-3xl border border-border/60 max-w-sm mx-auto">
                        <Plane className="w-12 h-12 text-slate-400 mx-auto mb-3 animate-pulse" />
                        <h3 className="text-md font-bold tracking-tight font-display text-slate-900 dark:text-white mb-1">No local options matched</h3>
                        <p className="text-slate-500 dark:text-slate-450 text-xs px-4 mb-4">No services or operators match the searched pincode area.</p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchTerm("")
                            setLocationFilter("")
                            setServiceTypeFilter("all")
                          }}
                          className="rounded-full text-xs font-semibold"
                        >
                          Reset Filters
                        </Button>
                      </div>
                    )}
                </>
              )}
            </div>
          </section>

          {/* Premium Booking Dialog Backdrop */}
          {showBookingDialog && selectedService && selectedProviderForBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-[#fbf9f6] dark:bg-card border border-[#e8e3d9] dark:border-border rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6 animate-in slide-in-from-bottom-2 duration-300 text-left">
                <div className="flex justify-between items-start border-b border-[#e8e3d9]/60 dark:border-border/60 pb-4">
                  <div>
                    <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary border border-primary/20">
                      Service: {selectedService.title}
                    </Badge>
                    <h2 className="text-2xl font-bold tracking-tight font-display text-slate-900 dark:text-white">Request Operations</h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Provider: {selectedProviderForBooking.companyName} ({selectedProviderForBooking.location})</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowBookingDialog(false)} className="rounded-full h-8 w-8 hover:bg-slate-100 dark:hover:bg-accent text-slate-450">
                    ✕
                  </Button>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-bold text-slate-650 dark:text-slate-350 block mb-1">Your Name</Label>
                      <Input
                        required
                        value={bookingForm.name}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, name: e.target.value }))}
                        className="rounded-xl border-[#e8e3d9] dark:border-border bg-[#fdfcfa] dark:bg-card"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-slate-650 dark:text-slate-350 block mb-1">Your Mobile Phone</Label>
                      <Input
                        required
                        type="tel"
                        value={bookingForm.phone}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="rounded-xl border-[#e8e3d9] dark:border-border bg-[#fdfcfa] dark:bg-card"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <Label className="text-xs font-bold text-slate-650 dark:text-slate-350 block mb-1">Launch Address (Must match {selectedProviderForBooking.location})</Label>
                    <div className="flex gap-2">
                      <Input
                        required
                        placeholder={`E.g., 42 Tech Street, ${selectedProviderForBooking.location}`}
                        value={bookingForm.address}
                        onChange={(e) => {
                          setBookingForm(prev => ({ ...prev, address: e.target.value }))
                          setShowBookingAddressSuggestions(true)
                        }}
                        onFocus={() => setShowBookingAddressSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowBookingAddressSuggestions(false), 250)}
                        className="rounded-xl border-[#e8e3d9] dark:border-border bg-[#fdfcfa] dark:bg-card flex-grow"
                      />
                      <Button
                        type="button"
                        onClick={handleAutoDetectBookingLocation}
                        disabled={isDetectingBookingLocation}
                        className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-[10px] rounded-xl px-4 h-10 flex items-center gap-1.5 font-bold tracking-wider uppercase transition active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
                      >
                        {isDetectingBookingLocation ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Detecting...
                          </>
                        ) : (
                          "Auto-Detect"
                        )}
                      </Button>
                    </div>
                    {showBookingAddressSuggestions && bookingAddressSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#fdfcfa] dark:bg-card border border-[#e8e3d9] dark:border-border rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto text-left">
                        {bookingAddressSuggestions.map((sug) => (
                          <button
                            key={sug.place_id}
                            type="button"
                            className="w-full text-left px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-accent text-xs transition-colors border-b border-[#e8e3d9]/45 dark:border-border/40 last:border-0 block"
                            onClick={() => {
                              setBookingForm(prev => ({ ...prev, address: sug.display_name }))
                              setShowBookingAddressSuggestions(false)
                            }}
                          >
                            <div className="font-semibold text-slate-800 dark:text-white truncate">{sug.display_name}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-bold text-slate-650 dark:text-slate-350 block mb-1">Landscape Size</Label>
                      <select
                        value={bookingForm.landscapeSize}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, landscapeSize: e.target.value }))}
                        className="w-full h-10 px-3 border border-[#e8e3d9] dark:border-border bg-[#fdfcfa] dark:bg-card rounded-xl text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer text-slate-700 dark:text-slate-350"
                      >
                        <option value="Under 1 acre">Under 1 acre</option>
                        <option value="1-5 acres">1-5 acres</option>
                        <option value="5-10 acres">5-10 acres</option>
                        <option value="10+ acres">10+ acres</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs font-bold text-slate-650 dark:text-slate-350 block mb-1">Date</Label>
                      <Input
                        required
                        type="date"
                        value={bookingForm.date}
                        onChange={(e) => setBookingForm(prev => ({ ...prev, date: e.target.value }))}
                        className="rounded-xl border-[#e8e3d9] dark:border-border bg-[#fdfcfa] dark:bg-card"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-slate-650 dark:text-slate-350 block mb-1">Select Available Time Slot</Label>
                    <select
                      value={bookingForm.timeSlot}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, timeSlot: e.target.value }))}
                      className="w-full h-10 px-3 border border-[#e8e3d9] dark:border-border bg-[#fdfcfa] dark:bg-card rounded-xl text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer text-slate-700 dark:text-slate-350"
                    >
                      {bookingTimeSlots.map((slot: string) => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs font-bold text-slate-650 dark:text-slate-350 block mb-1">Operations Notes / Instructions</Label>
                    <textarea
                      placeholder="Specify flight obstacles, structures, terrain details..."
                      value={bookingForm.notes}
                      onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full h-20 px-3 py-2 border border-[#e8e3d9] dark:border-border bg-[#fdfcfa] dark:bg-card rounded-xl text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-slate-700 dark:text-slate-350"
                    />
                  </div>

                  <div className="pt-4 border-t border-[#e8e3d9]/60 dark:border-slate-800/60 flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Est. Price: <span className="text-lg font-bold text-primary ml-1">₹{currentSlotPrice.toLocaleString('en-IN')}</span>
                    </span>
                    
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowBookingDialog(false)} className="rounded-full text-xs font-bold px-5">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={bookingSubmitting} className="bg-slate-900 hover:bg-primary text-white dark:bg-white dark:hover:bg-primary dark:text-slate-900 dark:hover:text-white rounded-full px-6 py-2 border-0 text-xs font-bold">
                        {bookingSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "✓ Submit Request"}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Call-to-action Section */}
          <section className="py-20 bg-slate-900 dark:bg-card text-white rounded-[40px] my-16 mx-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03] pointer-events-none"></div>
            <div className="container mx-auto px-6 text-center space-y-6 relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-display">Earn with Your Hardware Skills</h2>
              <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed font-sans">
                List your business capabilities and active time slots on AeroHive to match with local enterprise and agricultural service requests.
              </p>
              <Button asChild size="lg" className="bg-white hover:bg-primary text-slate-900 hover:text-white rounded-full px-8 py-5 text-xs font-bold tracking-widest uppercase transition-all duration-300 border-0">
                <Link href="/drone-services/register">Register as Operator</Link>
              </Button>
            </div>
          </section>

        </div>

        <ComingSoonOverlay
          show={siteSettings?.hide_sections && siteSettings?.hide_services && !isAdmin && !isLoading}
          title="Access Restricted"
          description="This section is locked for regular customers. Only administrators can access this content."
        />
      </main>

      {/* Success Dialog */}
      <ServiceBookingDetailsDialog
        isOpen={showDetailsDialog}
        onClose={() => {
          setShowDetailsDialog(false)
          router.push('/orders')
        }}
        booking={completedBooking}
      />

      <FAQSection pageName="Drone Services" customFAQs={serviceFAQs} />
      <ModernFooter />
    </div>
  )
}
