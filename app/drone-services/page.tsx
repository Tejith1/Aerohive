"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Clock, Star, Camera, Plane, Droplets, Map, DollarSign, Calendar, Shield, Award, Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
import { calculateDistance } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

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
    location: "Denver, CO",
    rating: 4.9,
    reviewCount: 127,
    isVerified: true,
    licenseNumber: "FAA-107-SM-2024",
    insurance: true,
    yearsExperience: 8,
    commissionRate: 12,
    responseTime: "< 4 hours",
    equipment: ["DJI Matrice 300", "LiDAR L1", "RTK Module", "Survey-grade GPS"],
    certifications: ["FAA Part 107", "Survey Mapping", "Photogrammetry Certified"],
    profileImage: "/placeholder.svg?height=100&width=100&text=SkyMapper",
    portfolio: ["/placeholder.svg?height=200&width=300&text=Mapping+Sample"],
    contactInfo: {
      phone: "(555) 123-4567",
      email: "projects@skymapperpro.com",
      website: "www.skymapperpro.com"
    },
    lat: 39.7392,
    lng: -104.9903
  },
  {
    id: "2",
    companyName: "AgriSpray Solutions",
    description: "Precision agriculture specialists providing crop spraying, monitoring, and analysis services.",
    location: "Fresno, CA",
    rating: 4.8,
    reviewCount: 89,
    isVerified: true,
    licenseNumber: "FAA-107-AS-2024",
    insurance: true,
    yearsExperience: 6,
    commissionRate: 10,
    responseTime: "< 6 hours",
    equipment: ["DJI Agras T40", "Precision Sprayer", "Multispectral Camera", "Weather Station"],
    certifications: ["FAA Part 107", "Agricultural Spray License", "Precision Agriculture"],
    profileImage: "/placeholder.svg?height=100&width=100&text=AgriSpray",
    portfolio: ["/placeholder.svg?height=200&width=300&text=Farm+Spraying"],
    contactInfo: {
      phone: "(555) 234-5678",
      email: "services@agrispraysolutions.com"
    },
    lat: 36.7378,
    lng: -119.7871
  },
  {
    id: "3",
    companyName: "AerialVision Studios",
    description: "Cinematic aerial photography and videography for real estate, events, and commercial productions.",
    location: "Los Angeles, CA",
    rating: 4.9,
    reviewCount: 203,
    isVerified: true,
    licenseNumber: "FAA-107-AV-2024",
    insurance: true,
    yearsExperience: 10,
    commissionRate: 15,
    responseTime: "< 2 hours",
    equipment: ["DJI Inspire 3", "Hasselblad X9", "FPV Cinewhoop", "RED Digital Cinema"],
    certifications: ["FAA Part 107", "Film Production", "Real Estate Certified"],
    profileImage: "/placeholder.svg?height=100&width=100&text=AerialVision",
    portfolio: ["/placeholder.svg?height=200&width=300&text=Aerial+Photo"],
    contactInfo: {
      phone: "(555) 345-6789",
      email: "bookings@aerialvisionstudios.com",
      website: "www.aerialvisionstudios.com"
    },
    lat: 34.0522,
    lng: -118.2437
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
  const [isSyncing, setIsSyncing] = useState(true)

  // Use a safety timeout for loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSyncing(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!authLoading) {
      setIsSyncing(false)
    }
  }, [authLoading])

  const isLoading = authLoading || isSyncing

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <ModernHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
            Drone-as-a-Service Marketplace
          </h1>
          <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Connect with certified drone service providers for mapping, surveillance, spraying, photography, and more.
            Professional services delivered by licensed pilots with commercial-grade equipment.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
              <Plane className="w-5 h-5 mr-2" />
              Find Services
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900">
              Become a Provider
            </Button>
          </div>
        </div>
      </section>

      {/* Navigation and Search */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={activeTab === "services" ? "default" : "ghost"}
                onClick={() => setActiveTab("services")}
                className="rounded-md"
              >
                <Plane className="w-4 h-4 mr-2" />
                Services
              </Button>
              <Button
                variant={activeTab === "providers" ? "default" : "ghost"}
                onClick={() => setActiveTab("providers")}
                className="rounded-md"
              >
                <Award className="w-4 h-4 mr-2" />
                Providers
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              <div className="flex items-center gap-2 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10 w-48 pr-8"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-blue-600"
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
                  className="border rounded-md px-3 py-2 text-sm"
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
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { type: "mapping", label: "Mapping", icon: Map, count: 45 },
              { type: "photography", label: "Photography", icon: Camera, count: 78 },
              { type: "spraying", label: "Agriculture", icon: Droplets, count: 32 },
              { type: "surveillance", label: "Surveillance", icon: Shield, count: 23 },
              { type: "inspection", label: "Inspection", icon: Search, count: 56 },
              { type: "delivery", label: "Delivery", icon: Plane, count: 12 }
            ].map(category => {
              const Icon = category.icon
              return (
                <div
                  key={category.type}
                  className={`p-4 rounded-lg text-center cursor-pointer transition-all ${serviceTypeFilter === category.type
                    ? "bg-blue-600 text-white"
                    : "bg-white hover:bg-blue-50 text-gray-900"
                    }`}
                  onClick={() => setServiceTypeFilter(category.type)}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${serviceTypeFilter === category.type ? "text-white" : "text-blue-600"
                    }`} />
                  <p className="font-medium text-sm">{category.label}</p>
                  <p className="text-xs opacity-75">{category.count} services</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 relative">
        <div className="container mx-auto px-4">
          {activeTab === "services" ? (
            <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 ${!isAdmin && !authLoading ? 'blur-md pointer-events-none select-none opacity-40' : ''}`}>
              {filteredServices.map((service) => {
                const provider = getProviderById(service.providerId)
                const ServiceIcon = getServiceIcon(service.serviceType)

                return (
                  <Card key={service.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <ServiceIcon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <Badge variant="secondary" className="capitalize">
                              {service.serviceType}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatPrice(service)}
                          </div>
                          {service.minDuration && (
                            <div className="text-xs text-gray-500">
                              Min {service.minDuration}h
                            </div>
                          )}
                        </div>
                      </div>

                      <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                      <p className="text-gray-600 text-sm">{service.description}</p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Provider Info */}
                      {provider && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <img
                            src={provider.profileImage}
                            alt={provider.companyName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900">{provider.companyName}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span className="text-xs text-gray-600">{provider.rating} ({provider.reviewCount})</span>
                              </div>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-600">{provider.location}</span>
                            </div>
                          </div>
                          {provider.isVerified && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Service Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{service.turnaroundTime}</span>
                        </div>
                        {service.maxCoverage && (
                          <div className="flex items-center gap-2">
                            <Map className="w-4 h-4 text-gray-400" />
                            <span>Up to {service.maxCoverage} acres</span>
                          </div>
                        )}
                      </div>

                      {/* Equipment */}
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">Equipment Used:</p>
                        <div className="flex flex-wrap gap-1">
                          {service.equipment.slice(0, 3).map((item, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                          {service.equipment.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{service.equipment.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Deliverables */}
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-2">You'll Receive:</p>
                        <div className="space-y-1">
                          {service.deliverables.slice(0, 3).map((item, index) => (
                            <div key={index} className="text-xs text-gray-600 flex items-center gap-1">
                              <div className="w-1 h-1 bg-blue-600 rounded-full" />
                              {item}
                            </div>
                          ))}
                          {service.deliverables.length > 3 && (
                            <div className="text-xs text-blue-600">
                              +{service.deliverables.length - 3} more deliverables
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-4 border-t space-y-2">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Request Quote
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm">
                            View Portfolio
                          </Button>
                          <Button variant="outline" size="sm">
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
            <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 ${!isAdmin && !authLoading ? 'blur-md pointer-events-none select-none opacity-40' : ''}`}>
              {filteredProviders.map((provider) => (
                <Card key={provider.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
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

                    <CardTitle className="text-xl mb-2">{provider.companyName}</CardTitle>
                    <p className="text-gray-600 text-sm mb-3">{provider.description}</p>

                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{provider.rating}</span>
                      <span className="text-sm text-gray-500">({provider.reviewCount} reviews)</span>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {provider.location}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Experience:</span>
                        <p className="font-medium">{provider.yearsExperience} years</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Response:</span>
                        <p className="font-medium">{provider.responseTime}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Commission:</span>
                        <p className="font-medium">{provider.commissionRate}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Insurance:</span>
                        <p className={`font-medium ${provider.insurance ? "text-green-600" : "text-red-600"}`}>
                          {provider.insurance ? "Covered" : "Not Covered"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Equipment:</p>
                      <div className="flex flex-wrap gap-1">
                        {provider.equipment.slice(0, 3).map((item, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                        {provider.equipment.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{provider.equipment.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Certifications:</p>
                      <div className="flex flex-wrap gap-1">
                        {provider.certifications.map((cert, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t space-y-2">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        View Services
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm">
                          View Portfolio
                        </Button>
                        <Button variant="outline" size="sm">
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
                <Plane className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No {activeTab} found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search criteria or expanding your location range.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setLocationFilter("")
                    setServiceTypeFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}

          {/* Coming Soon Overlay */}
          {!isAdmin && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-20 px-4">
              <div className="max-w-md w-full bg-white/95 backdrop-blur-sm border border-gray-200 p-8 rounded-3xl shadow-2xl text-center transform transition-all duration-500 animate-in fade-in zoom-in slide-in-from-bottom-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
                  <Lock className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Coming Soon
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  Our drone services marketplace is currently being prepared. Professional service providers will be available soon.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Become a Service Provider?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join our marketplace and start earning with your drone skills. List your services and connect with clients nationwide.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Apply as Provider
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <ModernFooter />
    </div>
  )
}
