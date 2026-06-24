"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Clock, Star, Camera, Plane, Droplets, Map, DollarSign, Calendar, Shield, Award, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
import { calculateDistance } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { ComingSoonOverlay } from "@/components/ui/coming-soon-overlay"
import { FAQSection } from "@/components/layout/faq-section"

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

const serviceProviders: ServiceProvider[] = [
  {
    id: "1",
    companyName: "SkyMapper Pro",
    description: "Professional aerial mapping and surveying services with certified pilots and advanced LiDAR equipment.",
    location: "Bangalore, Karnataka",
    rating: 4.9,
    reviewCount: 127,
    isVerified: true,
    licenseNumber: "DGCA-RPL-SM-2024",
    insurance: true,
    yearsExperience: 8,
    commissionRate: 12,
    responseTime: "< 4 hours",
    equipment: ["DJI Matrice 300", "LiDAR L1", "RTK Module", "Survey-grade GPS"],
    certifications: ["DGCA Remote Pilot License", "Survey Mapping", "Photogrammetry Certified"],
    profileImage: "/placeholder.svg?height=100&width=100&text=SkyMapper",
    portfolio: ["/placeholder.svg?height=200&width=300&text=Mapping+Sample"],
    contactInfo: {
      phone: "+91 98765 43210",
      email: "projects@skymapperpro.com",
      website: "www.skymapperpro.com"
    },
    lat: 12.9716,
    lng: 77.5946
  },
  {
    id: "2",
    companyName: "AgriSpray Solutions",
    description: "Precision agriculture specialists providing crop spraying, monitoring, and analysis services.",
    location: "Nashik, Maharashtra",
    rating: 4.8,
    reviewCount: 89,
    isVerified: true,
    licenseNumber: "DGCA-RPL-AS-2024",
    insurance: true,
    yearsExperience: 6,
    commissionRate: 10,
    responseTime: "< 6 hours",
    equipment: ["DJI Agras T40", "Precision Sprayer", "Multispectral Camera", "Weather Station"],
    certifications: ["DGCA Remote Pilot License", "Agricultural Spray License", "Precision Agriculture"],
    profileImage: "/placeholder.svg?height=100&width=100&text=AgriSpray",
    portfolio: ["/placeholder.svg?height=200&width=300&text=Farm+Spraying"],
    contactInfo: {
      phone: "+91 87654 32109",
      email: "services@agrispraysolutions.com"
    },
    lat: 19.9975,
    lng: 73.7898
  },
  {
    id: "3",
    companyName: "AerialVision Studios",
    description: "Cinematic aerial photography and videography for real estate, events, and commercial productions.",
    location: "Mumbai, Maharashtra",
    rating: 4.9,
    reviewCount: 203,
    isVerified: true,
    licenseNumber: "DGCA-RPL-AV-2024",
    insurance: true,
    yearsExperience: 10,
    commissionRate: 15,
    responseTime: "< 2 hours",
    equipment: ["DJI Inspire 3", "Hasselblad X9", "FPV Cinewhoop", "RED Digital Cinema"],
    certifications: ["DGCA Remote Pilot License", "Film Production", "Real Estate Certified"],
    profileImage: "/placeholder.svg?height=100&width=100&text=AerialVision",
    portfolio: ["/placeholder.svg?height=200&width=300&text=Aerial+Photo"],
    contactInfo: {
      phone: "+91 76543 21098",
      email: "bookings@aerialvisionstudios.com",
      website: "www.aerialvisionstudios.com"
    },
    lat: 19.0760,
    lng: 72.8777
  }
]

const droneServices: DroneService[] = [
  {
    id: "1",
    providerId: "1",
    title: "Topographic Survey & Mapping",
    description: "High-precision topographic surveys using RTK GPS and photogrammetry for construction and land development projects.",
    serviceType: "mapping",
    priceType: "per_acre",
    basePrice: 12450,
    minDuration: 4,
    maxCoverage: 500,
    deliverables: ["Digital Elevation Model", "Orthomosaic Maps", "Point Cloud Data", "CAD Files", "Survey Report"],
    equipment: ["DJI Matrice 300", "RTK Module", "Survey Camera"],
    turnaroundTime: "3-5 business days",
    features: ["Sub-cm accuracy", "Professional survey grade", "CAD-ready outputs", "Multiple file formats"],
    sampleWork: ["/placeholder.svg?height=150&width=200&text=Topo+Map"]
  },
  {
    id: "2",
    providerId: "1",
    title: "Construction Progress Monitoring",
    description: "Regular aerial documentation and progress tracking for construction sites with detailed reporting.",
    serviceType: "mapping",
    priceType: "per_project",
    basePrice: 66400,
    minDuration: 2,
    deliverables: ["Progress Photos", "Volumetric Analysis", "Time-lapse Videos", "Progress Reports"],
    equipment: ["DJI Phantom 4 RTK", "Measurement Software"],
    turnaroundTime: "24-48 hours",
    features: ["Weekly/Monthly visits", "Automated flight paths", "Volume calculations", "Stakeholder reports"]
  },
  {
    id: "3",
    providerId: "2",
    title: "Crop Health Monitoring",
    description: "Multispectral analysis of crop health with NDVI mapping and detailed field reports for precision agriculture.",
    serviceType: "spraying",
    priceType: "per_acre",
    basePrice: 2075,
    maxCoverage: 1000,
    deliverables: ["NDVI Maps", "Health Analysis Report", "Treatment Recommendations", "Digital Field Maps"],
    equipment: ["Multispectral Camera", "DJI Agras", "Analysis Software"],
    turnaroundTime: "2-3 business days",
    features: ["Early problem detection", "Prescription maps", "Yield optimization", "Historical tracking"]
  },
  {
    id: "4",
    providerId: "2",
    title: "Precision Crop Spraying",
    description: "Automated precision spraying services for pesticides, fertilizers, and herbicides with GPS accuracy.",
    serviceType: "spraying",
    priceType: "per_acre",
    basePrice: 996,
    maxCoverage: 2000,
    deliverables: ["Spray Reports", "GPS Coverage Maps", "Application Certificates", "Weather Data"],
    equipment: ["DJI Agras T40", "Precision Nozzles", "GPS System"],
    turnaroundTime: "Same day service",
    features: ["Variable rate application", "Weather monitoring", "Certified application", "Reduced drift"]
  },
  {
    id: "5",
    providerId: "3",
    title: "Real Estate Aerial Photography",
    description: "Professional aerial photography and videography packages for luxury real estate marketing.",
    serviceType: "photography",
    priceType: "per_project",
    basePrice: 41500,
    minDuration: 2,
    deliverables: ["High-res Photos", "4K Video Tour", "Edited Highlights", "Social Media Package"],
    equipment: ["DJI Inspire 3", "Hasselblad Camera", "Gimbal Stabilizer"],
    turnaroundTime: "48-72 hours",
    features: ["Professional editing", "Multiple angles", "Golden hour shots", "Marketing package"]
  },
  {
    id: "6",
    providerId: "3",
    title: "Event Aerial Coverage",
    description: "Comprehensive aerial documentation for weddings, corporate events, and special occasions.",
    serviceType: "photography",
    priceType: "hourly",
    basePrice: 16600,
    minDuration: 3,
    deliverables: ["Event Highlights", "Live Streaming", "Photo Gallery", "Social Media Content"],
    equipment: ["Multiple Drones", "Live Streaming Setup", "Backup Equipment"],
    turnaroundTime: "24-48 hours",
    features: ["Live streaming", "Multiple angles", "Backup systems", "Professional crew"]
  },
  {
    id: "7",
    providerId: "1",
    title: "Advanced 3D Mapping & Modeling",
    description: "Creation of high-fidelity 3D models and digital twins using photogrammetry and LiDAR for urban planning and architecture.",
    serviceType: "mapping",
    priceType: "per_project",
    basePrice: 55000,
    minDuration: 3,
    deliverables: ["3D Mesh Model", "Digital Twin", "Texture Maps", "VR-Ready Asset"],
    equipment: ["DJI Matrice 300 RTK", "Zenmuse P1", "LiDAR L1"],
    turnaroundTime: "5-7 business days",
    features: ["Sub-centimeter accuracy", "BIM integration", "Cloud hosting", "Measurement tools"],
    sampleWork: ["/placeholder.svg?height=150&width=200&text=3D+Model"]
  },
  {
    id: "8",
    providerId: "2",
    title: "Agricultural Drone Spraying",
    description: "Efficient aerial spraying for large-scale farms using autonomous heavy-lift drones for fertilizer and pesticide application.",
    serviceType: "spraying",
    priceType: "per_acre",
    basePrice: 850,
    maxCoverage: 5000,
    deliverables: ["Application Map", "As-Applied Report", "Chemical Usage Log"],
    equipment: ["DJI Agras T50", "Generators", "Field Support"],
    turnaroundTime: "Same day (weather permitting)",
    features: ["Heavy crop penetration", "Drift reduction technology", "Night operation capable", "Variable rate control"]
  }
]

export default function DroneServicesPage() {
  const [activeTab, setActiveTab] = useState<"services" | "providers">("services")
  const [searchTerm, setSearchTerm] = useState("")
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState("")
  const [priceRangeFilter, setPriceRangeFilter] = useState<string>("all")
  const [filteredServices, setFilteredServices] = useState(droneServices)
  const [filteredProviders, setFilteredProviders] = useState(serviceProviders)
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const { isAdmin, isLoading: authLoading } = useAuth()
  const isLoading = authLoading

  useEffect(() => {
    if (activeTab === "services") {
      let filtered = droneServices.filter(service => {
        const provider = serviceProviders.find(p => p.id === service.providerId)

        const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesType = serviceTypeFilter === "all" || service.serviceType === serviceTypeFilter

        const matchesLocation = !locationFilter ||
          (provider && provider.location.toLowerCase().includes(locationFilter.toLowerCase()))

        // Distance filter if user location is set and "Current Location" is in box
        let matchesDistance = true
        if (userLocation && locationFilter === "Current Location" && provider?.lat && provider?.lng) {
          const distance = calculateDistance(userLocation.lat, userLocation.lng, provider.lat, provider.lng)
          matchesDistance = distance <= 500 // 500km radius for now
        }

        return matchesSearch && matchesType && matchesLocation && matchesDistance
      })

      setFilteredServices(filtered)
    } else {
      const filtered = serviceProviders.filter(provider => {
        const matchesText = provider.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          provider.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          provider.location.toLowerCase().includes(locationFilter.toLowerCase())

        let matchesDistance = true
        if (userLocation && locationFilter === "Current Location" && provider.lat && provider.lng) {
          const distance = calculateDistance(userLocation.lat, userLocation.lng, provider.lat, provider.lng)
          matchesDistance = distance <= 500
        }

        if (locationFilter === "Current Location") {
          return matchesDistance && (provider.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || provider.description.toLowerCase().includes(searchTerm.toLowerCase()))
        }

        return matchesText
      })
      setFilteredProviders(filtered)
    }
  }, [activeTab, searchTerm, serviceTypeFilter, locationFilter, priceRangeFilter, userLocation])

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setLocationFilter("Current Location")

        try {
          // Optional: Reverse geocode to show city name
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
          const data = await response.json()
          if (data.address && (data.address.city || data.address.town || data.address.state)) {
            const city = data.address.city || data.address.town || ""
            const state = data.address.state || ""
            const locString = city && state ? `${city}, ${state}` : (city || state)
            if (locString) setLocationFilter(locString)
          }
        } catch (e) {
          console.error("Reverse geocoding failed", e)
        }

        setIsLocating(false)
      },
      (error) => {
        console.error(error)
        setIsLocating(false)
        alert("Unable to retrieve your location")
      }
    )
  }

  const getProviderById = (id: string) => {
    return serviceProviders.find(provider => provider.id === id)
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "mapping": return Map
      case "surveillance": return Shield
      case "spraying": return Droplets
      case "photography": return Camera
      case "inspection": return Search
      case "delivery": return Plane
      default: return Plane
    }
  }

  const formatPrice = (service: DroneService) => {
    switch (service.priceType) {
      case "hourly": return `₹${service.basePrice.toLocaleString('en-IN')}/hour`
      case "daily": return `₹${service.basePrice.toLocaleString('en-IN')}/day`
      case "per_project": return `₹${service.basePrice.toLocaleString('en-IN')}/project`
      case "per_acre": return `₹${service.basePrice.toLocaleString('en-IN')}/acre`
      default: return `₹${service.basePrice.toLocaleString('en-IN')}`
    }
  }

  function ServiceCategoryLogo({ type, className }: { type: string; className?: string }) {
  const baseSvgClass = "w-8 h-8 mx-auto mb-2 transition-all duration-300 group-hover:scale-110";
  switch (type) {
    case "mapping":
      return (
        <svg className={className || baseSvgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          <circle cx="12" cy="12" r="1.5" className="fill-primary" />
        </svg>
      );
    case "photography":
      return (
        <svg className={className || baseSvgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
          <path d="M6 6l3.5 3.5M18 18l-3.5-3.5M18 6l-3.5 3.5M6 18l3.5-3.5" />
        </svg>
      );
    case "spraying":
      return (
        <svg className={className || baseSvgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2v20M2 12h20" strokeDasharray="2 2" />
          <path d="M7 16a5 5 0 0 1 10 0" className="stroke-primary" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="7" cy="16" r="1" className="fill-primary" />
          <circle cx="17" cy="16" r="1" className="fill-primary" />
        </svg>
      );
    case "surveillance":
      return (
        <svg className={className || baseSvgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <circle cx="12" cy="11" r="3" className="stroke-primary" />
          <circle cx="12" cy="11" r="1" className="fill-primary" />
        </svg>
      );
    case "inspection":
      return (
        <svg className={className || baseSvgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 6v12M6 12h12" />
          <path d="M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0 -6 0" className="stroke-primary" />
        </svg>
      );
    case "delivery":
      return (
        <svg className={className || baseSvgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 10h16v8H4z" />
          <path d="M12 2v8M8 6h8" />
          <path d="M8 18v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2" className="stroke-primary" />
        </svg>
      );
    default:
      return (
        <svg className={className || baseSvgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
        </svg>
      );
  }
}

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <ModernHeader />

      <main className="flex-1 relative">
        <div className={!isAdmin && !isLoading ? "opacity-20 blur-sm pointer-events-none transition-all duration-300 w-full" : "transition-all duration-300 w-full"}>

      {/* Hero Section */}
      <section className="relative pt-28 lg:pt-36 pb-20 overflow-hidden text-center bg-background border-b border-border">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.01] pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Custom Gear Propeller Logo */}
            <div className="flex justify-center mb-2 animate-pulse">
              <svg className="w-20 h-20 text-primary" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="50" cy="50" r="16" className="stroke-primary" />
                <circle cx="50" cy="50" r="6" className="fill-primary" />
                <path d="M50 10v24M50 66v24M10 50h24M66 50h24" strokeWidth="2" />
                <circle cx="50" cy="22" r="8" strokeDasharray="2 1" />
                <circle cx="50" cy="78" r="8" strokeDasharray="2 1" />
                <circle cx="22" cy="50" r="8" strokeDasharray="2 1" />
                <circle cx="78" cy="50" r="8" strokeDasharray="2 1" />
              </svg>
            </div>
            <div className="inline-flex items-center justify-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <span className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase font-mono">
                // MARKETPLACE
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-light tracking-tight font-display text-foreground leading-tight">
              Drone-as-a-Service <span className="font-semibold text-primary block sm:inline">Marketplace</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-sans font-light">
              Connect with certified drone service providers for mapping, surveillance, spraying, photography, and inspections.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Button size="lg" className="bg-primary hover:bg-primary/95 text-white rounded-full px-6 py-3.5 text-sm font-medium transition-all duration-300 border-0">
                <Plane className="w-5 h-5 mr-2" />
                Find Services
              </Button>
              <Button size="lg" variant="outline" className="border border-border text-foreground hover:bg-muted rounded-full px-6 py-3.5 text-sm font-medium transition-all duration-300 bg-card/50 backdrop-blur-sm">
                Become a Provider
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation and Search */}
      <section className="py-8 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center bg-muted rounded-full p-1 border border-border">
              <Button
                variant={activeTab === "services" ? "default" : "ghost"}
                onClick={() => setActiveTab("services")}
                className="rounded-full px-6 py-2"
              >
                <Plane className="w-4 h-4 mr-2" />
                Services
              </Button>
              <Button
                variant={activeTab === "providers" ? "default" : "ghost"}
                onClick={() => setActiveTab("providers")}
                className="rounded-full px-6 py-2"
              >
                <Award className="w-4 h-4 mr-2" />
                Providers
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 rounded-full border-border bg-background"
                />
              </div>

              <div className="flex items-center gap-2 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10 w-48 pr-8 rounded-full border-border bg-background"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={handleUseMyLocation}
                  disabled={isLocating}
                  title="Use my location"
                >
                  {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                </Button>
              </div>

              {activeTab === "services" && (
                <select
                  value={serviceTypeFilter}
                  onChange={(e) => setServiceTypeFilter(e.target.value)}
                  className="border border-border rounded-full px-4 py-2 text-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="all">All Services</option>
                  <option value="mapping">Mapping & Surveying</option>
                  <option value="photography">Photography</option>
                  <option value="spraying">Agricultural Spraying</option>
                  <option value="surveillance">Surveillance</option>
                  <option value="inspection">Inspection</option>
                  <option value="delivery">Delivery</option>
                </select>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Service Types Overview */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { type: "mapping", label: "Mapping", count: 45 },
              { type: "photography", label: "Photography", count: 78 },
              { type: "spraying", label: "Agriculture", count: 32 },
              { type: "surveillance", label: "Surveillance", count: 23 },
              { type: "inspection", label: "Inspection", count: 56 },
              { type: "delivery", label: "Delivery", count: 12 }
            ].map(category => {
              return (
                <div
                  key={category.type}
                  className={`p-4 rounded-3xl text-center cursor-pointer transition-all border border-border/40 ${serviceTypeFilter === category.type
                    ? "bg-primary text-white"
                    : "bg-card hover:bg-primary/5 text-foreground"
                    }`}
                  onClick={() => setServiceTypeFilter(category.type)}
                >
                  <ServiceCategoryLogo type={category.type} className={`w-8 h-8 mx-auto mb-2 ${serviceTypeFilter === category.type ? "text-white" : "text-primary"}`} />
                  <p className="font-medium text-sm">{category.label}</p>
                  <p className="text-xs opacity-75">{category.count} services</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 relative bg-background">
        <div className="container mx-auto px-4">
            {activeTab === "services" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredServices.map((service) => {
                const provider = getProviderById(service.providerId)

                return (
                  <Card key={service.id} className="overflow-hidden hover:shadow-xl transition-all duration-350 border border-border bg-card rounded-3xl">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-2xl">
                            <ServiceCategoryLogo type={service.serviceType} className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <Badge variant="secondary" className="capitalize">
                              {service.serviceType}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {formatPrice(service)}
                          </div>
                          {service.minDuration && (
                            <div className="text-xs text-muted-foreground">
                              Min {service.minDuration}h
                            </div>
                          )}
                        </div>
                      </div>

                      <CardTitle className="text-xl mb-2 font-display">{service.title}</CardTitle>
                      <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Provider Info */}
                      {provider && (
                        <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-2xl">
                          <img
                            src={provider.profileImage}
                            alt={provider.companyName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground">{provider.companyName}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span className="text-xs text-muted-foreground">{provider.rating} ({provider.reviewCount})</span>
                              </div>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">{provider.location}</span>
                            </div>
                          </div>
                          {provider.isVerified && (
                            <Badge variant="secondary" className="bg-green-150 text-green-800 border-0">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Service Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{service.turnaroundTime}</span>
                        </div>
                        {service.maxCoverage && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Up to {service.maxCoverage} acres</span>
                          </div>
                        )}
                      </div>

                      {/* Equipment */}
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">Equipment Used:</p>
                        <div className="flex flex-wrap gap-1">
                          {service.equipment.slice(0, 3).map((item, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-border">
                              {item}
                            </Badge>
                          ))}
                          {service.equipment.length > 3 && (
                            <Badge variant="outline" className="text-xs border-border">
                              +{service.equipment.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Deliverables */}
                      <div>
                        <p className="text-sm font-medium text-foreground mb-2">You'll Receive:</p>
                        <div className="space-y-1">
                          {service.deliverables.slice(0, 3).map((item, index) => (
                            <div key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                              {item}
                            </div>
                          ))}
                          {service.deliverables.length > 3 && (
                            <div className="text-xs text-primary">
                              +{service.deliverables.length - 3} more deliverables
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 border-t border-border space-y-2">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-2.5 transition-all duration-300 border-0">
                          Request Quote
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm" className="rounded-full">
                            View Portfolio
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-full">
                            Contact Provider
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProviders.map((provider) => (
                <Card key={provider.id} className="overflow-hidden hover:shadow-xl transition-all duration-350 border border-border bg-card rounded-3xl">
                  <CardHeader className="text-center pb-4">
                    <div className="relative inline-block mb-4">
                      <img
                        src={provider.profileImage}
                        alt={provider.companyName}
                        className="w-20 h-20 rounded-full object-cover mx-auto"
                      />
                      {provider.isVerified && (
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                          <Shield className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <CardTitle className="text-xl mb-2 font-display">{provider.companyName}</CardTitle>
                    <p className="text-muted-foreground text-sm mb-3">{provider.description}</p>

                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium text-foreground">{provider.rating}</span>
                      <span className="text-sm text-muted-foreground">({provider.reviewCount} reviews)</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {provider.location}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Experience:</span>
                        <p className="font-medium text-foreground">{provider.yearsExperience} years</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Response:</span>
                        <p className="font-medium text-foreground">{provider.responseTime}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Commission:</span>
                        <p className="font-medium text-foreground">{provider.commissionRate}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Insurance:</span>
                        <p className={`font-medium ${provider.insurance ? "text-green-600" : "text-red-650"}`}>
                          {provider.insurance ? "Covered" : "Not Covered"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Equipment:</p>
                      <div className="flex flex-wrap gap-1">
                        {provider.equipment.slice(0, 3).map((item, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                        {provider.equipment.length > 3 && (
                          <Badge variant="outline" className="text-xs border-border">
                            +{provider.equipment.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Certifications:</p>
                      <div className="flex flex-wrap gap-1">
                        {provider.certifications.map((cert, index) => (
                          <Badge key={index} variant="outline" className="text-xs border-border">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border space-y-2">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-2.5 transition-all duration-300 border-0">
                        View Services
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="rounded-full">
                          View Portfolio
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-full">
                          Contact
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {((activeTab === "services" && filteredServices.length === 0) ||
            (activeTab === "providers" && filteredProviders.length === 0)) && (
              <div className="text-center py-12">
                <Plane className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No {activeTab} found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search criteria or expanding your location range.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setLocationFilter("")
                    setServiceTypeFilter("all")
                  }}
                  className="rounded-full"
                >
                  Clear Filters
                </Button>
              </div>
            )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#181816] text-[#f3f1eb]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-display mb-4">Ready to Become a Service Provider?</h2>
          <p className="text-lg mb-8 text-muted-foreground max-w-2xl mx-auto">
            Join our marketplace and start earning with your drone skills. List your services and connect with clients nationwide.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-primary text-white hover:bg-primary/90 rounded-full px-6 py-3.5 border-0">
              Apply as Provider
            </Button>
            <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-muted rounded-full px-6 py-3.5">
              Learn More
            </Button>
          </div>
        </div>
      </section>

        </div>

        <ComingSoonOverlay
          show={!isAdmin && !isLoading}
          title="Access Restricted"
          description="This section is locked for regular customers. Only administrators can access this content."
        />
      </main>

      {/* FAQ Section */}
      <FAQSection pageName="Drone Services" customFAQs={serviceFAQs} />
      <ModernFooter />
    </div>
  )
}
