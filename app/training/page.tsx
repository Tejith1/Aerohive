"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Filter, MapPin, Clock, Users, Star, Award, Calendar, BookOpen, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
            Drone Training & Certification
          </h1>
          <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Master professional drone operations with certified training from leading aviation instructors. 
            From beginner courses to advanced certifications, launch your drone career today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
              <Award className="w-5 h-5 mr-2" />
              Browse Certifications
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900">
              Find Instructors
            </Button>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={activeTab === "courses" ? "default" : "ghost"}
                onClick={() => setActiveTab("courses")}
                className="rounded-md"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Training Courses
              </Button>
              <Button
                variant={activeTab === "providers" ? "default" : "ghost"}
                onClick={() => setActiveTab("providers")}
                className="rounded-md"
              >
                <User className="w-4 h-4 mr-2" />
                Training Providers
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

              {activeTab === "courses" && (
                <div className="flex gap-2">
                  <select
                    value={levelFilter}
                    onChange={(e) => setLevelFilter(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm"
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
                    className="border rounded-md px-3 py-2 text-sm"
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
      <section className="py-12">
        <div className="container mx-auto px-4">
          {activeTab === "courses" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredCourses.map((course) => {
                const provider = getProviderById(course.providerId)
                const availableSpots = course.maxParticipants - course.currentEnrollment

                return (
                  <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={course.level === "Professional" ? "default" : "secondary"}>
                          {course.level}
                        </Badge>
                        <Badge variant="outline" className={`${
                          course.format === "Online" ? "bg-green-50 text-green-700"
                          : course.format === "In-Person" ? "bg-blue-50 text-blue-700"
                          : "bg-purple-50 text-purple-700"
                        }`}>
                          {course.format}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-2">{course.title}</CardTitle>
                      <p className="text-gray-600 text-sm">{course.description}</p>
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
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-600">{provider.rating} ({provider.reviewCount})</span>
                            </div>
                          </div>
                          {provider.isVerified && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <Award className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Course Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{course.duration} hours</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{availableSpots} spots left</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(course.startDate).toLocaleDateString()}</span>
                        </div>
                        {course.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{course.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Prerequisites */}
                      {course.prerequisites.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-2">Prerequisites:</p>
                          <div className="flex flex-wrap gap-1">
                            {course.prerequisites.map((prereq, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {prereq}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Price and Action */}
                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-2xl font-bold text-blue-600">₹{course.price.toLocaleString('en-IN')}</span>
                            {course.certificationProvided && (
                              <div className="text-xs text-green-600 font-medium">Certificate Included</div>
                            )}
                          </div>
                          <div className={`text-sm font-medium ${
                            availableSpots > 5 ? "text-green-600"
                            : availableSpots > 0 ? "text-yellow-600"
                            : "text-red-600"
                          }`}>
                            {availableSpots > 0 ? `${availableSpots} spots available` : "Fully Booked"}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700" 
                            disabled={availableSpots === 0}
                          >
                            {availableSpots > 0 ? "Enroll Now" : "Join Waitlist"}
                          </Button>
                          <Button variant="outline" className="w-full">
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
                <Card key={provider.id} className="overflow-hidden hover:shadow-xl transition-all duration-300">
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
                    <CardTitle className="text-xl mb-2">{provider.companyName}</CardTitle>
                    <p className="text-gray-600 text-sm mb-3">{provider.description}</p>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{provider.rating}</span>
                      <span className="text-sm text-gray-500">({provider.reviewCount} reviews)</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {provider.location}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Specializations:</p>
                      <div className="flex flex-wrap gap-1">
                        {provider.specializations.map((spec, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
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
                        View Courses
                      </Button>
                      <Button variant="outline" className="w-full">
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
              <p className="text-gray-500 text-lg">No {activeTab} found matching your criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4"
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
        </div>
      </section>

      <Footer />
    </div>
  )
}
