"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
import { toast } from "@/hooks/use-toast"
import { 
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Plane,
  FileText,
  Clock,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Globe,
  Sparkles,
  DollarSign,
  Plus
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

const PRESET_TIME_SLOTS = [
  "06:00 AM - 08:00 AM",
  "08:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 02:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
  "06:00 PM - 08:00 PM",
  "08:00 PM - 10:00 PM"
]

const SERVICE_CATEGORIES = [
  { value: "mapping", label: "Mapping & Surveying" },
  { value: "photography", label: "Photography & Video" },
  { value: "spraying", label: "Agricultural Spraying" },
  { value: "surveillance", label: "Security & Surveillance" },
  { value: "inspection", label: "Structural Inspection" },
  { value: "delivery", label: "Drone Delivery" }
]

export default function DroneServiceProviderRegisterPage() {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    address: "",
    pincode: "",
    droneType: "Quadcopter",
    customDroneType: "",
    selectedSlots: [] as string[],
    selectedCategories: [] as string[],
    providerType: "personal", // 'personal' or 'public' (admin only)
    targetEmail: ""
  })

  const [customSlotInput, setCustomSlotInput] = useState("")
  const [customSlotPriceInput, setCustomSlotPriceInput] = useState("")
  const [isDetecting, setIsDetecting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Autocomplete states
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Restore state from localStorage if user logged in
  useEffect(() => {
    const savedData = localStorage.getItem('pending_provider_registration')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setFormData(prev => ({
          ...prev,
          ...parsedData
        }))
        localStorage.removeItem('pending_provider_registration')
        toast({
          title: "Form data restored",
          description: "We've restored your service provider registration info."
        })
      } catch (err) {
        console.error('Failed to parse saved provider data:', err)
      }
    }
  }, [])

  // Autocomplete fetch for registration page location input
  useEffect(() => {
    if (!formData.location || formData.location.trim().length < 3) {
      setLocationSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formData.location)}&format=json&addressdetails=1&limit=5&accept-language=en`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setLocationSuggestions(data);
        }
      } catch (err) {
        console.error("Registration autocomplete fetch failed", err);
      }
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [formData.location]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (value: string, field: 'selectedSlots' | 'selectedCategories') => {
    setFormData(prev => {
      const current = [...prev[field]]
      const index = current.indexOf(value)
      if (index > -1) {
        current.splice(index, 1)
      } else {
        current.push(value)
      }
      return { ...prev, [field]: current }
    })
  }

  const handleAddTimeSlot = () => {
    const slotName = customSlotInput.trim()
    const slotPrice = customSlotPriceInput.trim()
    if (!slotName) {
      toast({
        title: "Missing Name",
        description: "Please specify a name or time range for the slot.",
        variant: "destructive"
      })
      return
    }
    if (!slotPrice) {
      toast({
        title: "Missing Cost",
        description: "Please specify a slot cost.",
        variant: "destructive"
      })
      return
    }

    const formattedSlot = `${slotName} - ₹${slotPrice}`

    const isDuplicate = formData.selectedSlots.some(s => s.toLowerCase().startsWith(slotName.toLowerCase() + " -"))
    if (isDuplicate) {
      toast({
        title: "Duplicate slot",
        description: "A time slot with this name or time range already exists.",
        variant: "destructive"
      })
      return
    }

    setFormData(prev => ({
      ...prev,
      selectedSlots: [...prev.selectedSlots, formattedSlot]
    }))
    setCustomSlotInput("")
    setCustomSlotPriceInput("")
  }

  const handleRemoveTimeSlot = (slotToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSlots: prev.selectedSlots.filter(s => s !== slotToRemove)
    }))
  }

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive"
      })
      return
    }

    setIsDetecting(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`)
          const data = await response.json()
          if (data.address) {
            const addr = data.address
            const area = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || addr.town || addr.village || addr.city || ""
            const postcode = addr.postcode || ""

            setFormData(prev => ({
              ...prev,
              location: area,
              pincode: postcode
            }))
            
            toast({
              title: "Location detected",
              description: `Detected area: ${area}, Pincode: ${postcode}`
            })
          } else {
            throw new Error("Could not parse address details.")
          }
        } catch (e) {
          console.error("Reverse geocoding failed", e)
          toast({
            title: "Detection Failed",
            description: "Could not auto-detect location details. Please try again.",
            variant: "destructive"
          })
        } finally {
          setIsDetecting(false)
        }
      },
      (error) => {
        console.error(error)
        setIsDetecting(false)
        toast({
          title: "Permission Denied",
          description: "Please allow location access to auto-detect your location.",
          variant: "destructive"
        })
      }
    )
  }

  const isFormValid = !!(
    formData.name &&
    formData.phone &&
    formData.location &&
    formData.address &&
    formData.pincode &&
    (formData.droneType !== 'Other' || formData.customDroneType) &&
    formData.selectedSlots.length > 0 &&
    formData.selectedCategories.length > 0
  )

  const getMissingFields = () => {
    const missing = []
    if (!formData.name) missing.push("Business/Provider Name")
    if (!formData.phone) missing.push("Phone Number")
    if (!formData.location) missing.push("City/Location")
    if (!formData.address) missing.push("Address")
    if (!formData.pincode) missing.push("Pincode")
    if (formData.droneType === 'Other' && !formData.customDroneType) missing.push("Custom Drone Type")
    if (formData.selectedSlots.length === 0) missing.push("Time Slots")
    if (formData.selectedCategories.length === 0) missing.push("Service Categories")
    return missing
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login or signup to register. We've saved your progress!",
      })
      localStorage.setItem('pending_provider_registration', JSON.stringify(formData))
      router.push('/login?redirect=/drone-services/register')
      return
    }

    if (!isFormValid) {
      const missing = getMissingFields()
      toast({
        title: "Missing Required Fields",
        description: `Please fill in: ${missing.join(", ")}`,
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/drone-services/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: formData.name,
          phone: formData.phone,
          email: user.email,
          location: formData.location,
          address: formData.address,
          pincode: formData.pincode,
          droneType: formData.droneType === 'Other' ? formData.customDroneType : formData.droneType,
          timeSlots: formData.selectedSlots,
          categories: formData.selectedCategories,
          isAdmin: isAdmin,
          providerType: formData.providerType,
          targetEmail: formData.targetEmail
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register as provider')
      }

      setSubmitted(true)
      toast({
        title: "Registration Successful!",
        description: "You are now registered as a Drone Service Provider.",
      })
      
      // Redirect to dashboard after a delay
      setTimeout(() => {
        router.push('/provider-panel/login')
      }, 2000)

    } catch (err: any) {
      toast({
        title: "Registration Error",
        description: err.message || "An error occurred during submission.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <ModernHeader />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full border border-border bg-card/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-500">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground font-display">Registration Complete!</CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
                You are registered as a service provider. Redirecting you to Login...
              </CardDescription>
            </div>
            <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
          </Card>
        </main>
        <ModernFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between transition-colors duration-300">
      <ModernHeader />
      
      <main className="flex-1 pt-28 pb-16 relative">
        {/* Aesthetic background gradients */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 max-w-2xl relative z-10">
          <Link href="/drone-services" className="inline-flex items-center text-xs font-bold text-slate-550 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white mb-6 uppercase tracking-widest font-sans transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Services
          </Link>

          <Card className="border border-border bg-card shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="p-8 border-b border-border bg-muted/40">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Service Provider Registry
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight text-foreground font-display leading-tight">Become a Provider</CardTitle>
              <CardDescription className="text-xs text-slate-550 dark:text-slate-400 mt-1">
                Establish your operator profile, specify scheduling availability, and receive local mission requests.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6 text-left">
                
                {/* Admin controls */}
                {isAdmin && (
                  <div className="p-5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 rounded-2xl space-y-4">
                    <div>
                      <Label className="text-[10px] font-bold text-amber-800 dark:text-amber-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                        <ShieldCheck className="w-4 h-4" /> Admin Override Access
                      </Label>
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <Button
                          type="button"
                          variant={formData.providerType === 'personal' ? 'default' : 'outline'}
                          onClick={() => setFormData(prev => ({ ...prev, providerType: 'personal' }))}
                          className="rounded-xl h-10 text-xs font-semibold"
                        >
                          Personal Account
                        </Button>
                        <Button
                          type="button"
                          variant={formData.providerType === 'public' ? 'default' : 'outline'}
                          onClick={() => setFormData(prev => ({ ...prev, providerType: 'public' }))}
                          className="rounded-xl h-10 text-xs font-semibold flex items-center justify-center gap-1"
                        >
                          <Globe className="w-3.5 h-3.5" /> Public Account (Verified)
                        </Button>
                      </div>
                    </div>

                    {formData.providerType === 'public' && (
                      <div className="space-y-1.5 animate-in fade-in duration-200">
                        <Label htmlFor="targetEmail" className="text-xs font-semibold text-slate-600 dark:text-slate-450">Aerohive Account Email (Gmail)</Label>
                        <Input
                          id="targetEmail"
                          name="targetEmail"
                          type="email"
                          placeholder="E.g., operator-user@gmail.com"
                          value={formData.targetEmail}
                          onChange={handleInputChange}
                          className="rounded-xl border-[#e8e3d9] dark:border-slate-800 bg-[#fdfcfa] dark:bg-slate-950"
                          required
                        />
                        <p className="text-[10px] text-amber-700 dark:text-amber-500 leading-normal">
                          This verified profile will link to the Aerohive user of this email address. A placeholder account is generated if not found.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Form fields */}
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-xs font-bold text-slate-650 dark:text-slate-350">Business / Provider Name</Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450" />
                        <Input
                          id="name"
                          name="name"
                          placeholder="E.g., AeroPrecision Systems"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="pl-10 rounded-xl border-[#e8e3d9] dark:border-slate-800 bg-[#fdfcfa] dark:bg-slate-950"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-xs font-bold text-slate-650 dark:text-slate-350">Phone Number</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="E.g., +91 98765 43210"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="pl-10 rounded-xl border-[#e8e3d9] dark:border-slate-800 bg-[#fdfcfa] dark:bg-slate-950"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location Detection Box */}
                  <div className="flex justify-between items-center bg-[#faf8f5] dark:bg-slate-950 p-4 rounded-2xl border border-[#e8e3d9] dark:border-slate-850 gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-bold block text-slate-800 dark:text-slate-200">Auto Coordinates Discovery</Label>
                      <p className="text-[10px] text-slate-500 dark:text-slate-450">
                        {isAdmin 
                          ? "Admins can auto-detect coordinates or input manually below." 
                          : "Operators must run location coordinate auto-detection."}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAutoDetect}
                      disabled={isDetecting}
                      className="rounded-xl h-9 text-xs font-semibold flex items-center gap-1.5 border-primary/30 text-primary hover:bg-primary/5 shrink-0 cursor-pointer"
                    >
                      {isDetecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                      Auto Detect Coordinates
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Label htmlFor="location" className="text-xs font-bold text-slate-650 dark:text-slate-350">Service Area / City</Label>
                      <div className="relative mt-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450" />
                        <Input
                          id="location"
                          name="location"
                          placeholder="E.g. Bangalore"
                          value={formData.location}
                          onChange={(e) => {
                            handleInputChange(e)
                            setShowSuggestions(true)
                          }}
                          onFocus={() => setShowSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                          className="pl-10 rounded-xl border-[#e8e3d9] dark:border-slate-800 bg-[#fdfcfa] dark:bg-slate-950"
                          required
                        />
                      </div>
                      {showSuggestions && locationSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#fdfcfa] dark:bg-slate-900 border border-[#e8e3d9] dark:border-slate-800 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto text-left">
                          {locationSuggestions.map((sug: any) => {
                            const addr = sug.address || {}
                            const area = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || addr.town || addr.village || addr.city || ""
                            const postcode = addr.postcode || ""
                            const label = area ? `${area}, ${addr.city || addr.town || ""}` : (area || sug.display_name.split(',')[0])
                            return (
                              <button
                                key={sug.place_id}
                                type="button"
                                className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs transition-colors border-b border-[#e8e3d9]/40 dark:border-slate-800/40 last:border-0 block"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    location: area || label,
                                    pincode: postcode || prev.pincode
                                  }))
                                  setShowSuggestions(false)
                                }}
                              >
                                <div className="font-semibold text-slate-800 dark:text-white truncate">{label}</div>
                                {postcode && <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Pincode: {postcode}</div>}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="pincode" className="text-xs font-bold text-slate-650 dark:text-slate-350">Operations Pincode</Label>
                      <div className="relative mt-1">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-450" />
                        <Input
                          id="pincode"
                          name="pincode"
                          placeholder="6-digit ZIP / pincode"
                          value={formData.pincode}
                          onChange={handleInputChange}
                          className="pl-10 rounded-xl border-[#e8e3d9] dark:border-slate-800 bg-[#fdfcfa] dark:bg-slate-950"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-xs font-bold text-slate-650 dark:text-slate-350">Base Address / Fleet HQ</Label>
                    <div className="relative mt-1">
                      <Input
                        id="address"
                        name="address"
                        placeholder="E.g., Suite 402, Technology Center, Industrial Area"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="rounded-xl border-[#e8e3d9] dark:border-slate-800 bg-[#fdfcfa] dark:bg-slate-950"
                        required
                      />
                    </div>
                  </div>

                  {/* Drone Type Selector */}
                  <div>
                    <Label htmlFor="droneType" className="text-xs font-bold text-slate-650 dark:text-slate-350">Primary Hardware Fleet Category</Label>
                    <select
                      id="droneType"
                      name="droneType"
                      value={formData.droneType}
                      onChange={handleInputChange}
                      className="w-full mt-1 h-11 px-3 border border-[#e8e3d9] dark:border-slate-800 rounded-xl bg-[#fdfcfa] dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer"
                    >
                      <option value="Quadcopter">Multirotor Quadcopter</option>
                      <option value="Fixed-wing">Fixed-wing Survey Drone</option>
                      <option value="Other">Other Custom Hardware Platform</option>
                    </select>
                  </div>

                  {formData.droneType === 'Other' && (
                    <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                      <Label htmlFor="customDroneType" className="text-xs font-bold text-slate-650 dark:text-slate-350">Specify Hardware Specification</Label>
                      <Input
                        id="customDroneType"
                        name="customDroneType"
                        placeholder="E.g., Custom Heavy-Lift Octacopter"
                        value={formData.customDroneType}
                        onChange={handleInputChange}
                        className="rounded-xl mt-1 border-[#e8e3d9] dark:border-slate-800 bg-[#fdfcfa] dark:bg-slate-950"
                        required
                      />
                    </div>
                  )}

                  {/* Time Slots */}
                  <div className="space-y-3 pt-2">
                    <Label className="text-xs font-bold text-slate-650 dark:text-slate-350 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary" /> Active Working Schedule & Cost Structure
                    </Label>
                    
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <div className="relative flex-1">
                        <Input
                          type="text"
                          placeholder="Shift or range, e.g., Morning Shift"
                          value={customSlotInput}
                          onChange={(e) => setCustomSlotInput(e.target.value)}
                          className="rounded-xl border-[#e8e3d9] dark:border-slate-800 bg-[#fdfcfa] dark:bg-slate-950"
                        />
                      </div>
                      <div className="relative w-full sm:w-36">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          type="number"
                          placeholder="Price (₹)"
                          value={customSlotPriceInput}
                          onChange={(e) => setCustomSlotPriceInput(e.target.value)}
                          className="pl-8 rounded-xl border-[#e8e3d9] dark:border-slate-800 bg-[#fdfcfa] dark:bg-slate-950"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleAddTimeSlot}
                        className="bg-[#f0ece3] hover:bg-[#e8e3d9] dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 rounded-xl px-4 h-11 text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1 border-0"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Slot
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2.5 p-4 bg-[#faf8f5] dark:bg-slate-950 border border-[#e8e3d9] dark:border-slate-850 rounded-2xl min-h-[70px] items-center">
                      {formData.selectedSlots.length === 0 ? (
                        <p className="text-xs text-slate-450 dark:text-slate-500 italic">No schedule slots registered. Fill inputs above to register active slot.</p>
                      ) : (
                        formData.selectedSlots.map(slot => (
                          <span key={slot} className="inline-flex items-center gap-2 bg-primary/10 text-primary py-2 px-3.5 rounded-full text-xs font-bold">
                            {slot}
                            <button
                              type="button"
                              onClick={() => handleRemoveTimeSlot(slot)}
                              className="text-primary/70 hover:text-red-500 font-bold ml-1 transition-colors cursor-pointer"
                            >
                              ✕
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="space-y-2 pt-2">
                    <Label className="text-xs font-bold text-slate-650 dark:text-slate-350">Service Capabilities Offered</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 p-4 bg-[#faf8f5] dark:bg-slate-950 border border-[#e8e3d9] dark:border-slate-850 rounded-2xl">
                      {SERVICE_CATEGORIES.map(cat => (
                        <label key={cat.value} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-350 cursor-pointer select-none py-1">
                          <input
                            type="checkbox"
                            checked={formData.selectedCategories.includes(cat.value)}
                            onChange={() => handleCheckboxChange(cat.value, 'selectedCategories')}
                            className="w-4.5 h-4.5 rounded border-[#e8e3d9] dark:border-slate-800 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                          />
                          {cat.label}
                        </label>
                      ))}
                    </div>
                  </div>

                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-slate-900 hover:bg-primary text-white dark:bg-white dark:hover:bg-primary dark:text-slate-900 dark:hover:text-white font-bold h-12 rounded-full transition-all border-0 shadow-md flex items-center justify-center gap-2 mt-6 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      Submitting Registration Form...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4.5 h-4.5" />
                      Submit Registry Onboarding
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <ModernFooter />
    </div>
  )
}
