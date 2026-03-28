"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
import { toast } from "@/hooks/use-toast"
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  Briefcase,
  Upload,
  CheckCircle2,
  Plane,
  FileText,
  IndianRupee,
  Loader2
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export default function DronePilotRegisterPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    area: "",
    experience: "",
    certifications: "",
    specializations: "",
    droneAcademy: "",
    hourlyRate: "",
    about: "",
    dgcaNumber: "",
    hasDrone: "",
    profileImage: null as File | null,
    certificateImage: null as File | null
  })

  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Pre-fill form from localStorage if it exists (handling case where user was redirected to login)
  React.useEffect(() => {
    const savedData = localStorage.getItem('pending_pilot_registration')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        // Only restore if user is now logged in or if it's just a refresh
        setFormData(prev => ({
          ...prev,
          ...parsedData,
          // Don't restore file objects as they can't be JSON serialized
          profileImage: null,
          certificateImage: null
        }))
        // Clear after restoring to prevent populating on every visit
        localStorage.removeItem('pending_pilot_registration')
        
        toast({
          title: "Form data restored",
          description: "We've restored the information you filled in before logging in."
        })
      } catch (err) {
        console.error('Failed to parse saved registration data:', err)
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'profileImage' | 'certificateImage') => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, [field]: e.target.files![0] }))
    }
  }

  const isFormValid = !!(
    formData.fullName && formData.email && formData.phone && 
    formData.location && formData.area && formData.experience && 
    formData.certifications && formData.specializations &&
    formData.hourlyRate && formData.about && formData.dgcaNumber && 
    formData.hasDrone && formData.profileImage && formData.certificateImage
  )

  const getMissingFields = () => {
    const missing = []
    if (!formData.fullName) missing.push("Full Name")
    if (!formData.email) missing.push("Email")
    if (!formData.phone) missing.push("Phone Number")
    if (!formData.location) missing.push("City/Location")
    if (!formData.area) missing.push("Area/Locality")
    if (!formData.experience) missing.push("Experience")
    if (!formData.certifications) missing.push("Certifications")
    if (!formData.specializations) missing.push("Specializations")
    if (!formData.hourlyRate) missing.push("Hourly Rate")
    if (!formData.about) missing.push("About You")
    if (!formData.dgcaNumber) missing.push("DGCA Number")
    if (!formData.hasDrone) missing.push("Do you have a drone?")
    if (!formData.profileImage) missing.push("Profile Photo")
    if (!formData.certificateImage) missing.push("DGCA Certificate")
    return missing
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔘 Register Now button clicked!')
    console.log('👥 Current User:', user ? user.id : 'Not Logged In')
    console.log('✅ Form is valid:', isFormValid)
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login or signup to register as a drone pilot. We'll save your progress!",
        variant: "default"
      })
      
      // Save form data to localStorage (excluding File objects as they can't be serialized)
      const { profileImage, certificateImage, ...serializableData } = formData
      localStorage.setItem('pending_pilot_registration', JSON.stringify(serializableData))
      
      // Redirect to login with a fallback to this page
      router.push('/login?redirect=/drone-pilots/register')
      return
    }
    
    // Additional strict validation check just in case
    // Additional strict validation check
    if (!isFormValid) {
      const missing = getMissingFields()
      console.log('⚠️ Validation failed. Missing fields:', missing)
      toast({
        title: "Missing Required Fields",
        description: `Please fill in the following: ${missing.join(", ")}`,
        variant: "destructive"
      })
      
      // Scroll to the first missing field if possible (optional enhancement)
      return
    }
    
    setSubmitting(true)
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setSubmitting(false)
      toast({
        title: "Request Timeout",
        description: "The registration is taking too long. Please check your internet connection and try again.",
        variant: "destructive"
      })
    }, 30000) // 30 second timeout
    
    try {
      console.log('🚀 Starting registration process via server-side API...')
      console.log('📝 Form data:', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        area: formData.area,
        experience: formData.experience,
        hourlyRate: formData.hourlyRate,
        dgcaNumber: formData.dgcaNumber,
        hasDrone: formData.hasDrone
      })
      
      // Build FormData to send everything (including files) to the server-side API
      const apiFormData = new FormData()
      apiFormData.append('full_name', formData.fullName)
      apiFormData.append('email', formData.email)
      apiFormData.append('phone', formData.phone)
      apiFormData.append('location', formData.location)
      apiFormData.append('area', formData.area)
      apiFormData.append('experience', formData.experience)
      apiFormData.append('certifications', formData.certifications)
      apiFormData.append('specializations', formData.specializations)
      apiFormData.append('hourly_rate', formData.hourlyRate)
      apiFormData.append('about', formData.hasDrone ? `[Owns a Drone: ${formData.hasDrone}]\n${formData.about}`.trim() : formData.about)
      apiFormData.append('drone_academy', formData.droneAcademy || '')
      apiFormData.append('dgca_number', formData.dgcaNumber)
      apiFormData.append('is_phone_verified', 'false')
      apiFormData.append('user_id', user.id)

      if (formData.profileImage) {
        apiFormData.append('profile_image', formData.profileImage)
      }
      if (formData.certificateImage) {
        apiFormData.append('certificate_image', formData.certificateImage)
      }

      console.log('📤 Submitting to server-side API (bypasses RLS)...')
      
      const response = await fetch('/api/drone-pilots/register', {
        method: 'POST',
        body: apiFormData,
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      console.log('✅ Success! Server response:', result)

      // Sync with Google Sheets via backend API
      try {
        const { profileImage, certificateImage, ...cleanFormData } = formData;
        
        await fetch('/api/drone-pilot-registration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...cleanFormData,
            registrationDate: new Date().toLocaleString(),
            status: 'Pending Review'
          })
        })
        console.log('✅ Google Sheets sync complete')
      } catch (gsError) {
        console.error('⚠️ Google Sheets sync failed but database is OK:', gsError)
      }
      
      clearTimeout(timeoutId)
      
      setSubmitted(true)
      setSubmitting(false)
      
      toast({
        title: "✅ Registration Successful!",
        description: "Your application has been submitted. We'll review it within 24-48 hours.",
      })
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false)
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          location: "",
          area: "",
          experience: "",
          certifications: "",
          specializations: "",
          droneAcademy: "",
          hourlyRate: "",
          about: "",
          dgcaNumber: "",
          hasDrone: "",
          profileImage: null,
          certificateImage: null
        })
      }, 3000)
    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error('❌ Registration error:', error)
      
      setSubmitting(false)
      
      let errorMessage = "Failed to register. Please try again."
      let errorTitle = "Registration Failed"
      
      if (error.message) {
        if (error.message.includes('duplicate key') || error.message.includes('unique constraint')) {
          errorTitle = "Duplicate Entry"
          if (error.message.includes('email')) {
            errorMessage = "This email address is already registered."
          } else if (error.message.includes('dgca_number')) {
            errorMessage = "This DGCA certificate number is already registered."
          } else {
            errorMessage = "This information is already registered. Please use different email or DGCA number."
          }
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      })
    }
  }

  if (submitted) {
    return (
      <>
        <ModernHeader />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center border-0 shadow-2xl">
          <CardContent className="pt-12 pb-12">
            <div className="h-20 w-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
            <p className="text-gray-600 mb-8">
              Thank you for registering! We'll review your application and get back to you within 24-48 hours.
            </p>
            <Button 
              asChild
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl"
            >
              <Link href="/drone-pilots">
                Back to Drone Pilots
              </Link>
            </Button>
          </CardContent>
        </Card>
        </div>
        <ModernFooter />
      </>
    )
  }

  return (
    <>
      <ModernHeader />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <section className="pt-32 pb-12">
        <div className="container mx-auto px-4">
          <Button 
            asChild
            variant="ghost" 
            className="mb-6 hover:bg-white"
          >
            <Link href="/drone-pilots">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Drone Pilots
            </Link>
          </Button>
          
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-6 py-2">
              <Plane className="h-4 w-4 mr-2 inline" />
              Pilot Registration
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Register as a Drone Pilot
            </h1>
            <p className="text-lg text-gray-600">
              Join our network of certified professionals and start connecting with clients
            </p>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="container mx-auto px-4 pb-20">
        <Card className="max-w-4xl mx-auto border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Pilot Information</CardTitle>
            <CardDescription>
              Please fill in all the details accurately. Fields marked with * are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name * <span className="text-sm font-normal text-gray-500">(As per DGCA certificate)</span></Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">City/Location *</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="e.g., Bangalore"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Area/Locality *</Label>
                    <Input
                      id="area"
                      name="area"
                      placeholder="e.g., Koramangala"
                      value={formData.area}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience *</Label>
                    <select
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      required
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select experience</option>
                      <option value="0-1">0-1 years</option>
                      <option value="1-2">1-2 years</option>
                      <option value="2-3">2-3 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5+">5+ years</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  Professional Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dgcaNumber">DGCA Certificate Number *</Label>
                    <Input
                      id="dgcaNumber"
                      name="dgcaNumber"
                      placeholder="Enter DGCA certificate number"
                      value={formData.dgcaNumber}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate (₹) * <span className="text-sm font-normal text-gray-500">(rate excluding transport charges)</span></Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="hourlyRate"
                        name="hourlyRate"
                        type="number"
                        placeholder="2000"
                        value={formData.hourlyRate}
                        onChange={handleInputChange}
                        required
                        className="rounded-xl pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="certifications">Certifications (comma-separated) *</Label>
                    <Input
                      id="certifications"
                      name="certifications"
                      placeholder="e.g., DGCA Certified, Aerial Photography, 3D Mapping"
                      value={formData.certifications}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="specializations">Specializations (comma-separated) *</Label>
                    <Input
                      id="specializations"
                      name="specializations"
                      placeholder="e.g., Real Estate, Wedding Photography, Survey Mapping"
                      value={formData.specializations}
                      onChange={handleInputChange}
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="hasDrone">Do you have a drone? *</Label>
                    <select
                      id="hasDrone"
                      name="hasDrone"
                      value={formData.hasDrone}
                      onChange={handleInputChange}
                      required
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select option</option>
                      <option value="YES">YES</option>
                      <option value="NO">NO</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="droneAcademy">Drone Academy <span className="text-sm font-normal text-gray-500">(Optional)</span></Label>
                    <Input
                      id="droneAcademy"
                      name="droneAcademy"
                      placeholder="e.g., Indian Institute of Drones, RPTO Academy"
                      value={formData.droneAcademy}
                      onChange={handleInputChange}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="about">About You *</Label>
                    <Textarea
                      id="about"
                      name="about"
                      placeholder="Tell us about your experience, equipment, and services you offer..."
                      value={formData.about}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Document Uploads */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Documents & Photos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profileImage">Profile Photo *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                      <input
                        id="profileImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'profileImage')}
                        className="hidden"
                      />
                      <label htmlFor="profileImage" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 truncate">
                          {formData.profileImage ? formData.profileImage.name : "Click to upload profile photo"}
                        </p>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="certificateImage">DGCA Certificate *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                      <input
                        id="certificateImage"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleFileChange(e, 'certificateImage')}
                        className="hidden"
                      />
                      <label htmlFor="certificateImage" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 truncate">
                          {formData.certificateImage ? formData.certificateImage.name : "Click to upload certificate"}
                        </p>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  By registering, you agree to our terms and conditions
                </p>
                 <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className={`bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-8 shadow-lg hover:shadow-xl transition-all duration-300 ${!isFormValid ? 'opacity-80' : ''}`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Register Now'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
      </div>
      <ModernFooter />
    </>
  )
}
