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
import { ComingSoonOverlay } from "@/components/ui/coming-soon-overlay"
import { FAQSection } from "@/components/layout/faq-section"

const categoryFAQs = [
  {
    question: "What is the most popular drone category?",
    answer: "Photography drones are our most popular category, followed by racing drones. Each category serves a unique purpose and skill level."
  },
  {
    question: "Do you offer multi-purpose drones?",
    answer: "Yes, many of our high-end models can be customized with different payloads to perform multiple functions, such as photography and mapping."
  },
  {
    question: "Which category is best for beginners?",
    answer: "We have a dedicated 'Beginner Drones' category with models that are easy to fly, durable, and affordable, making them perfect for learning."
  }
]

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
    color: "text-blue-500",
    bgColor: "from-blue-100 to-blue-200"
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

function CategoryLogo({ slug, className }: { slug: string; className?: string }) {
  const baseSvgClass = "w-6 h-6 transition-all duration-300 group-hover:scale-110";
  switch (slug) {
    case "racing-drones":
      return (
        <svg className={className || baseSvgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 15l2-2 4 4m6-12l4 4-2 2M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0 -6 0" />
          <path d="M13 18l4-4 3 3M3 7l3 3-2 2" />
          <circle cx="12" cy="12" r="1.5" className="fill-primary animate-pulse" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeDasharray="2 2" className="animate-spin-slow origin-center" />
        </svg>
      );
    case "photography-drones":
      return (
        <svg className={className || baseSvgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2a10 10 0 0 1 8 4M12 22a10 10 0 0 1-8-4M2 12a10 10 0 0 1 4-8M22 12a10 10 0 0 1-4 8" />
          <line x1="6" y1="6" x2="9.5" y2="9.5" />
          <line x1="18" y1="18" x2="14.5" y2="14.5" />
          <line x1="18" y1="6" x2="14.5" y2="9.5" />
          <line x1="6" y1="18" x2="9.5" y2="14.5" />
        </svg>
      );
    case "surveillance-drones":
      return (
        <svg className={className || baseSvgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="M12 6v12M6 12h12" />
          <circle cx="12" cy="12" r="4" className="stroke-primary" />
          <path d="M8 8l8 8" />
          <circle cx="12" cy="12" r="1" className="fill-primary" />
        </svg>
      );
    case "agricultural-drones":
      return (
        <svg className={className || baseSvgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20M2 12h20" />
          <circle cx="12" cy="12" r="3" />
          <path d="M5 5c0 4 4 7 7 7s7-3 7-7" className="stroke-primary" />
          <path d="M12 12s-3-3-7-3M12 12s3-3 7-3" />
          <circle cx="5" cy="5" r="1.5" className="fill-primary" />
          <circle cx="19" cy="5" r="1.5" className="fill-primary" />
        </svg>
      );
    case "delivery-drones":
      return (
        <svg className={className || baseSvgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v6M8 8h8v6H8z" />
          <path d="M6 5h12M12 14v4M10 18h4" />
          <rect x="9" y="19" width="6" height="3" rx="0.5" className="stroke-primary" />
          <circle cx="6" cy="5" r="1" />
          <circle cx="18" cy="5" r="1" />
        </svg>
      );
    case "military-defense":
      return (
        <svg className={className || baseSvgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 22l10-4 10 4L12 2z" />
          <path d="M12 6v8M12 18h.01" />
          <path d="M8 14h8" className="stroke-primary" />
        </svg>
      );
    case "search-rescue":
      return (
        <svg className={className || baseSvgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2v20M2 12h20" />
          <circle cx="12" cy="12" r="6" className="stroke-primary animate-pulse" />
          <circle cx="12" cy="12" r="1" className="fill-primary" />
        </svg>
      );
    case "mapping-drones":
      return (
        <svg className={className || baseSvgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          <circle cx="12" cy="12" r="1.5" className="fill-primary" />
        </svg>
      );
    case "beginner-drones":
      return (
        <svg className={className || baseSvgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="6" r="3" className="stroke-primary" />
          <circle cx="18" cy="18" r="3" className="stroke-primary" />
          <path d="M6 9l12 6M18 9L6 15" />
          <circle cx="18" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
        </svg>
      );
    default:
      return (
        <svg className={className || baseSvgClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      );
  }
}

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [filteredCategories, setFilteredCategories] = useState(droneCategories)
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth()

  const isLoading = authLoading

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
    <div className="min-h-screen flex flex-col bg-[#fbf9f6] dark:bg-slate-950 text-[#191919] dark:text-slate-100 transition-colors duration-300">
      <ModernHeader />

      <main className="flex-1">
        {/* Elegant Editorial Hero Section */}
        <section className="relative bg-[#fbf9f6] dark:bg-slate-950 text-slate-900 dark:text-slate-100 pt-28 lg:pt-36 pb-16 border-b border-slate-100/60 dark:border-slate-800/60 overflow-hidden text-center">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.01] pointer-events-none"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Subtle top indicator */}
              <div className="inline-flex items-center justify-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                <span className="text-[11px] font-bold tracking-[0.25em] text-slate-400 uppercase font-sans">
                  Fleet Classification
                </span>
              </div>
              {/* Beautiful massive editorial headline */}
              <h1 className="text-5xl md:text-7xl font-light tracking-[-0.02em] font-serif text-slate-900 dark:text-slate-100 leading-tight">
                Explore Our <span className="font-semibold text-primary block sm:inline">Drone Categories</span>
              </h1>
              {/* Large book-like italicized summary */}
              <p className="text-xl md:text-2xl text-slate-750 dark:text-slate-300 italic max-w-3xl mx-auto leading-relaxed font-serif">
                Discover specialized drone classifications designed for specific aerial missions—ranging from high-speed aerobatic racing to high-precision LiDAR mapping and security operations.
              </p>
            </div>
          </div>
        </section>
 
        <div className="relative">
          <div className={!isAdmin && !isLoading ? "opacity-20 blur-sm pointer-events-none transition-all duration-300" : "transition-all duration-300"}>
            
            {/* Search and Filter Section */}
            <section className="py-8 bg-[#fbf9f6] dark:bg-slate-950 border-b border-slate-100/50 dark:border-slate-800/50">
              <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row gap-6 items-center justify-between max-w-4xl mx-auto">
                  
                  {/* Premium search bar with pill input */}
                  <div className="w-full md:w-96 relative">
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-6 py-3 font-sans text-sm border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-slate-150 backdrop-blur-md rounded-full focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300"
                    />
                  </div>
 
                  {/* Premium dropdown selector */}
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-450 font-sans">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-slate-200 dark:border-slate-800 rounded-full px-5 py-2 font-sans text-sm bg-white/70 dark:bg-slate-900/70 text-slate-900 dark:text-slate-150 backdrop-blur-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-300 cursor-pointer"
                    >
                      <option value="name">Alphabetical</option>
                      <option value="products">Product Volume</option>
                      <option value="price">Valuation Range</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>
 
            {/* Categories Grid */}
            <section className="py-16 bg-[#fbf9f6] dark:bg-slate-950">
              <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredCategories.map((category) => {
                    return (
                      <Card key={category.id} className="group overflow-hidden transition-all duration-500 hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_12px_30px_rgba(0,0,0,0.3)] hover:-translate-y-1 bg-white dark:bg-slate-900 border border-slate-100/50 dark:border-slate-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] rounded-3xl">
                        <Link href={`/products?category=${encodeURIComponent(category.name)}`}>
                          <div className="relative">
                            <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-slate-950">
                              <img
                                src={category.imageUrl}
                                alt={category.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            </div>
                            
                            <div className="absolute top-4 right-4 z-10">
                              <Badge className="bg-slate-900/90 dark:bg-slate-100/90 text-white dark:text-slate-950 font-sans text-[11px] font-semibold tracking-wider rounded-full px-3 py-1 shadow-sm uppercase">
                                {category.productCount} models
                              </Badge>
                            </div>
                          </div>
                        </Link>

                        <CardContent className="p-6 space-y-4">
                          <Link href={`/products?category=${encodeURIComponent(category.name)}`}>
                            <div className="flex items-center space-x-3 mb-1">
                              <CategoryLogo slug={category.slug} className="h-5 w-5 text-primary shrink-0" />
                              <h3 className="text-2xl font-serif font-normal text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                                {category.name}
                              </h3>
                            </div>
                          </Link>
                          
                          <p className="text-slate-600 dark:text-slate-350 font-serif text-[15px] leading-relaxed">
                            {category.description}
                          </p>

                          <div className="pt-2">
                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 font-sans">Key Capabilities</p>
                            <div className="flex flex-wrap gap-2">
                              {category.features.slice(0, 3).map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-sans px-2.5 py-0.5 rounded-full bg-slate-50/50 dark:bg-slate-950/50">
                                  {feature}
                                </Badge>
                              ))}
                              {category.features.length > 3 && (
                                <Badge variant="outline" className="text-xs border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-sans px-2.5 py-0.5 rounded-full bg-slate-50/50 dark:bg-slate-950/50">
                                  +{category.features.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/80">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans mb-0.5">Price Range</p>
                              <span className="text-lg font-bold text-slate-800 dark:text-slate-200 font-sans">{category.priceRange}</span>
                            </div>
                            <Link href={`/products?category=${encodeURIComponent(category.name)}`}>
                              <Button className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-150 dark:text-slate-900 font-sans text-[12px] font-semibold tracking-wider uppercase px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                                Explore
                                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {filteredCategories.length === 0 && (
                  <div className="text-center py-16">
                    <div className="max-w-md mx-auto">
                      <Search className="h-16 w-16 text-slate-350 dark:text-slate-600 mx-auto mb-4" />
                      <h3 className="text-2xl font-serif font-normal text-slate-900 dark:text-slate-100 mb-2">No Categories Found</h3>
                      <p className="text-slate-600 dark:text-slate-400 font-serif">No categories match your search criteria. Try adjusting your search terms.</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Locked Overlay */}
          <ComingSoonOverlay
            show={!isAdmin && !isLoading}
            title="Access Restricted"
            description="This section is locked for regular customers. Only administrators can access this content."
          />
        </div>
      </main>

      <FAQSection pageName="Drone Categories" customFAQs={categoryFAQs} />
      <ModernFooter />
    </div>
  )
}
