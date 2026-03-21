'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { getUserProfile, updateUserProfile, User } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { User as UserIcon, Mail, Phone, Shield, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function AccountPage() {
    const { user: authUser, isAuthenticated } = useAuth()
    const [profile, setProfile] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: ''
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
                setFormData({
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    phone: data.phone || ''
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
            await updateUserProfile(authUser.id, formData)
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
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    if (!authUser) {
        return (
            <div className="min-h-screen pt-24 container mx-auto px-4 text-center">
                <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
                <p className="mb-8">You need to be logged in to view your account.</p>
                <Button asChild>
                    <Link href="/login">Sign In</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
                    <p className="text-gray-500">Profile & Settings</p>
                </div>

                {!profile?.is_phone_verified && profile?.phone && (
                    <div className="mt-6 mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                                <Phone className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-900 text-sm">Verify Your Phone Number</h4>
                                <p className="text-amber-700 text-xs">A verified phone number is required for booking services.</p>
                            </div>
                        </div>
                        <Button 
                            onClick={sendOTP} 
                            disabled={sendingOTP}
                            className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs h-9 px-4 shadow-md shadow-amber-200"
                        >
                            {sendingOTP ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Verify Now'}
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar Info */}
                    <div className="md:col-span-1 space-y-6">
                        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-white/10 rounded-full blur-2xl"></div>
                            <CardContent className="p-6 text-center relative z-10">
                                <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold mx-auto mb-4 border border-white/30">
                                    {profile?.first_name ? profile.first_name[0].toUpperCase() : 'U'}
                                </div>
                                <h3 className="text-xl font-bold">{profile?.first_name} {profile?.last_name}</h3>
                                <div className="mt-2 flex items-center justify-center gap-2">
                                    <Badge className="bg-white/20 hover:bg-white/30 border-0 text-white">
                                        {profile?.is_admin ? 'Administrator' : 'Premium Member'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <h4 className="font-semibold mb-4 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-blue-600" />
                                Account Security
                            </h4>
                            <p className="text-sm text-gray-500 mb-4">
                                Keep your contact information up to date to ensure secure mission coordination.
                            </p>
                            {authUser?.provider === 'google' ? (
                                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-[11px] text-blue-700 leading-relaxed">
                                    <span className="font-bold block mb-1">Authenticated via Google</span>
                                    Password management is handled by your Google Account security settings.
                                </div>
                            ) : (
                                <Button variant="outline" className="w-full justify-start gap-2 border-gray-200 hover:bg-gray-50 rounded-xl" asChild>
                                    <Link href="/account/change-password">
                                        Change Password
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-2">
                        <Card className="border-0 shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
                            <CardHeader className="bg-white border-b border-gray-50 px-8 py-6">
                                <CardTitle className="text-xl">Profile Information</CardTitle>
                                <CardDescription>Basic info that identifies you on the platform</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8">
                                <form onSubmit={handleUpdate} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                <UserIcon className="h-3.5 w-3.5 text-blue-600" />
                                                First Name
                                            </label>
                                            <Input
                                                value={formData.first_name}
                                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                className="rounded-xl border-gray-200 focus:ring-blue-500"
                                                placeholder="Enter first name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Last Name</label>
                                            <Input
                                                value={formData.last_name}
                                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                className="rounded-xl border-gray-200 focus:ring-blue-500"
                                                placeholder="Enter last name"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <Mail className="h-3.5 w-3.5 text-blue-600" />
                                            Email Address
                                        </label>
                                        <Input
                                            value={profile?.email || ''}
                                            disabled
                                            className="rounded-xl bg-gray-50 border-gray-100 text-gray-500 cursor-not-allowed"
                                        />
                                        <p className="text-[10px] text-gray-400">Email cannot be changed directly.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <Phone className="h-3.5 w-3.5 text-blue-600" />
                                            Phone Number
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <Input
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^\d+]/g, '') })}
                                                    className="rounded-xl border-gray-200 focus:ring-blue-500 font-mono"
                                                    placeholder="+917416860912"
                                                />
                                            </div>
                                            {profile?.is_phone_verified && (
                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 h-10 px-4 rounded-xl flex items-center gap-1.5">
                                                    <Shield className="h-3.5 w-3.5" />
                                                    Verified
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full sm:w-auto px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 flex items-center gap-2 shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]"
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
                    <Card className="w-full max-w-sm border-0 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[32px] overflow-hidden bg-white animate-in zoom-in-95 duration-200 scale-100">
                        <CardHeader className="text-center pt-10 pb-4">
                            <div className="h-20 w-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <Shield className="h-10 w-10" />
                            </div>
                            <CardTitle className="text-3xl font-black text-gray-900 tracking-tight">Verify Phone</CardTitle>
                            <CardDescription className="text-gray-500 mt-2 font-medium">
                                Enter the 6-digit code sent to<br/>
                                <span className="text-blue-600 font-bold text-lg select-all">{formData.phone}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-10 pb-12 space-y-8">
                            <div className="flex justify-center">
                                <Input 
                                    value={otpValue}
                                    onChange={(e) => setOTPValue(e.target.value.replace(/\D/g, '').substring(0, 6))}
                                    placeholder="••••••"
                                    className="text-center text-4xl tracking-[0.4em] font-black h-20 rounded-2xl border-2 border-gray-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 bg-gray-50/50 transition-all placeholder:tracking-normal placeholder:font-light"
                                />
                            </div>
                            <div className="flex flex-col gap-4">
                                <Button 
                                    onClick={verifyOTP}
                                    disabled={verifyingOTP || otpValue.length < 6}
                                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-2xl shadow-xl shadow-blue-200 active:scale-[0.98] transition-all"
                                >
                                    {verifyingOTP ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Verifying...</span>
                                        </div>
                                    ) : 'Confirm Verification'}
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => setShowOTPModal(false)}
                                    className="w-full h-12 text-gray-500 hover:text-red-500 hover:bg-red-50 font-bold text-base transition-colors duration-200"
                                >
                                    Cancel
                                </Button>
                            </div>
                            <p className="text-center text-[10px] text-gray-400">
                                Didn't receive the code? Check your email or spam folder.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
