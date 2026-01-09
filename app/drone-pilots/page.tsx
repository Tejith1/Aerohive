"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
import { getDronePilots, DronePilot, supabase } from "@/lib/supabase"
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
  Loader2
} from "lucide-react"

export default function DronePilotsPage() {
  const [selectedLocation, setSelectedLocation] = useState("All Locations")
  const [selectedArea, setSelectedArea] = useState("All Areas")
  const [searchQuery, setSearchQuery] = useState("")
  const [pilots, setPilots] = useState<DronePilot[]>([])
  const [locations, setLocations] = useState<string[]>(["All Locations"])
  const [areas, setAreas] = useState<string[]>(["All Areas"])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all pilots and extract unique locations/areas
  useEffect(() => {
    fetchAllPilotsForFilters()
  }, [])

  useEffect(() => {
    fetchPilots()

    // Set up real-time subscription for drone pilots
    const channel = supabase
      .channel('drone_pilots_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'drone_pilots'
        },
        (payload) => {
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

  // Helper function to parse comma-separated strings to arrays
  const parseArray = (str: string): string[] => {
    return str.split(',').map(item => item.trim()).filter(item => item.length > 0)
  }

  return (
    <>
      <ModernHeader />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-6 py-2 text-sm">
                <Plane className="h-4 w-4 mr-2 inline" />
                Find Certified Drone Pilots
              </Badge>
              <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Connect With Professional Drone Operators
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Find certified and experienced drone pilots in your area for aerial photography, surveying, inspections, and more
              </p>

              {/* Pilot Registration Button */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl rounded-xl px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105"
                >
                  <Link href="/drone-pilots/register">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Register as a Drone Pilot
                  </Link>
                </Button>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium">{pilots.length}+ Certified Pilots Available</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="container mx-auto px-4 -mt-8 mb-12 relative z-20">
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-lg">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search Input */}
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name or specialization..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Location Filter */}
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer"
                  >
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Area Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none z-10" />
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer"
                  >
                    {areas.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filters Display */}
              {(selectedLocation !== "All Locations" || selectedArea !== "All Areas" || searchQuery) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {selectedLocation !== "All Locations" && (
                    <Badge variant="secondary" className="rounded-full">
                      {selectedLocation}
                      <button onClick={() => setSelectedLocation("All Locations")} className="ml-2 hover:text-red-600">×</button>
                    </Badge>
                  )}
                  {selectedArea !== "All Areas" && (
                    <Badge variant="secondary" className="rounded-full">
                      {selectedArea}
                      <button onClick={() => setSelectedArea("All Areas")} className="ml-2 hover:text-red-600">×</button>
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="secondary" className="rounded-full">
                      Search: {searchQuery}
                      <button onClick={() => setSearchQuery("")} className="ml-2 hover:text-red-600">×</button>
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Results Section */}
        <section className="container mx-auto px-4 pb-20">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {loading ? 'Loading...' : `${filteredPilots.length} Pilot${filteredPilots.length !== 1 ? 's' : ''} Found`}
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-lg text-gray-600">Loading pilots...</span>
            </div>
          ) : error ? (
            <Card className="text-center py-16 border-red-200 bg-red-50">
              <CardContent>
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchPilots} variant="outline">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : filteredPilots.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Plane className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pilots Found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
                <Button
                  onClick={() => {
                    setSelectedLocation("All Locations")
                    setSelectedArea("All Areas")
                    setSearchQuery("")
                  }}
                  variant="outline"
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPilots.map((pilot) => (
                <Card key={pilot.id} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={pilot.profile_image_url || "/placeholder-user.jpg"}
                            alt={pilot.full_name}
                            className="h-16 w-16 rounded-xl object-cover"
                          />
                          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div>
                          <CardTitle className="text-xl mb-1">{pilot.full_name}</CardTitle>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{pilot.area}, {pilot.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Award className="h-4 w-4" />
                        <span>{pilot.experience}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{pilot.completed_jobs} jobs</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Certifications */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Certifications</h4>
                        <div className="flex flex-wrap gap-2">
                          {parseArray(pilot.certifications).map((cert, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs rounded-full">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Specializations */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Specializations</h4>
                        <div className="flex flex-wrap gap-2">
                          {parseArray(pilot.specializations).map((spec, idx) => (
                            <Badge key={idx} className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 rounded-full">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Hourly Rate */}
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Starting from</p>
                            <p className="text-2xl font-bold text-gray-900">₹{pilot.hourly_rate}<span className="text-sm text-gray-600">/hour</span></p>
                          </div>
                          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl">
                            Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 pb-20">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-grid-white/10"></div>
            <CardContent className="relative z-10 py-16 text-center">
              <Plane className="h-16 w-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-4xl font-black mb-4">Are You a Certified Drone Pilot?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join our network of professional drone operators and connect with clients looking for your expertise
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl rounded-xl px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                <Link href="/drone-pilots/register">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Register Now - It's Free
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
      <ModernFooter />
    </>
  )
}
