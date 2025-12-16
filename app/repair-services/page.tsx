"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Clock, Star, Wrench, Phone, Mail, Shield, Award, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"

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
    address: "1247 Aviation Blvd",
    city: "Los Angeles",
    state: "CA",
    phone: "(555) 123-4567",
    email: "repairs@techdronehub.com",
    website: "www.techdronehub.com",
    rating: 4.8,
    reviewCount: 342,
    isAuthorized: true,
    isVerified: true,
    specialties: ["DJI Drones", "Camera Gimbals", "Flight Controllers", "Motor Replacement"],
    certifications: ["DJI Authorized", "FAA Certified", "IPC Certified"],
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
    address: "856 Industrial Way",
    city: "Austin",
    state: "TX",
    phone: "(555) 234-5678",
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
    address: "2154 Farm Road 1420",
    city: "Des Moines",
    state: "IA",
    phone: "(555) 345-6789",
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
    phone: "(555) 999-8888",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <ModernHeader />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
            Drone Repair Services
          </h1>
          <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Find certified repair centers and technicians near you. From crash repairs to performance upgrades,
            get your drone back in the air with professional service and warranty coverage.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
              <Wrench className="w-5 h-5 mr-2" />
              Find Repair Centers
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900">
              Emergency Repair
            </Button>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search repair centers or services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="relative flex-1 max-w-md">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="City or State"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">All Specialties</option>
                {getServiceCategories().map(category => (
                  <option key={category} value={category.toLowerCase()}>{category}</option>
                ))}
              </select>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={authorizedOnly}
                  onChange={(e) => setAuthorizedOnly(e.target.checked)}
                  className="rounded"
                />
                Authorized Centers Only
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Repair Centers Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredCenters.map((center) => (
              <Card key={center.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <img
                      src={center.profileImage}
                      alt={center.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex flex-col gap-1">
                      {center.isAuthorized && (
                        <Badge className="bg-green-600 text-white">
                          <Award className="w-3 h-3 mr-1" />
                          Authorized
                        </Badge>
                      )}
                      {center.isVerified && (
                        <Badge variant="secondary">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardTitle className="text-xl mb-2">{center.name}</CardTitle>
                  <p className="text-gray-600 text-sm mb-3">{center.description}</p>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{center.rating}</span>
                      <span className="text-gray-500">({center.reviewCount})</span>
                    </div>
                    {center.distance && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{center.distance} mi away</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Location and Contact */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{center.address}, {center.city}, {center.state}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{center.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Turnaround: {center.turnaroundTime}</span>
                    </div>
                  </div>

                  {/* Service Features */}
                  <div className="flex flex-wrap gap-2">
                    {center.emergencyService && (
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                        Emergency Service
                      </Badge>
                    )}
                    {center.pickupDelivery && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                        Pickup/Delivery
                      </Badge>
                    )}
                    {center.warrantyOffered && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                        Warranty Offered
                      </Badge>
                    )}
                  </div>

                  {/* Specialties */}
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Specialties:</p>
                    <div className="flex flex-wrap gap-1">
                      {center.specialties.slice(0, 3).map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {center.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{center.specialties.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Sample Services */}
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Popular Services:</p>
                    <div className="space-y-1">
                      {center.services.slice(0, 2).map((service) => (
                        <div key={service.id} className="flex justify-between text-xs">
                          <span className="text-gray-700">{service.name}</span>
                          <span className="text-blue-600 font-medium">{service.estimatedCost}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t space-y-2">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => setSelectedCenter(center)}
                    >
                      View Details & Book
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Phone className="w-3 h-3 mr-1" />
                        Call Now
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
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
              <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No repair centers found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search criteria or expanding your location range.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setLocationFilter("")
                  setSpecialtyFilter("all")
                  setAuthorizedOnly(false)
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Service Request CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Emergency Repair?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Submit a repair request and we'll connect you with the nearest qualified technician within 24 hours.
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
            <Wrench className="w-5 h-5 mr-2" />
            Submit Repair Request
          </Button>
        </div>
      </section>

      <ModernFooter />
    </div>
  )
}
