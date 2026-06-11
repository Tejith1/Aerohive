"use client"

import React, { useState } from "react"
import Link from "next/link"
import { 
  ArrowRight, 
  Send,
  MessageSquare,
  BookOpen,
  Terminal,
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Linkedin,
  Plane,
  Shield,
  Award,
  Headphones,
  Mail,
  Phone,
  MapPin
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ModernFooterProps {
  showNewsletter?: boolean
}

export function ModernFooter({ showNewsletter = true }: ModernFooterProps) {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState("")
  const [query, setQuery] = useState("")

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    toast({
      title: "✈️ Registered for Telemetry News!",
      description: `We've added ${email} to our flight logs. Stay tuned!`,
    })
    setEmail("")
  }

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query) return
    toast({
      title: "🤖 Inquiry Received",
      description: `Connecting with AeroHive Dispatch for: "${query}"`,
    })
    setQuery("")
  }

  const footerLinks = {
    products: [
      { href: "/products", label: "All Drones" },
      { href: "/products?category=professional", label: "Professional Rigs" },
      { href: "/products?category=racing", label: "Racing Drones" },
      { href: "/products?category=photography", label: "Photography Drones" },
      { href: "/products?category=accessories", label: "Accessories" },
    ],
    services: [
      { href: "/drone-services", label: "Mission Dispatch" },
      { href: "/repair-services", label: "Repair & Tuning" },
      { href: "/training", label: "Flight Academy" },
      { href: "/drone-pilots", label: "Pilot Network" },
      { href: "/drone-services", label: "Enterprise Logistics" },
    ],
    company: [
      { href: "/about", label: "About AeroHive" },
      { href: "/contact", label: "Operations Center" },
      { href: "/drone-pilots/register", label: "Careers & Partners" },
      { href: "/about", label: "Our Hangar" },
      { href: "/products", label: "Hardware Catalog" },
    ],
    support: [
      { href: "/contact", label: "Ground Support" },
      { href: "/contact", label: "Shipping Rates" },
      { href: "/contact", label: "Return Logs" },
      { href: "/contact", label: "System Status" },
      { href: "/contact", label: "Warranty Coverage" },
    ],
    legal: [
      { href: "/contact", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/contact", label: "FAA Regulations" },
      { href: "/contact", label: "Insurance Liability" },
      { href: "/terms", label: "End-User License" },
    ]
  }

  const socialLinks = [
    { href: "https://facebook.com", label: "Facebook", icon: Facebook },
    { href: "https://twitter.com", label: "Twitter", icon: Twitter },
    { href: "https://instagram.com", label: "Instagram", icon: Instagram },
    { href: "https://youtube.com", label: "YouTube", icon: Youtube },
    { href: "https://linkedin.com", label: "LinkedIn", icon: Linkedin },
  ]

  return (
    <footer className="bg-[#11110f] text-slate-300 font-sans border-t border-[#1e1e1c]">
      
      {/* 1. Start Flying / Get Newsletter Header Block (Mirroring top of Image 1) */}
      {showNewsletter && (
        <div className="border-b border-[#1e1e1c] py-16 md:py-24">
          <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Heading & CTA Buttons */}
              <div className="lg:col-span-6 space-y-6">
                <h2 className="text-4xl md:text-6xl font-normal text-white tracking-tight font-display">
                  Start flying
                </h2>
                <div className="flex flex-wrap gap-4">
                  <Link 
                    href="/products" 
                    className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-950 font-semibold text-sm rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    See pricing
                  </Link>
                  <Link 
                    href="/contact" 
                    className="px-6 py-3.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white font-semibold text-sm rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    Contact sales
                  </Link>
                </div>
              </div>

              {/* Right Column: Newsletter Signup Form */}
              <div className="lg:col-span-6 space-y-4">
                <h3 className="text-xl font-normal text-white font-display">
                  Get the pilot newsletter
                </h3>
                <p className="text-sm text-slate-400 font-light max-w-lg leading-relaxed">
                  Fleet updates, compliance news, hardware spotlights, and pilot guidelines. Delivered monthly to your inbox.
                </p>

                {/* Sleek Input Block */}
                <form onSubmit={handleSubscribe} className="relative flex items-center max-w-md bg-neutral-900/60 border border-neutral-800 rounded-xl p-1.5 focus-within:border-[#cc6543] transition-colors">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm w-full pl-3 pr-12 font-sans py-2"
                  />
                  <button 
                    type="submit" 
                    className="bg-white hover:bg-slate-200 text-slate-950 h-9 w-9 rounded-lg flex items-center justify-center transition-colors absolute right-1.5 cursor-pointer border-0"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
                <p className="text-[10px] text-slate-600 font-light leading-relaxed">
                  Please provide your email address if you'd like to receive our monthly developer newsletter. You can unsubscribe at any time.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 2. Main Footer Body (Mirroring bottom of Image 1) */}
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Bottom-Left: Brand Logo, Chat Prompt Box, Action Pills (3 of 12 columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0 hover:opacity-90 transition-opacity" aria-label="AeroHive Home text">
              <img
                src="/Aerohive text logo scaled up.png"
                alt="AeroHive Logo"
                className="h-7 w-auto object-contain"
              />
            </Link>

            {/* Prompt input styled like Claude chat prompt */}
            <form onSubmit={handleQuerySubmit} className="space-y-3">
              <div className="relative flex items-center bg-neutral-900 border border-neutral-800 rounded-xl p-1 focus-within:border-[#cc6543] transition-colors">
                <input
                  type="text"
                  placeholder="How can we help your fleet today?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-transparent text-white placeholder-slate-500 focus:outline-none text-xs w-full pl-3 pr-10 py-3 font-sans"
                />
                <button 
                  type="submit" 
                  className="bg-[#cc6543] hover:bg-[#b05234] text-white h-7 w-7 rounded-lg flex items-center justify-center transition-colors absolute right-1.5 cursor-pointer border-0"
                  aria-label="Send query"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Help category chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                <Link 
                  href="/drone-pilots"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-[10px] font-medium text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Hire Pilots</span>
                </Link>
                <Link 
                  href="/training"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-[10px] font-medium text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                >
                  <BookOpen className="h-3 w-3" />
                  <span>Syllabus</span>
                </Link>
                <Link 
                  href="/products"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-[10px] font-medium text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                >
                  <Terminal className="h-3 w-3" />
                  <span>API Specs</span>
                </Link>
              </div>
            </form>

            {/* Muted trust credentials */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-[#1e1e1c]">
              <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-500">
                <Shield className="h-3.5 w-3.5 text-[#cc6543]" />
                <span>FAA Part-107 compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-500">
                <Award className="h-3.5 w-3.5 text-amber-500" />
                <span>Liability coverage insured</span>
              </div>
            </div>
          </div>

          {/* Right side link columns (8 of 12 columns, divided into 5 columns) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-5 gap-8">
            <div>
              <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Products</h4>
              <ul className="space-y-2.5 text-xs">
                {footerLinks.products.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-slate-400 hover:text-[#cc6543] transition-colors font-light">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Services</h4>
              <ul className="space-y-2.5 text-xs">
                {footerLinks.services.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-slate-400 hover:text-[#cc6543] transition-colors font-light">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Company</h4>
              <ul className="space-y-2.5 text-xs">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-slate-400 hover:text-[#cc6543] transition-colors font-light">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Support</h4>
              <ul className="space-y-2.5 text-xs">
                {footerLinks.support.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-slate-400 hover:text-[#cc6543] transition-colors font-light">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-4">Regulations</h4>
              <ul className="space-y-2.5 text-xs">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-slate-400 hover:text-[#cc6543] transition-colors font-light">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* 3. Bottom Row: Copyright, Contact & Social Links */}
        <div className="border-t border-[#1e1e1c] pt-8 mt-12 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-xs">
          
          <div className="text-center md:text-left space-y-1">
            <p className="text-slate-500 font-light">
              © {currentYear} AeroHive Drones. All rights reserved. Registered drone dealer and FAA operator network.
            </p>
            <p className="text-[10px] text-slate-600 font-light">
              HQ: Aviation District, Hyderabad, India | Telemetry Dispatch: +91 7075894588
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex items-center space-x-3.5">
            {socialLinks.map((social) => {
              const Icon = social.icon
              return (
                <Link
                  key={social.href}
                  href={social.href}
                  className="h-9 w-9 rounded-lg bg-neutral-900 hover:bg-[#cc6543] border border-neutral-800 hover:border-[#cc6543] flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 hover:scale-105 cursor-pointer"
                  aria-label={social.label}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              )
            })}
          </div>

        </div>

      </div>

    </footer>
  )
}