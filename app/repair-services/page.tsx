"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Clock, Star, Wrench, Phone, Mail, Shield, Award, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
import { useAuth } from "@/contexts/auth-context"
import { ComingSoonOverlay } from "@/components/ui/coming-soon-overlay"
import { FAQSection } from "@/components/layout/faq-section"

const repairFAQs = [
  {
    question: "How long do typical repairs take?",
    answer: "Most common repairs like motor replacements or sensor calibrations take 2-3 business days. More complex structural or gimbal repairs may take up to a week."
  },
  {
    question: "Do you offer warranties on repairs?",
    answer: "Yes, many of our authorized repair centers offer a 30 to 90-day warranty on the specific parts replaced and the labor performed."
  },
  {
    question: "Can you help with insurance claims?",
    answer: "Our technicians can provide detailed damage assessment reports and repair estimates that you can submit to your insurance provider."
  }
]

interface RepairCenter {
  id: string
  name: string
  description: string
  address: string
  city: string
  state: string
  phone: string
  email: string
  website?: string
  rating: number
  reviewCount: number
  isAuthorized: boolean
  isVerified: boolean
  specialties: string[]
  certifications: string[]
  brands: string[]
  services: RepairService[]
  turnaroundTime: string
  emergencyService: boolean
  pickupDelivery: boolean
  warrantyOffered: boolean
  distance?: number
  profileImage: string
  gallery: string[]
}

interface RepairService {
  id: string
  name: string
  description: string
  estimatedCost: string
  estimatedTime: string
  category: string
}

const repairCenters: RepairCenter[] = [
  {
    id: "1",
    name: "TechDrone Repair Hub",
    description: "Authorized repair center specializing in DJI, Autel, and Parrot drones with certified technicians.",
    address: "1247 Aviation Road, Andheri East",
    city: "Mumbai",
    state: "MH",
    phone: "+91 22 4567 8901",
    email: "repairs@techdronehub.com",
    website: "www.techdronehub.com",
    rating: 4.8,
    reviewCount: 342,
    isAuthorized: true,
    isVerified: true,
    specialties: ["DJI Drones", "Camera Gimbals", "Flight Controllers", "Motor Replacement"],
    certifications: ["DJI Authorized", "DGCA Certified", "IPC Certified"],
    brands: ["DJI", "Autel", "Parrot", "Skydio"],
    turnaroundTime: "2-3 business days",
    emergencyService: true,
    pickupDelivery: true,
    warrantyOffered: true,
    distance: 2.5,
    profileImage: "/placeholder.svg?height=100&width=100&text=TechDrone",
    gallery: ["/placeholder.svg?height=200&width=300&text=Workshop+1"],
    services: [
      {
        id: "1-1",
        name: "Camera Gimbal Repair",
        description: "Complete gimbal diagnostic, calibration, and motor replacement",
        estimatedCost: "₹12,450 - ₹24,900",
        estimatedTime: "2-3 days",
        category: "Camera Systems"
      },
      {
        id: "1-2",
        name: "Flight Controller Replacement",
        description: "FC diagnostic, replacement, and configuration",
        estimatedCost: "₹16,600 - ₹33,200",
        estimatedTime: "1-2 days",
        category: "Electronics"
      },
      {
        id: "1-3",
        name: "Crash Damage Assessment",
        description: "Complete structural and electronic damage evaluation",
        estimatedCost: "₹4,150 - ₹8,300",
        estimatedTime: "1 day",
        category: "Diagnostics"
      },
      {
        id: "1-4",
        name: "General Drone Checkup",
        description: "Comprehensive 50-point inspection, firmware update, and sensor calibration.",
        estimatedCost: "₹2,500",
        estimatedTime: "4 hours",
        category: "Maintenance"
      }
    ]
  },
  {
    id: "2",
    name: "Precision Drone Services",
    description: "Specialized in racing and FPV drone repairs with custom modification services.",
    address: "856 Industrial Layout, HSR",
    city: "Bangalore",
    state: "KA",
    phone: "+91 80 4321 0987",
    email: "service@precisiondrones.com",
    rating: 4.9,
    reviewCount: 189,
    isAuthorized: false,
    isVerified: true,
    specialties: ["FPV Racing", "Custom Builds", "Motor Upgrades", "Frame Repairs"],
    certifications: ["MultiGP Certified", "IPC Soldering"],
    brands: ["Custom Builds", "TBS", "ImmersionRC", "Foxeer"],
    turnaroundTime: "1-2 business days",
    emergencyService: true,
    pickupDelivery: false,
    warrantyOffered: true,
    distance: 15.2,
    profileImage: "/placeholder.svg?height=100&width=100&text=Precision",
    gallery: ["/placeholder.svg?height=200&width=300&text=Racing+Shop"],
    services: [
      {
        id: "2-1",
        name: "Motor Replacement",
        description: "High-performance motor installation and tuning",
        estimatedCost: "₹6,640 - ₹12,450",
        estimatedTime: "4-6 hours",
        category: "Propulsion"
      },
      {
        id: "2-2",
        name: "Custom Build Service",
        description: "Complete custom racing drone assembly",
        estimatedCost: "₹33,200 - ₹66,400",
        estimatedTime: "3-5 days",
        category: "Assembly"
      }
    ]
  },
  {
    id: "3",
    name: "Agricultural Drone Solutions",
    description: "Specialized agricultural drone maintenance and modification services for farming operations.",
    address: "2154 Nashik Road",
    city: "Nashik",
    state: "MH",
    phone: "+91 253 234 5678",
    email: "support@agridronesolutions.com",
    rating: 4.7,
    reviewCount: 98,
    isAuthorized: true,
    isVerified: true,
    specialties: ["Agricultural Drones", "Spraying Systems", "GPS Integration", "Tank Repairs"],
    certifications: ["AgEagle Authorized", "PrecisionHawk Certified"],
    brands: ["AgEagle", "PrecisionHawk", "DJI Agras", "Yamaha"],
    turnaroundTime: "3-5 business days",
    emergencyService: false,
    pickupDelivery: true,
    warrantyOffered: true,
    distance: 45.8,
    profileImage: "/placeholder.svg?height=100&width=100&text=AgriDrone",
    gallery: ["/placeholder.svg?height=200&width=300&text=Farm+Service"],
    services: [
      {
        id: "3-1",
        name: "Spraying System Maintenance",
        description: "Complete cleaning, calibration, and nozzle replacement",
        estimatedCost: "₹16,600 - ₹29,050",
        estimatedTime: "1-2 days",
        category: "Spraying"
      },
      {
        id: "3-2",
        name: "RTK GPS Installation",
        description: "Precision GPS system installation and calibration",
        estimatedCost: "₹41,500 - ₹66,400",
        estimatedTime: "2-3 days",
        category: "Navigation"
      }
    ]
  },
  {
    id: "4",
    name: "AeroDefence Custom Labs",
    description: "Specialized in custom drone manufacturing for defense, industrial, and specialized multi-industry applications.",
    address: "Secure Facility, Tech Park",
    city: "Bangalore",
    state: "KA",
    phone: "+91 80 9999 8888",
    email: "secure@aerodefence.com",
    rating: 5.0,
    reviewCount: 42,
    isAuthorized: true,
    isVerified: true,
    specialties: ["Defence Drones", "Custom Fabrication", "Signal Encryption", "Heavy Lift Builds"],
    certifications: ["ISO 9001", "Defence Contractor Certified"],
    brands: ["Custom", "Tactical Systems"],
    turnaroundTime: "Custom timeline",
    emergencyService: true,
    pickupDelivery: true,
    warrantyOffered: true,
    distance: 12.4,
    profileImage: "/placeholder.svg?height=100&width=100&text=AeroDef",
    gallery: ["/placeholder.svg?height=200&width=300&text=Lab"],
    services: [
      {
        id: "4-1",
        name: "Custom Defense Build",
        description: "Bespoke drone design and manufacturing for surveillance and tactical operations",
        estimatedCost: "Custom Quote",
        estimatedTime: "4-8 weeks",
        category: "Assembly"
      },
      {
        id: "4-2",
        name: "Security Audits & Encryption",
        description: "Hardening current drone systems against signal jamming and interception",
        estimatedCost: "₹50,000+",
        estimatedTime: "1 week",
        category: "Security"
      }
    ]
  }
]

export default function RepairServicesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [specialtyFilter, setSpecialtyFilter] = useState("all")
  const [authorizedOnly, setAuthorizedOnly] = useState(false)
  const [filteredCenters, setFilteredCenters] = useState(repairCenters)
  const [selectedCenter, setSelectedCenter] = useState<RepairCenter | null>(null)
  const { isAdmin, isLoading: authLoading } = useAuth()
  const isLoading = authLoading

  useEffect(() => {
    let filtered = repairCenters.filter(center => {
      const matchesSearch = center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.specialties.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesLocation = !locationFilter ||
        center.city.toLowerCase().includes(locationFilter.toLowerCase()) ||
        center.state.toLowerCase().includes(locationFilter.toLowerCase())

      const matchesSpecialty = specialtyFilter === "all" ||
        center.specialties.some(spec => spec.toLowerCase().includes(specialtyFilter.toLowerCase()))

      const matchesAuthorized = !authorizedOnly || center.isAuthorized

      return matchesSearch && matchesLocation && matchesSpecialty && matchesAuthorized
    })

    // Sort by distance if available, then by rating
    filtered.sort((a, b) => {
      if (a.distance && b.distance) {
        return a.distance - b.distance
      }
      return b.rating - a.rating
    })

    setFilteredCenters(filtered)
  }, [searchTerm, locationFilter, specialtyFilter, authorizedOnly])

  const getServiceCategories = () => {
    const categories = new Set<string>()
    repairCenters.forEach(center => {
      center.services.forEach(service => {
        categories.add(service.category)
      })
    })
    return Array.from(categories)
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <ModernHeader />

      {/* Hero Section */}
      <section className="relative pt-28 lg:pt-36 pb-20 overflow-hidden text-center bg-background border-b border-border">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.01] pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Custom Wrench & Caliper Gear Telemetry Logo */}
            <div className="flex justify-center mb-2 animate-pulse">
              <svg className="w-20 h-20 text-primary" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="50" cy="50" r="40" strokeDasharray="3 3" className="opacity-30" />
                <circle cx="50" cy="50" r="12" />
                <path d="M50 32v6M50 62v6M32 50h6M62 50h6M37 37l4 4M63 63l4 4M37 63l4-4M63 37l4-4" strokeWidth="2" />
                <path d="M25 75l15-15M48 48l12-12" strokeWidth="3" strokeLinecap="round" />
                <path d="M22 78a4 4 0 0 0 6-6l-2-2a4 4 0 0 0-6 6l2 2z" className="fill-primary" />
                <path d="M58 42l10-10a6 6 0 0 1 8 8l-10 10" />
                <circle cx="50" cy="50" r="3" className="fill-primary" />
              </svg>
            </div>
            <div className="inline-flex items-center justify-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <span className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase font-mono">
                // DIAGNOSTICS & REPAIRS
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-light tracking-tight font-display text-foreground leading-tight">
              Drone Repair <span className="font-semibold text-primary block sm:inline">Services</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-sans font-light">
              Find certified repair centers and technicians near you. From crash diagnostics to performance upgrades, get back in the air safely.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Button size="lg" className="bg-primary hover:bg-primary/95 text-white rounded-full px-6 py-3.5 text-sm font-medium transition-all duration-300 border-0">
                <Wrench className="w-5 h-5 mr-2" />
                Find Repair Centers
              </Button>
              <Button size="lg" variant="outline" className="border border-border text-foreground hover:bg-muted rounded-full px-6 py-3.5 text-sm font-medium transition-all duration-300 bg-card/50 backdrop-blur-sm">
                Emergency Repair
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search repair centers or services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-full border-border bg-background"
                />
              </div>

              <div className="relative flex-1 max-w-md">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="City or State"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10 rounded-full border-border bg-background"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="border border-border rounded-full px-4 py-2 text-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              >
                <option value="all">All Specialties</option>
                {getServiceCategories().map(category => (
                  <option key={category} value={category.toLowerCase()}>{category}</option>
                ))}
              </select>

              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={authorizedOnly}
                  onChange={(e) => setAuthorizedOnly(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                Authorized Centers Only
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Repair Centers Grid */}
      <section className="py-12 relative bg-background">
        <div className="container mx-auto px-4">
          <div className={!isAdmin && !isLoading ? "opacity-20 blur-sm pointer-events-none transition-all duration-300" : "transition-all duration-300"}>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredCenters.map((center) => (
              <Card key={center.id} className="overflow-hidden hover:shadow-xl transition-all duration-350 border border-border bg-card rounded-3xl">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <img
                      src={center.profileImage}
                      alt={center.name}
                      className="w-16 h-16 rounded-2xl object-cover border border-border"
                    />
                    <div className="flex flex-col gap-1">
                      {center.isAuthorized && (
                        <Badge className="bg-green-600 text-white border-0">
                          <Award className="w-3 h-3 mr-1" />
                          Authorized
                        </Badge>
                      )}
                      {center.isVerified && (
                        <Badge variant="secondary" className="border-0">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardTitle className="text-xl mb-2 font-display">{center.name}</CardTitle>
                  <p className="text-muted-foreground text-sm mb-3 leading-relaxed">{center.description}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium text-foreground">{center.rating}</span>
                      <span className="text-muted-foreground">({center.reviewCount})</span>
                    </div>
                    {center.distance && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{center.distance} mi away</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Location and Contact */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{center.address}, {center.city}, {center.state}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{center.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Turnaround: {center.turnaroundTime}</span>
                    </div>
                  </div>

                  {/* Service Features */}
                  <div className="flex flex-wrap gap-2">
                    {center.emergencyService && (
                      <Badge variant="outline" className="text-xs bg-red-500/10 text-red-500 border-0">
                        Emergency Service
                      </Badge>
                    )}
                    {center.pickupDelivery && (
                      <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-0">
                        Pickup/Delivery
                      </Badge>
                    )}
                    {center.warrantyOffered && (
                      <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-0">
                        Warranty Offered
                      </Badge>
                    )}
                  </div>

                  {/* Specialties */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Specialties:</p>
                    <div className="flex flex-wrap gap-1">
                      {center.specialties.slice(0, 3).map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {center.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs border-border">
                          +{center.specialties.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Sample Services */}
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Popular Services:</p>
                    <div className="space-y-1">
                      {center.services.slice(0, 2).map((service) => (
                        <div key={service.id} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{service.name}</span>
                          <span className="text-primary font-medium">{service.estimatedCost}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-border space-y-2">
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-2.5 transition-all duration-300 border-0"
                      onClick={() => setSelectedCenter(center)}
                    >
                      View Details & Book
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="text-xs rounded-full">
                        <Phone className="w-3 h-3 mr-1" />
                        Call Now
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs rounded-full">
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCenters.length === 0 && (
            <div className="text-center py-12">
              <Wrench className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No repair centers found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search criteria or expanding your location range.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setLocationFilter("")
                  setSpecialtyFilter("all")
                  setAuthorizedOnly(false)
                }}
                className="rounded-full"
              >
                Clear All Filters
              </Button>
            </div>
          )}

          </div>
          <ComingSoonOverlay
            show={!isAdmin && !isLoading}
            title="Access Restricted"
            description="This section is locked for regular customers. Only administrators can access this content."
          />
        </div>
      </section>

      {/* Service Request CTA */}
      <section className="py-16 bg-[#181816] text-[#f3f1eb]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-display mb-4">Need Emergency Repair?</h2>
          <p className="text-lg mb-8 text-muted-foreground max-w-2xl mx-auto">
            Submit a repair request and we'll connect you with the nearest qualified technician within 24 hours.
          </p>
          <Button size="lg" className="bg-primary text-white hover:bg-primary/90 rounded-full px-6 py-3.5 border-0">
            <Wrench className="w-5 h-5 mr-2" />
            Submit Repair Request
          </Button>
        </div>
      </section>

      <FAQSection pageName="Repair Services" customFAQs={repairFAQs} />
      <ModernFooter />
    </div>
  )
}
