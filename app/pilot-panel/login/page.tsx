"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
import { ClipboardList, IndianRupee, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
    Plane,
    ShieldCheck,
    Loader2,
    AlertCircle,
    ArrowRight,
    Lock,
    Award
} from "lucide-react"

export default function PilotLoginPage() {
    const router = useRouter()
    const [dgcaNumber, setDgcaNumber] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!dgcaNumber.trim()) {
            setError("Please enter your DGCA certificate number.")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const res = await fetch("/api/pilot-auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dgca_number: dgcaNumber.trim() })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Login failed. Please try again.")
                return
            }

            // Save pilot session to localStorage
            localStorage.setItem("aerohive_pilot_session", JSON.stringify(data.pilot))
            router.push("/pilot-panel/dashboard")

        } catch (err: any) {
            console.error("Login error:", err)
            setError("Network error. Please check your connection and try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <ModernHeader />

            {/* Full page gradient background */}
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">

                {/* Hero / Login Section */}
                <section className="flex-1 relative flex items-center justify-center pt-24 pb-16 overflow-hidden">
                    {/* Decorative background blobs */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl" />
                        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/30 to-purple-100/30 rounded-full blur-3xl" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-md mx-auto">

                            {/* Top badge */}
                            <div className="flex justify-center mb-8">
                                <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg">
                                    <Plane className="h-4 w-4" />
                                    Drone Pilot Portal
                                </span>
                            </div>

                            {/* Login Card */}
                            <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-xl rounded-3xl overflow-hidden">
                                {/* Card gradient top bar */}
                                <div className="h-2 bg-gradient-to-r from-blue-600 to-purple-600" />

                                <CardContent className="p-8">
                                    {/* Icon + Title */}
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-xl mb-5">
                                            <ShieldCheck className="h-10 w-10 text-white" />
                                        </div>
                                        <h1 className="text-3xl font-black text-gray-900 mb-2">Pilot Login</h1>
                                        <p className="text-gray-500 text-sm leading-relaxed">
                                            Enter your DGCA certificate number to access your pilot dashboard
                                        </p>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleLogin} className="space-y-5">
                                        {/* DGCA Input */}
                                        <div className="space-y-2">
                                            <label htmlFor="dgca-number" className="block text-sm font-semibold text-gray-700">
                                                DGCA Certificate Number
                                            </label>
                                            <div className="relative">
                                                <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <Input
                                                    id="dgca-number"
                                                    type="text"
                                                    placeholder="e.g. DGCA-2024-001234"
                                                    value={dgcaNumber}
                                                    onChange={(e) => {
                                                        setDgcaNumber(e.target.value)
                                                        if (error) setError(null)
                                                    }}
                                                    className="pl-10 h-13 text-base rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                                                    disabled={loading}
                                                    autoComplete="off"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>

                                        {/* Error Message */}
                                        {error && (
                                            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 animate-slide-in-up">
                                                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                                <p className="text-sm text-red-700 leading-relaxed">{error}</p>
                                            </div>
                                        )}

                                        {/* Login Button */}
                                        <Button
                                            id="pilot-login-btn"
                                            type="submit"
                                            disabled={loading || !dgcaNumber.trim()}
                                            className="w-full h-13 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                    Verifying...
                                                </>
                                            ) : (
                                                <>
                                                    Access Dashboard
                                                    <ArrowRight className="h-5 w-5 ml-2" />
                                                </>
                                            )}
                                        </Button>
                                    </form>

                                    {/* Security note */}
                                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                                        <Lock className="h-3.5 w-3.5" />
                                        <span>Your DGCA number is used as your unique identifier. Keep it confidential.</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Links below card */}
                            <div className="mt-6 text-center space-y-3">
                                <p className="text-sm text-gray-500">
                                    Not registered yet?{" "}
                                    <Link
                                        href="/drone-pilots/register"
                                        className="font-semibold text-blue-600 hover:text-purple-600 transition-colors"
                                    >
                                        Register as a Pilot →
                                    </Link>
                                </p>
                                <p className="text-sm text-gray-500">
                                    <Link
                                        href="/drone-pilots"
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        ← Back to Pilot Directory
                                    </Link>
                                </p>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Feature hints */}
                <section className="pb-16">
                    <div className="container mx-auto px-4">
                        <div className="max-w-md mx-auto grid grid-cols-3 gap-4">
                            {[
                                { icon: <ClipboardList className="h-5 w-5 text-blue-600" />, label: "View Bookings", desc: "See all your client bookings" },
                                { icon: <IndianRupee className="h-5 w-5 text-green-600" />, label: "Track Earnings", desc: "Estimated earnings per job" },
                                { icon: <LayoutDashboard className="h-5 w-5 text-purple-600" />, label: "Dashboard", desc: "Full overview of your work" }
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="text-center p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm"
                                >
                                    <div className="flex justify-center mb-2">{item.icon}</div>
                                    <p className="text-xs font-semibold text-gray-700">{item.label}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

            </div>

            <ModernFooter />
        </>
    )
}
