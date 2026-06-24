"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, UserPlus, Plane, ArrowRight, Shield, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser, signInWithGoogle } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    subscribeNewsletter: false,
  })

  // Get redirect param from URL
  let redirectUrl = "/"
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect')
    if (redirect) redirectUrl = redirect
  }

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle()
      // Supabase will handle the redirect
    } catch (error) {
      console.error('Google sign-up failed:', error)
      toast({
        title: "Sign-up Failed",
        description: "Failed to sign up with Google. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive"
      })
      return
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Error", 
        description: "Please agree to the terms and conditions",
        variant: "destructive"
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      console.log('🔵 Starting registration process...')
      console.log('📧 Email:', formData.email)
      console.log('👤 Name:', formData.firstName, formData.lastName)
      console.log('🌐 Browser online:', navigator.onLine)
      console.log('🔗 Current origin:', window.location.origin)
      
      await registerUser(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.phone
      )
      console.log('✅ Registration completed successfully!')
      // The register function handles redirection and toast messages
    } catch (error: any) {
      console.error('❌ Registration failed in form handler')
      console.error('Error type:', typeof error)
      console.error('Error name:', error?.name)
      console.error('Error message:', error?.message)
      console.error('Error stack:', error?.stack)
      console.error('Full error:', error)
      
      // Check if it's actually a network/fetch error (not an auth error)
      const isNetworkError = 
        error?.name === 'TypeError' || 
        error?.message?.toLowerCase().includes('fetch') ||
        error?.message?.toLowerCase().includes('network') ||
        !error?.message
      
      if (isNetworkError) {
        console.error('🔴 Detected network error - Supabase may be unreachable')
        toast({
          title: "Connection Failed",
          description: "Unable to reach authentication server. Please check your internet connection or try again in a moment.",
          variant: "destructive"
        })
      }
      // Otherwise, auth context already handled the error toast
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#191919] relative overflow-hidden flex flex-col lg:flex-row">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.01] pointer-events-none"></div>

      {/* Top Left Logo Header */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/">
          <img
            src="/Aerohive text logo scaled up.png"
            alt="AeroHive Logo"
            className="h-8 w-auto object-contain transition-all duration-300"
          />
        </Link>
      </div>

      {/* Left Column - Hero Header & Registration Form Card */}
      <div className="w-full lg:w-[48%] flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-24 relative z-10">
        <div className="max-w-[440px] w-full">
          {/* Main Hero Header */}
          <div className="mb-8 mt-12">
            <h1 className="text-4xl sm:text-5xl font-serif text-slate-900 font-normal leading-[1.1] tracking-tight mb-3">
              Join the grid,<br />fly sooner.
            </h1>
            <p className="text-slate-500 font-serif italic text-base">
              Deploy advanced fleet operations and track real-time airspace telemetry in seconds.
            </p>
          </div>

          {/* Minimal Card */}
          <div className="w-full bg-[#fdfcfa]/90 border border-slate-200/50 rounded-[28px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] backdrop-blur-sm">
            {/* Google Signup Button */}
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full h-11 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl text-sm font-sans font-medium transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            >
              <img 
                src="https://www.svgrepo.com/show/475656/google-color.svg" 
                alt="Google logo"
                className="w-4 h-4"
              />
              <span>Sign up with Google</span>
            </button>

            {/* Divider */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <span className="relative px-3 bg-[#fdfcfa] text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">
                or
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Input
                    id="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="h-10 bg-white border border-slate-200 focus:ring-1 focus:ring-[#069494] focus:border-[#069494] rounded-2xl text-sm font-sans px-3 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="h-10 bg-white border border-slate-200 focus:ring-1 focus:ring-[#069494] focus:border-[#069494] rounded-2xl text-sm font-sans px-3 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-10 bg-white border border-slate-200 focus:ring-1 focus:ring-[#069494] focus:border-[#069494] rounded-2xl text-sm font-sans px-3 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                  required
                />
              </div>

              <div className="space-y-1">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Phone number (optional)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-10 bg-white border border-slate-200 focus:ring-1 focus:ring-[#069494] focus:border-[#069494] rounded-2xl text-sm font-sans px-3 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                />
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-10 bg-white border border-slate-200 focus:ring-1 focus:ring-[#069494] focus:border-[#069494] rounded-2xl text-sm font-sans px-3 pr-10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-650 flex items-center justify-center p-1 rounded-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="h-10 bg-white border border-slate-200 focus:ring-1 focus:ring-[#069494] focus:border-[#069494] rounded-2xl text-sm font-sans px-3 pr-10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-650 flex items-center justify-center p-1 rounded-full"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                    className="mt-0.5 border-slate-350 focus:ring-[#069494]"
                    required
                  />
                  <Label htmlFor="terms" className="text-[10px] text-slate-550 leading-relaxed cursor-pointer font-sans">
                    I agree to the{" "}
                    <Link href="/terms" className="font-semibold text-[#069494] hover:text-[#058080]">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="font-semibold text-[#069494] hover:text-[#058080]">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-[#191919] hover:bg-black text-white font-sans text-sm font-semibold rounded-2xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center border-0"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </button>
            </form>
          </div>

          {/* Links Under Card */}
          <div className="mt-6 text-center">
            <span className="text-xs text-slate-500 font-sans">
              Already have an account?{" "}
              <Link href={`/login${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`} className="font-semibold text-[#069494] hover:underline ml-1">
                Sign in
              </Link>
            </span>
          </div>
        </div>
      </div>

      {/* Right Column - Editorial About AeroHive Narrative Block */}
      <div className="hidden lg:flex flex-1 bg-[#121620] relative flex-col justify-between p-16 overflow-hidden border-l border-slate-900 text-left">
        <div className="absolute inset-0 bg-grid-white/[0.015] pointer-events-none"></div>

        {/* Floating Glowing Accents */}
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#069494]/10 blur-[150px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#FF8243]/5 blur-[120px]"></div>

        {/* Top meta block */}
        <div className="relative z-10 w-full">
          <div className="inline-block px-3 py-1 bg-[#069494]/10 border border-[#069494]/20 rounded-full text-[10px] font-bold text-[#069494] uppercase tracking-wider font-sans">
            Enterprise Airspace Orchestration
          </div>
        </div>

        {/* Narrative & Stats block */}
        <div className="max-w-[480px] space-y-8 relative z-10 my-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-white font-normal leading-tight">
            About AeroHive
          </h2>
          <p className="text-base text-slate-400 font-light leading-relaxed font-sans">
            AeroHive is the premier enterprise aviation platform architected for advanced civilian and commercial flight operations. By unifying professional flight scheduling, real-time telemetry pipelines, certified pilot directories, and hardware-level diagnostics, we enable drone fleets worldwide to coordinate safely, comply fully with regional airspace regulators, and execute complex missions with absolute high-fidelity precision.
          </p>

          <div className="flex items-center space-x-8 pt-4 border-t border-white/5">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white font-sans">50k+</p>
              <p className="text-[10px] text-slate-500 font-bold font-sans uppercase tracking-widest">Active Pilots</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white font-sans">120k+</p>
              <p className="text-[10px] text-slate-500 font-bold font-sans uppercase tracking-widest">Missions Synced</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-white font-sans">99.9%</p>
              <p className="text-[10px] text-slate-500 font-bold font-sans uppercase tracking-widest">System Uptime</p>
            </div>
          </div>
        </div>


        {/* Bottom meta stats */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 relative z-10 w-full">
          <span>OPERATOR PLATFORM</span>
          <span>© AEROHIVE GLOBAL</span>
        </div>
      </div>
    </div>
  )
}
