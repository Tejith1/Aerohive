"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Headphones, ArrowRight, Shield, CheckCircle, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

type LoginForm = {
  email: string
  password: string
  rememberMe: boolean
}

export default function LoginPage() {
  const router = useRouter()
  const { login, signInWithGoogle, isLoading: authLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: "",
    rememberMe: false,
  })

  // Get redirect param from URL
  let redirectUrl = "/"
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect')
    if (redirect) redirectUrl = redirect
  }

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle()
      // Supabase will handle the redirect
    } catch (error) {
      console.error('Google login failed:', error)
      toast({
        title: "Sign-in Failed",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      await login(formData.email, formData.password)
      // The login function handles redirection
    } catch (error: any) {
      // Error handling is done in the auth context
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

      {/* Left Column - Hero Header & Minimal Login Pill Card */}
      <div className="w-full lg:w-[48%] flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-24 relative z-10">
        <div className="max-w-[420px] w-full">
          {/* Main Hero Header */}
          <div className="mb-10 mt-6">
            <h1 className="text-4xl sm:text-5xl font-serif text-slate-900 font-normal leading-[1.1] tracking-tight mb-4">
              Think fast,<br />fly faster.
            </h1>
            <p className="text-slate-500 font-serif italic text-lg">
              Orchestrate your fleet, track telemetry, and manage certified pilots.
            </p>
          </div>

          {/* Minimal Login Card */}
          <div className="w-full bg-[#fdfcfa]/90 border border-slate-200/50 rounded-[28px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] backdrop-blur-sm">
            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-11 flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl text-sm font-sans font-medium transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            >
              <img 
                src="https://www.svgrepo.com/show/475656/google-color.svg" 
                alt="Google logo"
                className="w-4 h-4"
              />
              <span>Continue with Google</span>
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

            {/* Form inputs */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="h-11 bg-white border border-slate-200 focus:ring-1 focus:ring-[#069494] focus:border-[#069494] rounded-2xl text-sm font-sans px-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="h-11 bg-white border border-slate-200 focus:ring-1 focus:ring-[#069494] focus:border-[#069494] rounded-2xl text-sm font-sans px-4 pr-10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-650 flex items-center justify-center p-1 rounded-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rememberMe: !!checked }))}
                    className="rounded-md border-slate-350 focus:ring-[#069494]"
                  />
                  <Label htmlFor="remember" className="text-xs font-medium text-slate-500 font-sans cursor-pointer select-none">
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#069494] hover:text-[#058080] font-sans"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full h-11 bg-[#191919] hover:bg-black text-white font-sans text-sm font-semibold rounded-2xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center border-0"
                disabled={isLoading}
              >
                {isLoading ? "Continuing..." : "Continue with email"}
              </button>
            </form>
          </div>

          {/* Links Under Card */}
          <div className="mt-6 flex flex-col space-y-3 text-center">
            <Link
              href={`/register${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors font-medium font-sans"
            >
              Don't have an account? <span className="text-[#069494] font-semibold underline ml-1">Create one</span>
            </Link>
            <Link
              href="/admin/login"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-[#069494] transition-colors font-sans"
            >
              Admin Portal
            </Link>
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

        {/* High-Fidelity Spinning Perspective Drone Animation */}
        <div className="absolute right-12 bottom-12 w-[180px] h-[180px] bg-white/5 border border-white/10 rounded-[28px] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl p-4 backdrop-blur-md z-10">
          <div className="absolute top-3 left-4 text-[7px] font-bold text-slate-500 uppercase tracking-widest font-sans">System Monitor</div>
          
          {/* Custom Isometric SVG Drone */}
          <svg className="w-16 h-16 text-slate-200 mt-2" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Perspective Oval Guards */}
            <ellipse cx="30" cy="35" rx="16" ry="6" stroke="currentColor" strokeWidth="2.5" opacity="0.8" />
            <ellipse cx="70" cy="35" rx="16" ry="6" stroke="currentColor" strokeWidth="2.5" opacity="0.8" />
            <ellipse cx="20" cy="65" rx="20" ry="8" stroke="currentColor" strokeWidth="3" />
            <ellipse cx="80" cy="65" rx="20" ry="8" stroke="currentColor" strokeWidth="3" />

            {/* Symmetrical Diagonal Arms */}
            <path d="M50 48 L30 35" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M50 48 L70 35" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M50 48 L20 65" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M50 48 L80 65" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />

            {/* Central Drone Body (Perspective Capsule) */}
            <path d="M43 42 C43 38, 57 38, 57 42 L55 58 C55 62, 45 62, 45 58 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="46" r="3.5" fill="#FF8243" />

            {/* Embedded CSS for Propeller Spin Animations */}
            <style>{`
              @keyframes spin-prop-login-global {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              .global-login-prop {
                animation: spin-prop-login-global 0.08s linear infinite;
              }
              .global-login-prop-reverse {
                animation: spin-prop-login-global 0.06s linear infinite reverse;
              }
            `}</style>

            {/* Spinning Propellers scaled for perspective */}
            <g transform="translate(30, 35) scale(1, 0.38)">
              <g className="global-login-prop" style={{ transformOrigin: '0px 0px' }}>
                <path d="M-15 0 H15" stroke="#FF8243" strokeWidth="3" strokeLinecap="round" />
              </g>
            </g>

            <g transform="translate(70, 35) scale(1, 0.38)">
              <g className="global-login-prop-reverse" style={{ transformOrigin: '0px 0px' }}>
                <path d="M-15 0 H15" stroke="#069494" strokeWidth="3" strokeLinecap="round" />
              </g>
            </g>

            <g transform="translate(20, 65) scale(1, 0.4)">
              <g className="global-login-prop-reverse" style={{ transformOrigin: '0px 0px' }}>
                <path d="M-19 0 H19" stroke="#069494" strokeWidth="3.5" strokeLinecap="round" />
              </g>
            </g>

            <g transform="translate(80, 65) scale(1, 0.4)">
              <g className="global-login-prop" style={{ transformOrigin: '0px 0px' }}>
                <path d="M-19 0 H19" stroke="#FF8243" strokeWidth="3.5" strokeLinecap="round" />
              </g>
            </g>
          </svg>
          
          <div className="mt-2.5 text-center">
            <span className="text-[8px] font-mono text-[#069494] animate-pulse tracking-widest font-bold">ROTORS ACTIVE</span>
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
