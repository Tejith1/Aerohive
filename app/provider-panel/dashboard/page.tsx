"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
import {
  Award,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Plane,
  Star,
  User,
  Shield,
  Loader2,
  CheckCircle2,
  XCircle,
  Truck,
  Map,
  Compass,
  AlertCircle,
  LogOut,
  Sparkles,
  Inbox,
  ShieldCheck
} from "lucide-react"

export default function ProviderDashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  
  const [provider, setProvider] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  const [activeTab, setActiveTab] = useState<"incoming" | "active" | "history">("incoming")
  const [otpInputs, setOtpInputs] = useState<{ [key: string]: string }>({})

  // Fetch provider profile and bookings
  const loadDashboardData = async (providerId: string) => {
    try {
      // Fetch using supabase client to avoid complex endpoints
      const { supabase } = await import("@/lib/supabase")
      if (!supabase) return

      const { data: providerData, error: providerErr } = await supabase
        .from('service_providers')
        .select('*')
        .eq('id', providerId)
        .single()

      if (providerErr || !providerData) {
        toast({
          title: "Profile Not Found",
          description: "Please complete your service provider registration.",
          variant: "destructive"
        })
        router.push('/drone-services/register')
        return
      }

      setProvider(providerData)

      // Fetch bookings
      const bookingsRes = await fetch(`/api/provider-panel/bookings?providerId=${providerId}`)
      const bookingsData = await bookingsRes.json()
      if (bookingsData.success) {
        setBookings(bookingsData.bookings)
      }
    } catch (err) {
      console.error("Dashboard load error:", err)
      toast({
        title: "Error Loading Data",
        description: "Failed to connect to the server.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadDashboardData(user.id)
    } else {
      // Check local storage for session or redirect
      const localSess = localStorage.getItem("aerohive_provider_session")
      if (localSess) {
        try {
          const parsed = JSON.parse(localSess)
          loadDashboardData(parsed.id)
        } catch {
          router.push('/provider-panel/login')
        }
      } else {
        router.push('/provider-panel/login')
      }
    }
  }, [user, router])

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    setActionLoading(bookingId)
    try {
      const response = await fetch('/api/provider-panel/bookings/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, status })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to update status')

      toast({
        title: `Status Updated`,
        description: `Booking is now ${status.replace('_', ' ')}.`,
      })

      if (user) {
        loadDashboardData(user.id)
      } else {
        const localSess = localStorage.getItem("aerohive_provider_session")
        if (localSess) {
          const parsed = JSON.parse(localSess)
          loadDashboardData(parsed.id)
        }
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleVerifyOtp = async (bookingId: string) => {
    const otp = otpInputs[bookingId]
    if (!otp) {
      toast({
        title: "OTP Required",
        description: "Please enter the 4-digit code provided by the customer.",
        variant: "destructive"
      })
      return
    }

    setActionLoading(bookingId)
    try {
      const response = await fetch('/api/provider-panel/bookings/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, otp })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to verify OTP')

      toast({
        title: "Service Completed!",
        description: "OTP verified successfully. Job completed.",
      })

      if (user) {
        loadDashboardData(user.id)
      } else {
        const localSess = localStorage.getItem("aerohive_provider_session")
        if (localSess) {
          const parsed = JSON.parse(localSess)
          loadDashboardData(parsed.id)
        }
      }
    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err.message,
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleOtpInputChange = (bookingId: string, value: string) => {
    setOtpInputs(prev => ({ ...prev, [bookingId]: value }))
  }

  const handleLogout = async () => {
    localStorage.removeItem("aerohive_provider_session")
    try {
      if (logout) {
        await logout()
      }
    } catch (e) {
      console.error("Auth logout failed", e)
    }
    router.push("/provider-panel/login")
  }

  // Filter bookings
  const incomingBookings = bookings.filter(b => b.status?.toUpperCase() === 'PENDING')
  const activeBookings = bookings.filter(b => ['ACCEPTED', 'EN_ROUTE', 'ON_SITE'].includes(b.status?.toUpperCase()))
  const historyBookings = bookings.filter(b => ['COMPLETED', 'DECLINED', 'CANCELLED', 'REJECTED'].includes(b.status?.toUpperCase()))

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
        <ModernHeader />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-xs font-bold text-slate-550 uppercase tracking-widest font-sans">Syncing Provider Panel...</p>
          </div>
        </main>
        <ModernFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between transition-colors duration-300">
      <ModernHeader />

      <main className="flex-1 pt-28 pb-16 relative">
        {/* Glow ambient background assets */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-[110px] pointer-events-none" />

        <div className="container mx-auto px-4 max-w-6xl space-y-8 relative z-10 text-left">
          
          {/* Header Banner Card */}
          {provider && (
            <Card className="border border-border bg-card shadow-sm rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
              <div className="space-y-4 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground font-display leading-tight">
                    {provider.name}
                  </h1>
                  {provider.is_verified && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20 rounded-full py-1 px-3 text-[10px] font-semibold uppercase tracking-widest w-fit mx-auto md:mx-0">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified operator
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-xs font-semibold text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                    <span className="text-foreground">{provider.rating || 5.0} Score</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{provider.address?.location || provider.service_areas?.[0] || 'N/A'}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Plane className="w-4 h-4 text-primary" />
                    <span>{provider.address?.drone_type || 'Multirotor'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="grid grid-cols-2 gap-3 text-center shrink-0">
                  <div className="p-3 bg-muted/40 rounded-xl border border-border min-w-[84px]">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-bold">Active Jobs</span>
                    <span className="text-xl font-bold text-foreground block mt-0.5">{activeBookings.length}</span>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl border border-border min-w-[84px]">
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground block font-bold">Completed</span>
                    <span className="text-xl font-bold text-foreground block mt-0.5">{historyBookings.filter(b => b.status === 'COMPLETED').length}</span>
                  </div>
                </div>
                
                <Button
                  onClick={handleLogout}
                  className="bg-muted hover:bg-destructive/10 text-foreground hover:text-destructive border border-border rounded-xl px-5 h-16 text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 min-w-[100px] cursor-pointer"
                >
                  <LogOut className="h-4.5 w-4.5" />
                  Disconnect
                </Button>
              </div>
            </Card>
          )}

          {/* Navigation Tab Selector */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center space-x-1 bg-muted/40 p-1 border border-border rounded-lg shadow-sm">
              <Button
                variant={activeTab === "incoming" ? "default" : "ghost"}
                onClick={() => setActiveTab("incoming")}
                className={`rounded-md px-5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "incoming" 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Incoming ({incomingBookings.length})
              </Button>
              <Button
                variant={activeTab === "active" ? "default" : "ghost"}
                onClick={() => setActiveTab("active")}
                className={`rounded-md px-5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "active" 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Active Operations ({activeBookings.length})
              </Button>
              <Button
                variant={activeTab === "history" ? "default" : "ghost"}
                onClick={() => setActiveTab("history")}
                className={`rounded-md px-5 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "history" 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                History ({historyBookings.length})
              </Button>
            </div>
          </div>

          {/* Bookings Display list */}
          <div className="space-y-6">
            
            {activeTab === "incoming" && (
              incomingBookings.length === 0 ? (
                <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed border-border max-w-md mx-auto">
                  <Inbox className="w-10 h-10 text-muted-foreground mx-auto mb-3 animate-pulse" />
                  <h3 className="text-sm font-semibold text-foreground font-display">No incoming request tickets</h3>
                  <p className="text-muted-foreground text-[11px] px-6 mt-1">New drone service booking requests will display in this sector.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {incomingBookings.map(b => (
                    <Card key={b.id} className="border border-border bg-card rounded-xl overflow-hidden hover:shadow-md transition-all duration-300">
                      <CardHeader className="pb-3 bg-muted/20 border-b border-border/50">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="capitalize text-[10px] font-bold text-primary border-primary/25 bg-primary/5">
                            {b.service?.category || 'General'}
                          </Badge>
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-500">₹{(b.estimated_cost || b.service?.base_price || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <CardTitle className="text-lg mt-2 font-bold tracking-tight text-foreground font-display">{b.service?.title || 'Drone Mission'}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4 text-xs">
                        <div className="space-y-3 bg-muted/30 p-3 rounded-lg border border-border">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-primary shrink-0" />
                            <span className="font-bold text-foreground">{b.location_address?.name || b.user?.first_name || 'Client'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4 text-muted-foreground/75 shrink-0" />
                            <span>{b.location_address?.phone || b.user?.phone || 'No phone'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4 text-muted-foreground/75 shrink-0" />
                            <span className="line-clamp-1">{b.location_address?.street || 'N/A'}, Pincode: {b.location_address?.pincode}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4 text-muted-foreground/75 shrink-0" />
                            <span>Slot: {b.location_address?.time_slot || 'ASAP'} on {b.booking_date}</span>
                          </div>
                          {b.location_address?.landscape_size && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Map className="w-4 h-4 text-muted-foreground/75 shrink-0" />
                              <span>Landscape size: {b.location_address.landscape_size}</span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <Button
                            onClick={() => handleUpdateStatus(b.id, 'ACCEPTED')}
                            disabled={!!actionLoading}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-2.5 h-10 border-0 font-bold transition active:scale-95 cursor-pointer"
                          >
                            {actionLoading === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accept Request"}
                          </Button>
                          <Button
                            onClick={() => handleUpdateStatus(b.id, 'DECLINED')}
                            disabled={!!actionLoading}
                            variant="outline"
                            className="rounded-lg py-2.5 h-10 border border-border font-bold hover:bg-muted cursor-pointer"
                          >
                            Decline
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            )}

            {activeTab === "active" && (
              activeBookings.length === 0 ? (
                <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed border-border max-w-md mx-auto">
                  <Compass className="w-10 h-10 text-muted-foreground mx-auto mb-3 animate-pulse" />
                  <h3 className="text-sm font-semibold text-foreground font-display">No active operations</h3>
                  <p className="text-muted-foreground text-[11px] px-6 mt-1">Accepted operations will display navigation controls in this panel.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeBookings.map(b => (
                    <Card key={b.id} className="border border-border bg-card rounded-xl overflow-hidden shadow-sm">
                      <CardHeader className="pb-3 bg-muted/30 border-b border-border">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-primary text-primary-foreground text-[9px] uppercase tracking-widest font-bold border-0 rounded-full py-1 px-3">
                            {b.status.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm font-bold text-foreground">₹{b.estimated_cost}</span>
                        </div>
                        <CardTitle className="text-lg mt-2 font-bold tracking-tight text-foreground font-display">{b.service?.title || 'Drone Mission'}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4 text-xs">
                        <div className="space-y-3 bg-muted/20 p-3 rounded-lg border border-border/50">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-primary shrink-0" />
                            <span className="font-bold text-foreground">{b.location_address?.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-4 h-4 text-muted-foreground/75 shrink-0" />
                            <span>{b.location_address?.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4 text-muted-foreground/75 shrink-0" />
                            <span className="line-clamp-1">{b.location_address?.street}, {b.location_address?.pincode}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4 text-muted-foreground/75 shrink-0" />
                            <span>Schedule: {b.location_address?.time_slot}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border">
                          {b.status === 'ACCEPTED' && (
                            <Button
                              onClick={() => handleUpdateStatus(b.id, 'EN_ROUTE')}
                              disabled={!!actionLoading}
                              className="w-full bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg py-2.5 h-11 border-0 flex items-center justify-center gap-1.5 font-bold transition active:scale-95 cursor-pointer shadow-sm"
                            >
                              <Truck className="w-4 h-4" />
                              Start Journey (En Route)
                            </Button>
                          )}
                          
                          {b.status === 'EN_ROUTE' && (
                            <Button
                              onClick={() => handleUpdateStatus(b.id, 'ON_SITE')}
                              disabled={!!actionLoading}
                              className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-lg py-2.5 h-11 border-0 flex items-center justify-center gap-1.5 font-bold transition active:scale-95 cursor-pointer shadow-sm"
                            >
                              <MapPin className="w-4 h-4" />
                              Arrive On Site (Send OTP)
                            </Button>
                          )}

                          {b.status === 'ON_SITE' && (
                            <div className="space-y-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-550 block uppercase tracking-widest">Client Security Verification OTP Sent!</span>
                              <div className="flex items-center gap-2">
                                <Input
                                  placeholder="Enter 4-digit OTP"
                                  value={otpInputs[b.id] || ""}
                                  onChange={(e) => handleOtpInputChange(b.id, e.target.value)}
                                  className="h-11 rounded-lg border-border bg-background text-center font-bold font-mono tracking-widest text-sm"
                                  maxLength={4}
                                />
                                <Button
                                  onClick={() => handleVerifyOtp(b.id)}
                                  disabled={!!actionLoading}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-11 px-5 border-0 font-bold shrink-0 cursor-pointer active:scale-95"
                                >
                                  {actionLoading === b.id ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : "Verify & Complete"}
                                </Button>
                              </div>
                              <div className="flex justify-between items-center pt-1 text-[10px]">
                                <p className="text-muted-foreground leading-normal">
                                  Ask the client for the security OTP code.
                                </p>
                                <Button
                                  variant="link"
                                  onClick={() => handleUpdateStatus(b.id, 'ON_SITE')}
                                  disabled={!!actionLoading}
                                  className="text-[10px] font-bold text-primary p-0 h-auto cursor-pointer"
                                >
                                  {actionLoading === b.id ? "Resending..." : "🔁 Resend OTP Code"}
                                </Button>
                              </div>
                            </div>
                          )}

                          {['ACCEPTED', 'EN_ROUTE', 'ON_SITE'].includes(b.status?.toUpperCase()) && (
                            <div className="mt-3 border-t border-border pt-3">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  if (confirm("Are you sure you want to reject this active job? This will notify the client via email.")) {
                                    handleUpdateStatus(b.id, 'REJECTED')
                                  }
                                }}
                                disabled={!!actionLoading}
                                className="w-full border-destructive/20 hover:bg-destructive/10 text-destructive rounded-lg py-2 h-9 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject Active Job
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            )}

            {activeTab === "history" && (
              historyBookings.length === 0 ? (
                <div className="text-center py-16 bg-muted/20 rounded-xl border border-dashed border-border max-w-md mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-muted-foreground mx-auto mb-3 animate-pulse" />
                  <h3 className="text-sm font-semibold text-foreground font-display">History is empty</h3>
                  <p className="text-muted-foreground text-[11px] px-6 mt-1">Completed, declined, and rejected jobs will list here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {historyBookings.map(b => (
                    <Card key={b.id} className="border border-border bg-card rounded-xl overflow-hidden opacity-95">
                      <CardHeader className="pb-3 bg-muted/20 border-b border-border/50">
                        <div className="flex items-center justify-between">
                          <Badge variant={b.status === 'COMPLETED' ? 'secondary' : 'outline'} className={b.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20' : 'bg-destructive/5 text-destructive border-destructive/20'}>
                            {b.status}
                          </Badge>
                          <span className="text-sm font-bold text-muted-foreground">₹{b.estimated_cost}</span>
                        </div>
                        <CardTitle className="text-lg mt-2 font-bold tracking-tight text-foreground font-display">{b.service?.title || 'Drone Mission'}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-5 space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground/75 shrink-0" />
                          <span className="font-semibold text-foreground">{b.location_address?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground/75 shrink-0" />
                          <span>{b.location_address?.street}, {b.location_address?.pincode}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground/75 shrink-0" />
                          <span>Delivered schedule slot: {b.location_address?.time_slot}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            )}

          </div>

        </div>
      </main>

      <ModernFooter />
    </div>
  )
}
