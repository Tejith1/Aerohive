"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
  Award,
  CheckCircle2,
  SlidersHorizontal,
  TrendingUp,
  MapPin
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
          <div className="mb-10 mt-6 text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#069494]/10 border border-[#069494]/20 rounded-full text-[10px] font-bold text-[#069494] uppercase tracking-wider font-sans mb-3">
              <ShieldCheck className="h-3 w-3" /> DGCA Operator Access
            </span>
            <h1 className="text-4xl sm:text-5xl font-serif text-slate-900 font-normal leading-[1.1] tracking-tight mb-4">
              Aviator<br />Portal
            </h1>
            <p className="text-slate-505 font-serif italic text-lg">
              Manage your flight schedules, accept incoming client requests, and sync live telemetry logs.
            </p>
          </div>

          {/* Minimal Login Card */}
          <div className="w-full bg-[#fdfcfa]/90 border border-slate-200/50 rounded-[28px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] backdrop-blur-sm">
            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2 text-left">
                <label htmlFor="dgca-number" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">
                  DGCA Certificate Number
                </label>
                <div className="relative flex items-center">
                  <Award className="absolute left-3.5 h-4 w-4 text-slate-405 z-10" />
                  <Input
                    id="dgca-number"
                    type="text"
                    placeholder="e.g. DGCA-2024-001234"
                    value={dgcaNumber}
                    onChange={(e) => {
                      setDgcaNumber(e.target.value)
                      if (error) setError(null)
                    }}
                    className="h-11 bg-white border border-slate-200 focus:ring-1 focus:ring-[#069494] focus:border-[#069494] rounded-2xl text-sm font-sans px-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)] w-full"
                    disabled={loading}
                    autoComplete="off"
                    autoFocus
                    style={{ paddingLeft: '2.75rem' }}
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 animate-slide-in-up">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700 leading-relaxed font-sans">{error}</p>
                </div>
              )}

              {/* Login Button */}
              <Button
                id="pilot-login-btn"
                type="submit"
                disabled={loading || !dgcaNumber.trim()}
                className="w-full h-11 text-xs font-bold uppercase tracking-widest bg-slate-900 hover:bg-[#069494] text-white rounded-2xl shadow-lg transition-all duration-300 hover:scale-[1.02] border-0 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying Credentials...
                  </>
                ) : (
                  <>
                    Access Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Security note */}
            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-400 text-center font-sans">
              <Lock className="h-3 w-3" />
              <span>Certified authentication using cryptographically verified license logs.</span>
            </div>
          </div>

          {/* Links below card */}
          <div className="mt-8 text-center space-y-3 font-sans text-xs">
            <p className="text-slate-500 text-left">
              Not registered yet?{" "}
              <Link
                href="/drone-pilots/register"
                className="font-bold text-[#069494] hover:text-[#058080] transition-colors"
              >
                Register as a Pilot →
              </Link>
            </p>
            <p className="text-slate-500 text-left">
              <Link
                href="/drone-pilots"
                className="text-slate-400 hover:text-slate-650 transition-colors font-medium"
              >
                ← Back to Pilot Directory
              </Link>
            </p>
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
              @keyframes spin-prop-login {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
              .login-prop {
                animation: spin-prop-login 0.08s linear infinite;
              }
              .login-prop-reverse {
                animation: spin-prop-login 0.06s linear infinite reverse;
              }
            `}</style>

            {/* Spinning Propellers scaled for perspective */}
            <g transform="translate(30, 35) scale(1, 0.38)">
              <g className="login-prop" style={{ transformOrigin: '0px 0px' }}>
                <path d="M-15 0 H15" stroke="#FF8243" strokeWidth="3" strokeLinecap="round" />
              </g>
            </g>

            <g transform="translate(70, 35) scale(1, 0.38)">
              <g className="login-prop-reverse" style={{ transformOrigin: '0px 0px' }}>
                <path d="M-15 0 H15" stroke="#069494" strokeWidth="3" strokeLinecap="round" />
              </g>
            </g>

            <g transform="translate(20, 65) scale(1, 0.4)">
              <g className="login-prop-reverse" style={{ transformOrigin: '0px 0px' }}>
                <path d="M-19 0 H19" stroke="#069494" strokeWidth="3.5" strokeLinecap="round" />
              </g>
            </g>

            <g transform="translate(80, 65) scale(1, 0.4)">
              <g className="login-prop" style={{ transformOrigin: '0px 0px' }}>
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
