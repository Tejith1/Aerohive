"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Grid3x3, List, ArrowRight, Zap, Camera, Shield, Truck, Globe, MapPin, Plane, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
import { useAuth } from "@/contexts/auth-context"
import { Lock } from "lucide-react"

// Drone categories data with icons and updated design
const droneCategories = [
  {
    id: 1,
    name: "Racing Drones",
    slug: "racing-drones",
    description: "High-speed, agile drones built for competitive racing and aerobatic flights",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Racing+Drone",
    productCount: 45,
    features: ["High speed", "Agile handling", "Lightweight", "Competition ready"],
    priceRange: "₹16,600 - ₹1,66,000",
    icon: Zap,
    color: "text-red-500",
    bgColor: "from-red-100 to-red-200"
  },
  {
    id: 2,
    name: "Photography Drones",
    slug: "photography-drones",
    description: "Professional cameras with stabilization for aerial photography and videography",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Photography+Drone",
    productCount: 78,
    features: ["4K+ cameras", "Gimbal stabilization", "Long flight time", "Professional quality"],
    priceRange: "₹41,500 - ₹8,30,000",
    icon: Camera,
    color: "text-blue-500",
    bgColor: "from-blue-100 to-blue-200"
  },
  {
    id: 3,
    name: "Surveillance Drones",
    slug: "surveillance-drones",
    description: "Advanced monitoring and security drones with night vision and thermal imaging",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Surveillance+Drone",
    productCount: 32,
    features: ["Night vision", "Thermal imaging", "Long range", "Stealth operation"],
    priceRange: "₹83,000 - ₹20,75,000",
    icon: Shield,
    color: "text-purple-500",
    bgColor: "from-purple-100 to-purple-200"
  },
  {
    id: 4,
    name: "Agricultural Drones",
    slug: "agricultural-drones",
    description: "Precision agriculture drones for crop monitoring, spraying, and field analysis",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Agricultural+Drone",
    productCount: 24,
    features: ["Crop spraying", "Field mapping", "Large payload", "Weather resistant"],
    priceRange: "₹2,49,000 - ₹41,50,000",
    icon: Globe,
    color: "text-green-500",
    bgColor: "from-green-100 to-green-200"
  },
  {
    id: 5,
    name: "Delivery Drones",
    slug: "delivery-drones",
    description: "Commercial delivery drones with high payload capacity and GPS navigation",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Delivery+Drone",
    productCount: 18,
    features: ["High payload", "GPS navigation", "Autonomous flight", "Drop mechanism"],
    priceRange: "₹1,66,000 - ₹12,45,000",
    icon: Truck,
    color: "text-orange-500",
    bgColor: "from-orange-100 to-orange-200"
  },
  {
    id: 6,
    name: "Military/Defense",
    slug: "military-defense",
    description: "Tactical drones for defense applications with advanced surveillance capabilities",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Military+Drone",
    productCount: 12,
    features: ["Tactical design", "Encrypted communication", "Extended range", "Ruggedized"],
    priceRange: "₹8,30,000 - ₹83,00,000",
    icon: Shield,
    color: "text-gray-700",
    bgColor: "from-gray-100 to-gray-200"
  },
  {
    id: 7,
    name: "Search & Rescue",
    slug: "search-rescue",
    description: "Emergency response drones with thermal sensors and communication equipment",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Search+Rescue+Drone",
    productCount: 15,
    features: ["Thermal sensors", "Emergency communication", "Weather resistant", "Long flight time"],
    priceRange: "₹4,15,000 - ₹24,90,000",
    icon: Users,
    color: "text-cyan-600",
    bgColor: "from-cyan-100 to-cyan-200"
  },
  {
    id: 8,
    name: "Mapping Drones",
    slug: "mapping-drones",
    description: "Precision mapping and surveying drones with advanced GPS and sensors",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Mapping+Drone",
    productCount: 28,
    features: ["High precision GPS", "LiDAR sensors", "Photogrammetry", "Survey grade"],
    priceRange: "₹6,64,000 - ₹66,40,000",
    icon: MapPin,
    color: "text-indigo-500",
    bgColor: "from-indigo-100 to-indigo-200"
  },
  {
    id: 9,
    name: "Beginner Drones",
    slug: "beginner-drones",
    description: "Easy-to-fly drones perfect for beginners and hobbyists learning to pilot",
    imageUrl: "/placeholder.svg?height=400&width=400&text=Beginner+Drone",
    productCount: 67,
    features: ["Easy controls", "Crash protection", "Training modes", "Affordable"],
    priceRange: "₹4,150 - ₹41,500",
    icon: Plane,
    color: "text-emerald-500",
    bgColor: "from-emerald-100 to-emerald-200"
  }
]

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [filteredCategories, setFilteredCategories] = useState(droneCategories)
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth()
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
    let filtered = droneCategories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Sort categories
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "products":
          return b.productCount - a.productCount
        case "price":
          return a.priceRange.localeCompare(b.priceRange)
        default:
          return 0
      }
    })

    setFilteredCategories(filtered)
  }, [searchTerm, sortBy])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <ModernHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex items-center justify-center mb-8">
                <Plane className="h-16 w-16 mr-4 text-cyan-400" />
                <span className="text-2xl font-bold">Drone Categories</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-extrabold mb-8 text-white">
                Explore Our
                <span className="block text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                  Drone Categories
                </span>
              </h1>
              <p className="text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
                Discover specialized drones for every mission - from racing and photography to commercial surveillance and agricultural operations.
              </p>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-12 bg-white border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between max-w-4xl mx-auto">
              <div className="flex-1 relative max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium text-gray-700">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border-2 border-gray-200 rounded-xl px-4 py-3 text-lg bg-white focus:border-blue-500 transition-colors"
                  >
                    <option value="name">Name</option>
                    <option value="products">Product Count</option>
                    <option value="price">Price Range</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Categories Grid */}
        <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative">
          <div className="container mx-auto px-4">
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${!isAdmin && !isLoading ? 'blur-md pointer-events-none select-none opacity-40' : ''}`}>
              {filteredCategories.map((category) => {
                const IconComponent = category.icon
                return (
                  <Card key={category.id} className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 bg-white border-0 shadow-lg">
                    <Link href={`/products?category=${encodeURIComponent(category.name)}`}>
                      <div className="relative">
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-blue-600 text-white shadow-lg">
                            {category.productCount} models
                          </Badge>
                        </div>
                        <div className="absolute top-4 left-4">
                          <div className={`w-12 h-12 bg-gradient-to-br ${category.bgColor} rounded-full flex items-center justify-center shadow-lg`}>
                            <IconComponent className={`h-6 w-6 ${category.color}`} />
                          </div>
                        </div>
                      </div>
                    </Link>

                    <CardContent className="p-6">
                      <Link href={`/products?category=${encodeURIComponent(category.name)}`}>
                        <h3 className="text-2xl font-bold mb-3 text-slate-900 group-hover:text-blue-600 transition-colors">
                          {category.name}
                        </h3>
                      </Link>
                      <p className="text-slate-600 mb-4 leading-relaxed">
                        {category.description}
                      </p>

                      <div className="mb-6">
                        <p className="text-sm font-semibold text-blue-600 mb-3">Key Features:</p>
                        <div className="flex flex-wrap gap-2">
                          {category.features.slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs border-gray-300 text-gray-600">
                              {feature}
                            </Badge>
                          ))}
                          {category.features.length > 3 && (
                            <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                              +{category.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-slate-500 mb-1">Price Range</p>
                          <span className="text-xl font-bold text-blue-600">{category.priceRange}</span>
                        </div>
                        <Link href={`/products?category=${encodeURIComponent(category.name)}`}>
                          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-300">
                            Explore Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Locked Overlay */}
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
                    We are currently expanding our specialized categories. Standard and premium access levels will be updated soon.
                  </p>
                </div>
              </div>
            )}

            {filteredCategories.length === 0 && (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No Categories Found</h3>
                  <p className="text-gray-600">No categories match your search criteria. Try adjusting your search terms.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <ModernFooter />
    </div>
  )
}
