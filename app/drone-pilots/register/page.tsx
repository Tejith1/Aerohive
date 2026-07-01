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
  Upload,
  CheckCircle2,
  Plane,
  FileText,
  IndianRupee,
  Loader2,
  Calendar,
  Home,
  UserCheck,
  Activity,
  ShieldAlert
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
    certificateImage: null as File | null,
    aadharNumber: "",
    dob: "",
    homeAddress: "",
    gender: "",
    bloodGroup: "",
    emergencyContact: "",
    panNumber: ""
  })

  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Pre-fill form from localStorage if it exists
  React.useEffect(() => {
    const savedData = localStorage.getItem('pending_pilot_registration')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setFormData(prev => ({
          ...prev,
          ...parsedData,
          profileImage: null,
          certificateImage: null
        }))
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
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login or signup to register as a drone pilot. We'll save your progress!",
        variant: "default"
      })
      
      const { profileImage, certificateImage, ...serializableData } = formData
      localStorage.setItem('pending_pilot_registration', JSON.stringify(serializableData))
      router.push('/login?redirect=/drone-pilots/register')
      return
    }
    
    if (!isFormValid) {
      const missing = getMissingFields()
      toast({
        title: "Missing Required Fields",
        description: `Please fill in the following: ${missing.join(", ")}`,
        variant: "destructive"
      })
      return
    }
    
    setSubmitting(true)
    
    const timeoutId = setTimeout(() => {
      setSubmitting(false)
      toast({
        title: "Request Timeout",
        description: "The registration is taking too long. Please check your internet connection and try again.",
        variant: "destructive"
      })
    }, 30000)
    
    try {
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
      
      const formattedAcademy = `AADHAR: ${formData.aadharNumber.trim() || 'N/A'} | DOB: ${formData.dob || 'N/A'} | HOME: ${formData.homeAddress.trim() || 'N/A'} | GENDER: ${formData.gender || 'N/A'} | BLOOD: ${formData.bloodGroup || 'N/A'} | EMERGENCY: ${formData.emergencyContact.trim() || 'N/A'} | PAN: ${formData.panNumber.trim() || 'N/A'} | ACADEMY: ${formData.droneAcademy.trim() || 'None'}`
      apiFormData.append('drone_academy', formattedAcademy)
      apiFormData.append('dgca_number', formData.dgcaNumber)
      apiFormData.append('is_phone_verified', 'false')
      apiFormData.append('user_id', user.id)

      if (formData.profileImage) {
        apiFormData.append('profile_image', formData.profileImage)
      }
      if (formData.certificateImage) {
        apiFormData.append('certificate_image', formData.certificateImage)
      }
      
      const response = await fetch('/api/drone-pilots/register', {
        method: 'POST',
        body: apiFormData,
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

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
      } catch (gsError) {
        console.error('⚠️ Google Sheets sync failed but database is OK:', gsError)
      }
      
      clearTimeout(timeoutId)
      setSubmitted(true)
      setSubmitting(false)
      
      toast({
        title: "Registration Successful!",
        description: "Your application has been submitted. We'll review it within 24-48 hours.",
      })
      
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
          certificateImage: null,
          aadharNumber: "",
          dob: "",
          homeAddress: "",
          gender: "",
          bloodGroup: "",
          emergencyContact: "",
          panNumber: ""
        })
      }, 3000)
    } catch (error: any) {
      clearTimeout(timeoutId)
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
      <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0b0f19] flex flex-col justify-between transition-colors duration-300">
        <ModernHeader />
        <div className="flex-1 flex items-center justify-center p-6 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>
          <Card className="max-w-md w-full text-center border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/80 backdrop-blur-md shadow-xl rounded-3xl p-8 relative z-10">
            <CardContent className="pt-8 pb-8">
              <div className="h-16 w-16 rounded-2xl bg-green-500/10 border border-green-500/20 mx-auto mb-6 flex items-center justify-center text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight font-display text-slate-900 dark:text-white mb-3">Registration Successful!</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                Thank you for applying. Our flight operations board will review your credentials and get back to you within 24-48 hours.
              </p>
              <Button 
                asChild
                className="w-full bg-[#e65737] hover:bg-[#e65737]/90 text-white font-bold rounded-xl shadow-md h-11"
              >
                <Link href="/drone-pilots">
                  Return to Pilots Roster
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <ModernFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0b0f19] text-slate-800 dark:text-slate-200 transition-colors duration-300 relative flex flex-col justify-between">
      {/* Ambient background grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>
      
      <ModernHeader />
      
      {/* Main Content Area */}
      <main className="flex-1 pt-32 pb-20 relative z-10">
        <div className="container mx-auto px-6">
          
          {/* Navigation link */}
          <div className="max-w-4xl mx-auto mb-8">
            <Button 
              asChild
              variant="ghost" 
              className="hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <Link href="/drone-pilots" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Roster</span>
              </Link>
            </Button>
          </div>
          
          {/* Form Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge className="mb-4 bg-[#e65737]/8 dark:bg-[#e65737]/12 text-[#e65737] border border-[#e65737]/15 px-4 py-1.5 rounded-full font-mono uppercase tracking-wider text-xs">
              <Plane className="h-3.5 w-3.5 mr-2 inline animate-pulse" />
              Pilot Verification Panel
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-display text-slate-900 dark:text-white mb-3">
              Apply as a Professional Operator
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Register your DGCA credentials to receive commercial mission dispatches and list on our verified operator roster.
            </p>
          </div>

          {/* Form Container */}
          <Card className="max-w-4xl mx-auto border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/60 backdrop-blur-md shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/80 p-6 md:p-8 bg-slate-50/50 dark:bg-slate-950/20">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">Operator Profile Credentials</CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Please complete all fields accurately. Mandatory fields are highlighted with an asterisk (*).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Section: Personal Information */}
                <div className="space-y-5">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#e65737] flex items-center gap-2">
                    <User className="h-4.5 w-4.5" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Full Name * <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">(matches DGCA certificate)</span>
                      </Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="rounded-xl border-slate-200 dark:border-slate-800 focus:border-[#e65737] focus:ring-[#e65737]/20 bg-white dark:bg-slate-950 h-10 text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="rounded-xl border-slate-200 dark:border-slate-800 focus:border-[#e65737] focus:ring-[#e65737]/20 bg-white dark:bg-slate-950 h-10 text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="rounded-xl border-slate-200 dark:border-slate-800 focus:border-[#e65737] focus:ring-[#e65737]/20 bg-white dark:bg-slate-950 h-10 text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-xs font-semibold text-slate-700 dark:text-slate-300">City/Location *</Label>
                      <Input
                        id="location"
                        name="location"
                        placeholder="e.g., Bangalore"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        className="rounded-xl border-slate-200 dark:border-slate-800 focus:border-[#e65737] focus:ring-[#e65737]/20 bg-white dark:bg-slate-950 h-10 text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="area" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Area/Locality *</Label>
                      <Input
                        id="area"
                        name="area"
                        placeholder="e.g., Indiranagar"
                        value={formData.area}
                        onChange={handleInputChange}
                        required
                        className="rounded-xl border-slate-200 dark:border-slate-800 focus:border-[#e65737] focus:ring-[#e65737]/20 bg-white dark:bg-slate-950 h-10 text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Years of Experience *</Label>
                      <select
                        id="experience"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        required
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-[#e65737] focus:ring-2 focus:ring-[#e65737]/20 bg-white dark:bg-slate-950 text-xs transition-colors"
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

                  {/* Subsection: Extended Verification Details (Optional) */}
                  <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/85 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">Extended Verification Details</h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">These optional fields assist the ops board in prioritizing clearance approvals.</p>
                      </div>
                      <span className="inline-flex items-center text-[10px] font-bold text-[#e65737] bg-[#e65737]/8 border border-[#e65737]/15 rounded-full px-2.5 py-0.5 font-mono">
                        OPTIONAL FIELDS
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="aadharNumber" className="text-[11px] font-semibold text-slate-600 dark:text-slate-450 flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5 text-slate-400" /> Aadhar Card No</Label>
                        <Input
                          id="aadharNumber"
                          name="aadharNumber"
                          placeholder="12-digit number"
                          value={formData.aadharNumber}
                          onChange={handleInputChange}
                          className="rounded-xl border-slate-200 dark:border-slate-800 focus:border-[#e65737] focus:ring-[#e65737]/20 bg-white dark:bg-slate-950 h-10 text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dob" className="text-[11px] font-semibold text-slate-600 dark:text-slate-455 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Date of Birth</Label>
                        <Input
                          id="dob"
                          name="dob"
                          type="date"
                          value={formData.dob}
                          onChange={handleInputChange}
                          className="rounded-xl border-slate-200 dark:border-slate-800 focus:border-[#e65737] focus:ring-[#e65737]/20 bg-white dark:bg-slate-950 h-10 text-xs text-slate-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="homeAddress" className="text-[11px] font-semibold text-slate-600 dark:text-slate-455 flex items-center gap-1.5"><Home className="w-3.5 h-3.5 text-slate-400" /> Home Address</Label>
                        <Input
                          id="homeAddress"
                          name="homeAddress"
                          placeholder="Full residential address"
                          value={formData.homeAddress}
                          onChange={handleInputChange}
                          className="rounded-xl border-slate-200 dark:border-slate-800 focus:border-[#e65737] focus:ring-[#e65737]/20 bg-white dark:bg-slate-950 h-10 text-xs"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender" className="text-[11px] font-semibold text-slate-600 dark:text-slate-455 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" /> Gender</Label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-[#e65737] focus:ring-2 focus:ring-[#e65737]/20 bg-white dark:bg-slate-950 text-xs transition-colors"
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Skip">Prefer not to say</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bloodGroup" className="text-[11px] font-semibold text-slate-600 dark:text-slate-455 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-slate-400" /> Blood Group</Label>
                        <select
                          id="bloodGroup"
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleInputChange}
                          className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-[#e65737] focus:ring-2 focus:ring-[#e65737]/20 bg-white dark:bg-slate-950 text-xs transition-colors"
                        >
                          <option value="">Select blood group</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="Skip">Don't know</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContact" className="text-[11px] font-semibold text-slate-600 dark:text-slate-455 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> Emergency Mobile</Label>
                        <Input
                          id="emergencyContact"
                          name="emergencyContact"
                          placeholder="Emergency contact"
                          value={formData.emergencyContact}
                          onChange={handleInputChange}
                          className="rounded-xl border-slate-200 dark:border-slate-800 focus:border-[#e65737] focus:ring-[#e65737]/20 bg-white dark:bg-slate-950 h-10 text-xs"
                        />
                      </div>
                      <div className="space-y-2 lg:col-span-3">
                        <Label htmlFor="panNumber" className="text-[11px] font-semibold text-slate-600 dark:text-slate-455 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-slate-400" /> PAN Card Number</Label>
                        <Input
                          id="panNumber"
                          name="panNumber"
                          placeholder="10-digit alphanumeric PAN card number"
                          value={formData.panNumber}
                          onChange={handleInputChange}
                          className="rounded-xl border-slate-200 dark:border-slate-800 focus:border-[#e65737] focus:ring-[#e65737]/20 bg-white dark:bg-slate-950 h-10 text-xs uppercase"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-amber-700 dark:text-amber-500 bg-amber-500/5 p-3 border border-amber-500/10 rounded-xl">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>Note: If skipped, your application will be verified but flagged as <strong>Incomplete Profile</strong> in the operational database.</span>
                    </div>
                  </div>
                </div>

                {/* Section: Professional Credentials */}
                <div className="space-y-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#e65737] flex items-center gap-2">
                    <Award className="h-4.5 w-4.5" />
                    Professional Credentials
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="dgcaNumber" className="text-xs font-semibold text-slate-700 dark:text-slate-300">DGCA Certificate Number *</Label>
                      <Input
                        id="dgcaNumber"
                        name="dgcaNumber"
                        placeholder="e.g., UAOP/NPNT/..."
                        value={formData.dgcaNumber}
                        onChange={handleInputChange}
                        required
                        className="rounded-xl border-slate-200 dark:border-slate-800 focus:border-[#e65737] focus:ring-[#e65737]/20 bg-white dark:bg-slate-950 h-10 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Hourly Rate (₹) * <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">(excluding travel charges)</span>
                      </Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <Input
                          id="hourlyRate"
                          name="hourlyRate"
                          type="number"
                          placeholder="2500"
                          value={formData.hourlyRate}
                          onChange={handleInputChange}
                          required
                          className="rounded-xl border-slate-200 dark:border-slate-800 focus:border-[#e65737] focus:ring-[#e65737]/20 bg-white dark:bg-slate-950 h-10 pl-9 text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="certifications" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Certifications * <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">(comma-separated)</span></Label>
                      <Input
                        id="certifications"
                        name="certifications"
                        placeholder="FAA Part 107, DGCA Certified RPAS Operator, thermal mapping, cinematography"
                        value={formData.certifications}
                        onChange={handleInputChange}
                        required
                        className="rounded-xl border-slate-200 dark:border-slate-800 focus:border-[#e65737] focus:ring-[#e65737]/20 bg-white dark:bg-slate-950 h-10 text-xs"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="specializations" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Specializations * <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">(comma-separated)</span></Label>
                      <Input
                        id="specializations"
                        name="specializations"
                        placeholder="FPV Cinematic, Real Estate, Surveying, Precision Agriculture, Inspection"
                        value={formData.specializations}
                        onChange={handleInputChange}
                        required
                        className="rounded-xl border-slate-200 dark:border-slate-800 focus:border-[#e65737] focus:ring-[#e65737]/20 bg-white dark:bg-slate-950 h-10 text-xs"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hasDrone" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Do you own flight equipment? *</Label>
                      <select
                        id="hasDrone"
                        name="hasDrone"
                        value={formData.hasDrone}
                        onChange={handleInputChange}
                        required
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-[#e65737] focus:ring-2 focus:ring-[#e65737]/20 bg-white dark:bg-slate-950 text-xs transition-colors"
                      >
                        <option value="">Select option</option>
                        <option value="YES">Yes, I own commercial flight rigs</option>
                        <option value="NO">No, I require equipment dispatch</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="droneAcademy" className="text-xs font-semibold text-slate-700 dark:text-slate-300">RPTO / Drone Academy <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">(Optional)</span></Label>
                      <Input
                        id="droneAcademy"
                        name="droneAcademy"
                        placeholder="Academy where you completed remote pilot training"
                        value={formData.droneAcademy}
                        onChange={handleInputChange}
                        className="rounded-xl border-slate-200 dark:border-slate-800 focus:border-[#e65737] focus:ring-[#e65737]/20 bg-white dark:bg-slate-950 h-10 text-xs"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="about" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Operator Statement & Equipment Details *</Label>
                      <Textarea
                        id="about"
                        name="about"
                        placeholder="Detail your professional experience, safety records, and specific drone specs (sensors, camera, range)..."
                        value={formData.about}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="rounded-xl border-slate-200 dark:border-slate-800 focus:border-[#e65737] focus:ring-[#e65737]/20 bg-white dark:bg-slate-950 text-xs resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Document Uploads */}
                <div className="space-y-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[#e65737] flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5" />
                    Mandatory Documentation
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Profile Photo *</Label>
                      <div className="border border-dashed border-slate-300 dark:border-slate-800 hover:border-[#e65737]/60 dark:hover:border-[#e65737]/50 rounded-xl p-6 text-center transition-all bg-slate-50/50 dark:bg-slate-950/20 relative group">
                        <input
                          id="profileImage"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'profileImage')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="h-6 w-6 mx-auto text-slate-400 group-hover:text-[#e65737] mb-2 transition-colors" />
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                          {formData.profileImage ? formData.profileImage.name : "Choose profile image"}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">JPEG, PNG up to 5MB</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">DGCA Certificate (Scan/Photo) *</Label>
                      <div className="border border-dashed border-slate-300 dark:border-slate-800 hover:border-[#e65737]/60 dark:hover:border-[#e65737]/50 rounded-xl p-6 text-center transition-all bg-slate-50/50 dark:bg-slate-950/20 relative group">
                        <input
                          id="certificateImage"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'certificateImage')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="h-6 w-6 mx-auto text-slate-400 group-hover:text-[#e65737] mb-2 transition-colors" />
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                          {formData.certificateImage ? formData.certificateImage.name : "Choose certificate scan"}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">JPEG, PNG up to 5MB</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Row */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800/80">
                  <p className="text-[11px] text-slate-450 dark:text-slate-500 leading-relaxed text-center sm:text-left">
                    By submitting this application, you authorize AeroHive to audit and verify your DGCA credentials.
                  </p>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto bg-[#e65737] hover:bg-[#e65737]/90 text-white font-bold rounded-xl px-8 shadow-md h-11 text-xs shrink-0 flex items-center justify-center gap-2 border-0"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <span>Submit Verification Application</span>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <ModernFooter />
    </div>
  )
}
