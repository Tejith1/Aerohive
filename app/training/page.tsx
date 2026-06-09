"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Filter, MapPin, Clock, Users, Star, Award, Calendar, BookOpen, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
import { useAuth } from "@/contexts/auth-context"
import { ComingSoonOverlay } from "@/components/ui/coming-soon-overlay"
import { FAQSection } from "@/components/layout/faq-section"

const trainingFAQs = [
  {
    question: "Do I need any previous experience to start training?",
    answer: "No, we have beginner courses specifically designed for those who have never flown a drone before. We'll guide you from the basics to professional certification."
  },
  {
    question: "What is the Part 107 certification?",
    answer: "The FAA Part 107 is the required 'Remote Pilot Certificate' for anyone operating drones commercially in the United States. Many other countries have similar requirements."
  },
  {
    question: "Are the courses available online?",
    answer: "Yes, we offer many courses in a 'Hybrid' format where the theoretical parts are online and the practical flight training is conducted in-person."
  }
]

interface TrainingProvider {
  id: string
  companyName: string
  contactPerson: string
  location: string
  rating: number
  reviewCount: number
  specializations: string[]
  certifications: string[]
  isVerified: boolean
  profileImage: string
  description: string
}

interface TrainingCourse {
  id: string
  providerId: string
  title: string
  description: string
  level: "Beginner" | "Intermediate" | "Advanced" | "Professional"
  duration: number // hours
  price: number
  maxParticipants: number
  currentEnrollment: number
  startDate: string
  endDate: string
  format: "Online" | "In-Person" | "Hybrid"
  location?: string
  certificationProvided: boolean
  prerequisites: string[]
  courseOutline: string[]
  nextAvailable: string
}

const trainingProviders: TrainingProvider[] = [
  {
    id: "1",
    companyName: "Elite Drone Academy",
    contactPerson: "Sarah Johnson",
    location: "Los Angeles, CA",
    rating: 4.9,
    reviewCount: 234,
    specializations: ["Commercial Piloting", "Aerial Photography", "Mapping & Surveying"],
    certifications: ["FAA Part 107", "Transport Canada", "EASA"],
    isVerified: true,
    profileImage: "/placeholder.svg?height=100&width=100&text=Elite+Academy",
    description: "Premier drone training facility with over 10 years of experience in commercial aviation training."
  },
  {
    id: "2",
    companyName: "Skyward Training Institute",
    contactPerson: "Mike Chen",
    location: "Austin, TX",
    rating: 4.8,
    reviewCount: 189,
    specializations: ["Racing Drones", "FPV Flying", "Competition Training"],
    certifications: ["MultiGP", "DRL Academy", "Custom Racing"],
    isVerified: true,
    profileImage: "/placeholder.svg?height=100&width=100&text=Skyward+Institute",
    description: "Specialized training for racing and FPV drone enthusiasts with competition-level instruction."
  },
  {
    id: "3",
    companyName: "AgriDrone Pro Training",
    contactPerson: "Dr. Lisa Martinez",
    location: "Des Moines, IA",
    rating: 4.9,
    reviewCount: 156,
    specializations: ["Agricultural Applications", "Crop Spraying", "Field Analysis"],
    certifications: ["AUVSI", "Precision Agriculture", "Chemical Application"],
    isVerified: true,
    profileImage: "/placeholder.svg?height=100&width=100&text=AgriDrone+Pro",
    description: "Agricultural drone specialists providing comprehensive training for farming applications."
  }
]

const trainingCourses: TrainingCourse[] = [
  {
    id: "1",
    providerId: "1",
    title: "FAA Part 107 Remote Pilot Certification",
    description: "Complete preparation course for the FAA Part 107 exam including airspace, weather, regulations, and flight operations.",
    level: "Beginner",
    duration: 24,
    price: 49717,
    maxParticipants: 20,
    currentEnrollment: 18,
    startDate: "2024-01-15",
    endDate: "2024-01-19",
    format: "Hybrid",
    location: "Los Angeles, CA + Online",
    certificationProvided: true,
    prerequisites: [],
    courseOutline: [
      "Introduction to UAS Operations",
      "Airspace Classification & Requirements",
      "Weather Systems & Meteorology",
      "UAS Performance & Loading",
      "Emergency Procedures",
      "Flight Planning & Navigation",
      "Practice Exams & Review"
    ],
    nextAvailable: "2024-02-12"
  },
  {
    id: "2",
    providerId: "1",
    title: "Professional Aerial Photography & Videography",
    description: "Master the art of aerial cinematography with advanced camera techniques, composition, and post-processing.",
    level: "Intermediate",
    duration: 32,
    price: 74617,
    maxParticipants: 12,
    currentEnrollment: 9,
    startDate: "2024-01-22",
    endDate: "2024-01-26",
    format: "In-Person",
    location: "Los Angeles, CA",
    certificationProvided: true,
    prerequisites: ["Basic Drone Operation", "FAA Part 107 License"],
    courseOutline: [
      "Camera Systems & Settings",
      "Composition & Framing",
      "Lighting & Exposure",
      "Movement & Flight Techniques",
      "Post-Processing Workflows",
      "Client Relations & Pricing",
      "Portfolio Development"
    ],
    nextAvailable: "2024-03-05"
  },
  {
    id: "3",
    providerId: "2",
    title: "FPV Racing Fundamentals",
    description: "Learn high-speed FPV flying techniques, racing lines, and competition strategies from professional pilots.",
    level: "Intermediate",
    duration: 16,
    price: 37267,
    maxParticipants: 8,
    currentEnrollment: 6,
    startDate: "2024-01-18",
    endDate: "2024-01-20",
    format: "In-Person",
    location: "Austin, TX",
    certificationProvided: false,
    prerequisites: ["Basic FPV Experience"],
    courseOutline: [
      "FPV Equipment Setup",
      "Racing Lines & Techniques",
      "High-Speed Maneuvers",
      "Competition Strategies",
      "Safety Protocols",
      "Practice Sessions"
    ],
    nextAvailable: "2024-02-22"
  },
  {
    id: "4",
    providerId: "3",
    title: "Agricultural Drone Operations & Spraying",
    description: "Comprehensive training for agricultural drone applications including crop spraying, monitoring, and data analysis.",
    level: "Professional",
    duration: 40,
    price: 107817,
    maxParticipants: 15,
    currentEnrollment: 12,
    startDate: "2024-02-01",
    endDate: "2024-02-05",
    format: "Hybrid",
    location: "Des Moines, IA + Field Training",
    certificationProvided: true,
    prerequisites: ["FAA Part 107 License", "Agricultural Background Preferred"],
    courseOutline: [
      "Agricultural Drone Systems",
      "Crop Spraying Techniques",
      "Chemical Handling & Safety",
      "Field Mapping & Analysis",
      "Data Collection & Processing",
      "Regulatory Compliance",
      "Business Applications"
    ],
    nextAvailable: "2024-03-15"
  }
]

export default function TrainingPage() {
  const [activeTab, setActiveTab] = useState<"courses" | "providers">("courses")
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [formatFilter, setFormatFilter] = useState<string>("all")
  const [filteredCourses, setFilteredCourses] = useState(trainingCourses)
  const [filteredProviders, setFilteredProviders] = useState(trainingProviders)
  const { isAdmin, isLoading: authLoading } = useAuth()

  useEffect(() => {
    if (activeTab === "courses") {
      let filtered = trainingCourses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      )

      if (levelFilter !== "all") {
        filtered = filtered.filter(course => course.level === levelFilter)
      }

      if (formatFilter !== "all") {
        filtered = filtered.filter(course => course.format === formatFilter)
      }

      setFilteredCourses(filtered)
    } else {
      const filtered = trainingProviders.filter(provider =>
        provider.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.specializations.some(spec =>
          spec.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      setFilteredProviders(filtered)
    }
  }, [activeTab, searchTerm, levelFilter, formatFilter])

  const getProviderById = (id: string) => {
    return trainingProviders.find(provider => provider.id === id)
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <ModernHeader />

      {/* Hero Section */}
      <section className="relative pt-28 lg:pt-36 pb-20 overflow-hidden text-center bg-background border-b border-border">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.01] pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Custom Flight path & Graduation Propeller Logo */}
            <div className="flex justify-center mb-2 animate-pulse">
              <svg className="w-20 h-20 text-primary" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="50" cy="50" r="40" strokeDasharray="3 3" className="opacity-30" />
                <path d="M20 70c10-30 30-40 60-30" strokeDasharray="4 2" />
                <path d="M50 25L80 35L50 45L20 35Z" className="fill-background stroke-primary" />
                <path d="M35 40v12c0 8 10 10 15 10s15-2 15-10V40" />
                <path d="M80 35v15l-4 4" />
                <circle cx="50" cy="35" r="3" className="fill-primary animate-pulse" />
              </svg>
            </div>
            <div className="inline-flex items-center justify-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
              <span className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase font-mono">
                // CERTIFICATIONS & ACADEMY
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-light tracking-tight font-display text-foreground leading-tight">
              Drone Training & <span className="font-semibold text-primary block sm:inline">Certification</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-sans font-light">
              Master professional drone operations with certified training from leading aviation instructors. From beginner courses to advanced certifications.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Button size="lg" className="bg-primary hover:bg-primary/95 text-white rounded-full px-6 py-3.5 text-sm font-medium transition-all duration-300 border-0">
                <Award className="w-5 h-5 mr-2" />
                Browse Certifications
              </Button>
              <Button size="lg" variant="outline" className="border border-border text-foreground hover:bg-muted rounded-full px-6 py-3.5 text-sm font-medium transition-all duration-300 bg-card/50 backdrop-blur-sm">
                Find Instructors
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-8 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center bg-muted rounded-full p-1 border border-border">
              <Button
                variant={activeTab === "courses" ? "default" : "ghost"}
                onClick={() => setActiveTab("courses")}
                className="rounded-full px-6 py-2"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Training Courses
              </Button>
              <Button
                variant={activeTab === "providers" ? "default" : "ghost"}
                onClick={() => setActiveTab("providers")}
                className="rounded-full px-6 py-2"
              >
                <User className="w-4 h-4 mr-2" />
                Training Providers
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

              {activeTab === "courses" && (
                <div className="flex gap-2">
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="border border-border rounded-full px-4 py-2 text-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="all">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Professional">Professional</option>
                  </select>

                  <select
                    value={formatFilter}
                    onChange={(e) => setFormatFilter(e.target.value)}
                    className="border border-border rounded-full px-4 py-2 text-sm bg-background text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  >
                    <option value="all">All Formats</option>
                    <option value="Online">Online</option>
                    <option value="In-Person">In-Person</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 relative bg-background">
        <div className="container mx-auto px-4">
          {activeTab === "courses" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredCourses.map((course) => {
                const provider = getProviderById(course.providerId)
                const availableSpots = course.maxParticipants - course.currentEnrollment

                return (
                  <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-all duration-350 border border-border bg-card rounded-3xl">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={course.level === "Professional" ? "default" : "secondary"}>
                          {course.level}
                        </Badge>
                        <Badge variant="outline" className={`${course.format === "Online" ? "bg-green-500/10 text-green-500 border-0"
                            : course.format === "In-Person" ? "bg-primary/10 text-primary border-0"
                              : "bg-amber-500/10 text-amber-500 border-0"
                          }`}>
                          {course.format}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-2 font-display">{course.title}</CardTitle>
                      <p className="text-muted-foreground text-sm leading-relaxed">{course.description}</p>
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
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-muted-foreground">{provider.rating} ({provider.reviewCount})</span>
                            </div>
                          </div>
                          {provider.isVerified && (
                            <Badge variant="secondary" className="bg-green-150 text-green-800 border-0">
                              <Award className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Course Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{course.duration} hours</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{availableSpots} spots left</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{new Date(course.startDate).toLocaleDateString()}</span>
                        </div>
                        {course.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="truncate text-muted-foreground">{course.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Prerequisites */}
                      {course.prerequisites.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-foreground mb-2">Prerequisites:</p>
                          <div className="flex flex-wrap gap-1">
                            {course.prerequisites.map((prereq, index) => (
                              <Badge key={index} variant="outline" className="text-xs border-border">
                                {prereq}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Price and Action */}
                      <div className="pt-4 border-t border-border">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-2xl font-bold text-primary">₹{course.price.toLocaleString('en-IN')}</span>
                            {course.certificationProvided && (
                              <div className="text-xs text-green-600 font-medium">Certificate Included</div>
                            )}
                          </div>
                          <div className={`text-sm font-medium ${availableSpots > 5 ? "text-green-600"
                              : availableSpots > 0 ? "text-yellow-600"
                                : "text-red-600"
                            }`}>
                            {availableSpots > 0 ? `${availableSpots} spots available` : "Fully Booked"}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Button
                            className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-2.5 transition-all duration-300 border-0"
                            disabled={availableSpots === 0}
                          >
                            {availableSpots > 0 ? "Enroll Now" : "Join Waitlist"}
                          </Button>
                          <Button variant="outline" className="w-full rounded-full">
                            View Details
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
                    <div className="relative inline-block">
                      <img
                        src={provider.profileImage}
                        alt={provider.companyName}
                        className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                      />
                      {provider.isVerified && (
                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-xl mb-2 font-display">{provider.companyName}</CardTitle>
                    <p className="text-muted-foreground text-sm mb-3 leading-relaxed">{provider.description}</p>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium text-foreground">{provider.rating}</span>
                      <span className="text-sm text-muted-foreground">({provider.reviewCount} reviews)</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {provider.location}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Specializations:</p>
                      <div className="flex flex-wrap gap-1">
                        {provider.specializations.map((spec, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
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
                        View Courses
                      </Button>
                      <Button variant="outline" className="w-full rounded-full">
                        Contact Provider
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {((activeTab === "courses" && filteredCourses.length === 0) ||
            (activeTab === "providers" && filteredProviders.length === 0)) && (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No {activeTab} found matching your criteria.</p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-full"
                  onClick={() => {
                    setSearchTerm("")
                    setLevelFilter("all")
                    setFormatFilter("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}

          <ComingSoonOverlay
            show={false}
            description="Our drone training and certification programs are being developed. Expert training courses will be available soon."
          />
        </div>
      </section>

      <FAQSection pageName="Drone Training" customFAQs={trainingFAQs} />
      <ModernFooter />
    </div>
  )
}
