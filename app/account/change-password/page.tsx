'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Lock, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ChangePasswordPage() {
    const { updatePassword, user, isLoading } = useAuth()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    React.useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login')
        }
        if (!isLoading && user?.provider === 'google') {
            toast({
                title: "Not Available",
                description: "Password management is not available for Google accounts.",
            })
            router.push('/account')
        }
    }, [user, isLoading, router, toast])

    if (isLoading || !user || user.provider === 'google') {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast({
                title: "Passwords Don't Match",
                description: "Fixed the passwords so they match.",
                variant: "destructive"
            })
            return
        }

        if (password.length < 6) {
            toast({
                title: "Invalid Password",
                description: "Password must be at least 6 characters long.",
                variant: "destructive"
            })
            return
        }

        try {
            setLoading(true)
            const result = await updatePassword(password)
            if (result && !result.error) {
                router.push('/account')
            }
        } catch (error) {
            console.error('Password change error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-lg">
                <Button variant="ghost" asChild className="mb-6 hover:bg-white rounded-xl gap-2">
                    <Link href="/account">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Account
                    </Link>
                </Button>

                <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-white border-b border-gray-50 p-8 text-center">
                        <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                            <Lock className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Change Password</CardTitle>
                        <CardDescription>
                            Create a strong password to protect your drone fleet and mission data.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 rounded-xl border-gray-200 focus:ring-blue-500 h-11"
                                        placeholder="Min. 6 characters"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                                <div className="relative">
                                    <CheckCircle2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10 rounded-xl border-gray-200 focus:ring-blue-500 h-11"
                                        placeholder="Confirm your password"
                                        required
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all hover:scale-[1.01]"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                Update Password
                            </Button>
                        </form>

                        <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Password Requirements</h5>
                            <ul className="text-xs text-gray-500 space-y-1.5">
                                <li className="flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-blue-400"></div>
                                    Minimum 6 characters
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-blue-400"></div>
                                    Combine letters, numbers and symbols
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-blue-400"></div>
                                    Avoid using common sequences like "123456"
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
