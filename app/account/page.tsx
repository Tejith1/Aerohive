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
                                        <Input
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="rounded-xl border-gray-200 focus:ring-blue-500"
                                            placeholder="+91-XXXXXXXXXX"
                                        />
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
        </div>
    )
}
