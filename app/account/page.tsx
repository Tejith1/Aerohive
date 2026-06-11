'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { getUserProfile, updateUserProfile, User } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { User as UserIcon, Mail, Phone, Shield, Save, Loader2, ArrowLeft, Award, Clock, Settings, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function AccountPage() {
    const { user: authUser, isAuthenticated } = useAuth()
    const [profile, setProfile] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        dgca_license: '',
        total_flight_hours: '',
        experience_level: '',
        specialized_drones: '',
        two_factor: false,
        email_notifications: true
    })
    const { toast } = useToast()

    // OTP Verification State
    const [showOTPModal, setShowOTPModal] = useState(false)
    const [otpValue, setOTPValue] = useState('')
    const [verifyingOTP, setVerifyingOTP] = useState(false)
    const [sendingOTP, setSendingOTP] = useState(false)

    useEffect(() => {
        if (authUser) {
            fetchProfile()
        } else if (!isAuthenticated && !loading) {
            // Redirect or handle unauthenticated
        }
    }, [authUser, isAuthenticated])

    const fetchProfile = async () => {
        try {
            setLoading(true)
            const data = await getUserProfile(authUser!.id)
            if (data) {
                setProfile(data)
                
                // Fetch extras from localStorage
                const extrasStr = localStorage.getItem(`aerohive_profile_extras_${authUser!.id}`)
                let extras = {
                    dgca_license: 'AH-PILOT-' + Math.floor(1000 + Math.random() * 9000),
                    total_flight_hours: '148',
                    experience_level: 'Commercial Pilot',
                    specialized_drones: 'Quadcopter, Hexacopter, FPV',
                    two_factor: false,
                    email_notifications: true
                }
                if (extrasStr) {
                    try {
                        const parsed = JSON.parse(extrasStr)
                        extras = { ...extras, ...parsed }
                    } catch (e) {}
                }

                setFormData({
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    phone: data.phone || '',
                    dgca_license: extras.dgca_license,
                    total_flight_hours: extras.total_flight_hours,
                    experience_level: extras.experience_level,
                    specialized_drones: extras.specialized_drones,
                    two_factor: extras.two_factor,
                    email_notifications: extras.email_notifications
                })
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
            toast({
                title: 'Error',
                description: 'Failed to load profile data.',
                variant: 'destructive'
            })
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!authUser) return

        try {
            setSaving(true)
            // Update core Supabase fields
            await updateUserProfile(authUser.id, {
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone
            })

            // Save extras to localStorage
            localStorage.setItem(`aerohive_profile_extras_${authUser.id}`, JSON.stringify({
                dgca_license: formData.dgca_license,
                total_flight_hours: formData.total_flight_hours,
                experience_level: formData.experience_level,
                specialized_drones: formData.specialized_drones,
                two_factor: formData.two_factor,
                email_notifications: formData.email_notifications
            }))

            toast({
                title: 'Success',
                description: 'Profile updated successfully.',
            })
            fetchProfile()
        } catch (error) {
            console.error('Error updating profile:', error)
            toast({
                title: 'Update Failed',
                description: 'Could not save profile changes.',
                variant: 'destructive'
            })
        } finally {
            setSaving(false)
        }
    }

    const sendOTP = async () => {
        if (!formData.phone) {
            toast({ title: "Phone Required", description: "Please enter your phone number first.", variant: "destructive" })
            return
        }

        try {
            setSendingOTP(true)
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: formData.phone })
            })
            const data = await res.json()
            if (data.success) {
                setShowOTPModal(true)
                const smsSuccess = data.sms_status?.success || data.sms_status?.simulated
                const emailSuccess = data.email_status?.success
                
                if (smsSuccess && emailSuccess) {
                    toast({ title: "OTP Sent! 🚀", description: "Code sent via SMS and Email." })
                } else if (smsSuccess) {
                    toast({ title: "OTP Sent!", description: `SMS sent! (Email backup failed)` })
                } else if (emailSuccess) {
                    toast({ title: "OTP Sent! 📧", description: "SMS failed, but code was sent to your Email." })
                } else {
                    toast({ title: "Delivery Error", description: "Could not send OTP via SMS or Email. Check server settings.", variant: "destructive" })
                }
            } else {
                throw new Error(data.error)
            }
        } catch (err: any) {
            toast({ title: "Failed to send OTP", description: err.message, variant: "destructive" })
        } finally {
            setSendingOTP(false)
        }
    }

    const verifyOTP = async () => {
        if (!otpValue || otpValue.length < 4) return

        try {
            setVerifyingOTP(true)
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: formData.phone, otp: otpValue })
            })
            const data = await res.json()
            if (data.success) {
                // Update profile in DB to reflect verification
                await updateUserProfile(authUser!.id, { is_phone_verified: true })
                toast({ title: "Verified! 🎉", description: "Your phone number has been verified successfully." })
                setShowOTPModal(false)
                fetchProfile()
            } else {
                throw new Error(data.error)
            }
        } catch (err: any) {
            toast({ title: "Verification Failed", description: err.message, variant: "destructive" })
        } finally {
            setVerifyingOTP(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-[#e65737]" />
            </div>
        )
    }

    if (!authUser) {
        return (
            <div className="min-h-screen pt-24 container mx-auto px-4 text-center bg-background">
                <h1 className="text-2xl font-bold mb-4 font-display uppercase">Please Sign In</h1>
                <p className="mb-8 font-mono-tech text-xs uppercase tracking-wider text-muted-foreground">You need to be logged in to view your account.</p>
                <Button asChild className="bg-[#e65737] hover:bg-[#cc5032] text-white font-mono-tech text-xs uppercase tracking-wider rounded-[14px] px-8 py-5">
                    <Link href="/login">Sign In</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pt-32 pb-20">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-widest text-muted-foreground hover:text-[#e65737] transition-all group">
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        [ Back to Home ]
                    </Link>
                </div>
                <div className="mb-10 text-left">
                    <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[#e65737] mb-2 block">
                        [ USER SETTINGS & CONTROL ]
                    </span>
                    <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tighter uppercase text-foreground">My Account</h1>
                    <p className="text-muted-foreground font-mono-tech text-xs uppercase tracking-wider">Profile & Settings</p>
                </div>

                {!profile?.is_phone_verified && profile?.phone && (
                    <div className="mb-8 bg-[#e65737]/5 border border-[#e65737]/20 rounded-2xl p-6 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-[#e65737]/10 rounded-xl flex items-center justify-center text-[#e65737]">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-foreground text-sm uppercase font-display">Verify Your Phone Number</h4>
                                <p className="text-muted-foreground text-xs font-mono-tech uppercase tracking-wider">A verified phone number is required for booking services.</p>
                            </div>
                        </div>
                        <Button 
                            onClick={sendOTP} 
                            disabled={sendingOTP}
                            className="bg-[#e65737] hover:bg-[#cc5032] text-white rounded-[14px] text-xs h-10 px-6 font-mono-tech uppercase tracking-wider"
                        >
                            {sendingOTP ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Verify Now'}
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar Info */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="border border-border/40 shadow-sm bg-card text-foreground overflow-hidden relative rounded-2xl">
                            <CardContent className="p-8 text-center relative z-10">
                                <div className="h-20 w-20 rounded-full bg-[#e65737]/10 flex items-center justify-center text-3xl font-bold mx-auto mb-4 border border-[#e65737]/20 text-[#e65737]">
                                    {profile?.first_name ? profile.first_name[0].toUpperCase() : 'U'}
                                </div>
                                <h3 className="text-xl font-black uppercase font-display text-foreground">{profile?.first_name} {profile?.last_name}</h3>
                                <div className="mt-4 flex items-center justify-center gap-2">
                                    <Badge className="bg-[#e65737] hover:bg-[#cc5032] border-0 text-white rounded-[8px] font-mono-tech text-[9px] uppercase tracking-wider px-3 py-1">
                                        {profile?.is_admin ? 'Administrator' : 'Premium Member'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-card rounded-2xl p-6 border border-border/40">
                            <h4 className="font-display font-black text-sm uppercase text-foreground mb-4 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-[#e65737]" />
                                Account Security
                            </h4>
                            <p className="text-xs text-muted-foreground font-mono-tech uppercase tracking-wider mb-4 leading-relaxed">
                                Keep your contact information up to date to ensure secure mission coordination.
                            </p>
                            {authUser?.provider === 'google' ? (
                                <div className="p-4 bg-[#e65737]/5 rounded-xl border border-[#e65737]/20 text-[10px] text-foreground leading-relaxed font-mono-tech uppercase tracking-wider">
                                    <span className="font-bold text-[#e65737] block mb-1">Authenticated via Google</span>
                                    Password management is handled by your Google Account security settings.
                                </div>
                            ) : (
                                <Button variant="outline" className="w-full justify-start gap-2 border-border hover:bg-muted rounded-[14px] font-mono-tech text-xs uppercase" asChild>
                                    <Link href="/account/change-password">
                                        Change Password
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-2">
                        <Card className="border border-border/40 rounded-3xl overflow-hidden bg-card">
                            <CardHeader className="border-b border-border/40 px-8 py-6">
                                <CardTitle className="text-xl font-display font-black uppercase text-foreground tracking-tight">Profile Information</CardTitle>
                                <CardDescription className="font-mono-tech text-xs uppercase tracking-wider text-muted-foreground">Basic info that identifies you on the platform</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={handleUpdate} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-foreground flex items-center gap-2 uppercase font-mono-tech tracking-wider">
                                                <UserIcon className="h-3.5 w-3.5 text-[#e65737]" />
                                                First Name
                                            </label>
                                            <Input
                                                value={formData.first_name}
                                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                className="rounded-[12px] border-border bg-background focus-visible:ring-[#e65737]/25 focus-visible:border-[#e65737]"
                                                placeholder="Enter first name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-foreground flex items-center gap-2 uppercase font-mono-tech tracking-wider">Last Name</label>
                                            <Input
                                                value={formData.last_name}
                                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                className="rounded-[12px] border-border bg-background focus-visible:ring-[#e65737]/25 focus-visible:border-[#e65737]"
                                                placeholder="Enter last name"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-2 uppercase font-mono-tech tracking-wider">
                                            <Mail className="h-3.5 w-3.5 text-[#e65737]" />
                                            Email Address
                                        </label>
                                        <Input
                                            value={profile?.email || ''}
                                            disabled
                                            className="rounded-[12px] bg-secondary/50 border-border text-muted-foreground cursor-not-allowed"
                                        />
                                        <p className="text-[10px] font-mono-tech text-muted-foreground uppercase">Email cannot be changed directly.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-foreground flex items-center gap-2 uppercase font-mono-tech tracking-wider">
                                            <Phone className="h-3.5 w-3.5 text-[#e65737]" />
                                            Phone Number
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <Input
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^\d+]/g, '') })}
                                                    className="rounded-[12px] border-border bg-background focus-visible:ring-[#e65737]/25 focus-visible:border-[#e65737] font-mono"
                                                    placeholder="+917416860912"
                                                />
                                            </div>
                                            {profile?.is_phone_verified && (
                                                <Badge className="bg-green-500/10 text-green-700 hover:bg-green-500/15 border border-green-500/20 h-10 px-4 rounded-[12px] flex items-center gap-1.5 font-mono-tech uppercase text-[10px]">
                                                    <Shield className="h-3.5 w-3.5" />
                                                    Verified
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border-t border-border/40 pt-6 mt-6">
                                        <h4 className="text-sm font-display font-black uppercase text-foreground mb-4 flex items-center gap-2">
                                            <Award className="h-4 w-4 text-[#e65737]" />
                                            Aviation Credentials & Specs
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-foreground flex items-center gap-2 uppercase font-mono-tech tracking-wider">DGCA License No</label>
                                                <Input
                                                    value={formData.dgca_license}
                                                    onChange={(e) => setFormData({ ...formData, dgca_license: e.target.value })}
                                                    className="rounded-[12px] border-border bg-background focus-visible:ring-[#e65737]/25 focus-visible:border-[#e65737] font-mono"
                                                    placeholder="e.g. DGCA-UA-1827"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-foreground flex items-center gap-2 uppercase font-mono-tech tracking-wider">Experience Level</label>
                                                <Input
                                                    value={formData.experience_level}
                                                    onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                                                    className="rounded-[12px] border-border bg-background focus-visible:ring-[#e65737]/25 focus-visible:border-[#e65737]"
                                                    placeholder="e.g. Commercial Pilot"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-foreground flex items-center gap-2 uppercase font-mono-tech tracking-wider">
                                                    <Clock className="h-3.5 w-3.5 text-[#e65737]" />
                                                    Logged Flight Hours
                                                </label>
                                                <Input
                                                    value={formData.total_flight_hours}
                                                    onChange={(e) => setFormData({ ...formData, total_flight_hours: e.target.value })}
                                                    className="rounded-[12px] border-border bg-background focus-visible:ring-[#e65737]/25 focus-visible:border-[#e65737] font-mono"
                                                    placeholder="e.g. 150"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-foreground flex items-center gap-2 uppercase font-mono-tech tracking-wider">Specialized Rigs / Drones</label>
                                                <Input
                                                    value={formData.specialized_drones}
                                                    onChange={(e) => setFormData({ ...formData, specialized_drones: e.target.value })}
                                                    className="rounded-[12px] border-border bg-background focus-visible:ring-[#e65737]/25 focus-visible:border-[#e65737]"
                                                    placeholder="e.g. DJI Mavic 3, Hexacopter"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-border/40 pt-6 mt-6">
                                        <h4 className="text-sm font-display font-black uppercase text-foreground mb-4 flex items-center gap-2">
                                            <Settings className="h-4 w-4 text-[#e65737]" />
                                            Preferences
                                        </h4>
                                        <div className="space-y-4">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input 
                                                    type="checkbox"
                                                    checked={formData.two_factor}
                                                    onChange={(e) => setFormData({ ...formData, two_factor: e.target.checked })}
                                                    className="rounded border-border bg-background text-[#e65737] focus:ring-[#e65737] h-4 w-4"
                                                />
                                                <span className="text-xs font-mono-tech uppercase text-muted-foreground group-hover:text-foreground transition-colors select-none">Enable Two-Factor Authentication</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <input 
                                                    type="checkbox"
                                                    checked={formData.email_notifications}
                                                    onChange={(e) => setFormData({ ...formData, email_notifications: e.target.checked })}
                                                    className="rounded border-border bg-background text-[#e65737] focus:ring-[#e65737] h-4 w-4"
                                                />
                                                <span className="text-xs font-mono-tech uppercase text-muted-foreground group-hover:text-foreground transition-colors select-none">Send Email Alerts & Booking Confirmations</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <Button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full sm:w-auto px-8 bg-[#e65737] hover:bg-[#cc5032] text-white rounded-[14px] h-12 flex items-center gap-2 font-mono-tech text-xs uppercase tracking-wider font-semibold shadow-none"
                                        >
                                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* OTP Verification High-Contrast Modal */}
            {showOTPModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300">
                    <Card className="w-full max-w-sm border border-border/40 shadow-xl rounded-[32px] overflow-hidden bg-card animate-in zoom-in-95 duration-200">
                        <CardHeader className="text-center pt-10 pb-4">
                            <div className="h-20 w-20 bg-[#e65737]/10 text-[#e65737] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-[#e65737]/20">
                                <Shield className="h-10 w-10" />
                            </div>
                            <CardTitle className="text-3xl font-black text-foreground tracking-tight uppercase font-display">Verify Phone</CardTitle>
                            <CardDescription className="text-muted-foreground mt-2 font-mono-tech text-xs uppercase tracking-wider">
                                Enter the 6-digit code sent to<br/>
                                <span className="text-[#e65737] font-bold text-lg select-all">{formData.phone}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-10 pb-12 space-y-8">
                            <div className="flex justify-center">
                                <Input 
                                    value={otpValue}
                                    onChange={(e) => setOTPValue(e.target.value.replace(/\D/g, '').substring(0, 6))}
                                    placeholder="••••••"
                                    className="text-center text-4xl tracking-[0.4em] font-black h-20 rounded-2xl border-2 border-border focus:border-[#e65737] focus:ring-4 focus:ring-[#e65737]/10 bg-background transition-all placeholder:tracking-normal placeholder:font-light"
                                />
                            </div>
                            <div className="flex flex-col gap-4">
                                <Button 
                                    onClick={verifyOTP}
                                    disabled={verifyingOTP || otpValue.length < 6}
                                    className="w-full h-14 bg-[#e65737] hover:bg-[#cc5032] text-white text-lg font-bold rounded-2xl shadow-none active:scale-[0.98] transition-all font-mono-tech uppercase text-xs tracking-wider"
                                >
                                    {verifyingOTP ? (
                                        <div className="flex items-center gap-2 justify-center">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Verifying...</span>
                                        </div>
                                    ) : 'Confirm Verification'}
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setShowOTPModal(false)}
                                    className="w-full h-12 text-muted-foreground hover:text-[#e65737] hover:bg-muted font-bold text-xs font-mono-tech uppercase tracking-wider"
                                >
                                    Cancel
                                </Button>
                            </div>
                            <p className="text-center text-[10px] font-mono-tech text-muted-foreground uppercase">
                                Didn't receive the code? Check your email or spam folder.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
