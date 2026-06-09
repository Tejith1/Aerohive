"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, Camera, Zap, Shield, Star, Users, Battery, Settings, Navigation, Mail, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroSection } from "@/components/ui/hero-section"
import { ModernProductCard } from "@/components/ui/modern-product-card"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
import { FAQSection } from "@/components/layout/faq-section"
import { FeaturesGrid } from "@/components/sections/features-grid"
import { TelemetryConsole } from "@/components/sections/telemetry-console"
import { useCartStore } from "@/lib/cart-store"
import { toast } from "@/hooks/use-toast"
import { getProducts, Product } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const { addItem } = useCartStore()
  const { user, refreshUser } = useAuth()
  const searchParams = useSearchParams()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Check for OAuth callback
    const handleOAuthCallback = () => {
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')
      const code = searchParams.get('code')

      if (error) {
        console.error('❌ OAuth error:', error, errorDescription)
        toast({
          title: "Authentication Failed",
          description: errorDescription || error,
          variant: "destructive",
          duration: 5000,
        })
        window.history.replaceState({}, '', '/')
        return
      }

      if (code || localStorage.getItem('oauth_success') === 'true') {
        console.log('🎉 OAuth callback detected — waiting for Supabase to exchange code...')
        localStorage.removeItem('oauth_success')
      }
    }

    handleOAuthCallback()

    // Check for messages from registration/email confirmation
    const message = searchParams.get('message')
    const urlError = searchParams.get('error')

    if (message === 'check-email') {
      toast({
        title: "📧 Check Your Email!",
        description: "We've sent you a confirmation link. Click it to activate your account and start shopping for drones!",
        className: "border-teal-200 bg-teal-50 text-teal-900",
        duration: 15000,
      })
    } else if (message === 'email-confirmed') {
      toast({
        title: "✅ Email Confirmed!",
        description: "Your account is now active. Welcome to AeroHive! You can now log in and start shopping.",
        className: "border-[#069494]/20 bg-[#069494]/5 text-slate-900 dark:text-slate-100",
        duration: 10000,
      })
      window.history.replaceState({}, '', '/')
    } else if (urlError === 'confirmation-failed') {
      toast({
        title: "Confirmation Failed",
        description: "We couldn't confirm your email. The link may have expired. Please try registering again or contact support.",
        variant: "destructive",
        duration: 10000,
      })
      window.history.replaceState({}, '', '/')
    }

    const fetchFeaturedProducts = async (retryCount = 0) => {
      try {
        setLoading(true)
        console.log('🔄 Fetching featured products...')
        const products = await getProducts({
          featured: true,
          active: true,
          limit: 4
        })
        console.log('✅ Featured products loaded:', products.length)
        setFeaturedProducts(products)
        setError(null)
      } catch (err: any) {
        console.error('❌ Error fetching featured products:', err)

        if (retryCount < 1 && (err.message?.includes('Failed to fetch') || err.message?.includes('network'))) {
          console.log('🔄 Retrying product fetch...')
          await new Promise(resolve => setTimeout(resolve, 1500))
          return fetchFeaturedProducts(retryCount + 1)
        }

        setError('Failed to load featured products. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [searchParams, mounted])

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    if (e && e.preventDefault) {
      e.preventDefault()
    }

    if (product.stock_quantity === 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      })
      return
    }

    addItem({
      id: parseInt(product.id) || 0,
      name: product.name,
      price: product.price,
      imageUrl: product.image_url || "/placeholder.svg",
      slug: product.slug,
      stockQuantity: product.stock_quantity,
    })

    toast({
      title: "🎉 Added to Cart!",
      description: `${product.name} has been added to your cart.`,
      className: "border-[#069494]/20 bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100",
    })
  }

  if (!mounted) {
    return null
  }

  // Animation configurations
  const sectionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <ModernHeader key={user?.id || 'guest'} />

      <main className="flex-1">
        
        {/* Editorial Hero Banner */}
        <HeroSection
          title="Soar Above Limitations."
          subtitle="Enterprise Aviation."
          description="AeroHive is the award-winning unified telemetry, operations, and commerce suite designed for modern aviation operators. Plan missions, hire certified pilots, and source premium flight rigs."
          primaryButtonText="Explore the Fleet"
          primaryButtonHref="/products"
          secondaryButtonText="Learn Our Strategy"
          secondaryButtonHref="/products"
          backgroundImage="/hero-drone.jpg"
          stats={[
            { label: "Fleet Models", value: "150+" },
            { label: "Active Pilots", value: "12K+" },
            { label: "Telemetry SLA", value: "99.9%" }
          ]}
          features={[
            "Real-time Telemetry Control",
            "FAA-Part 107 Compliance",
            "Tropical Punch Architecture",
            "Full Liability Coverage"
          ]}
        />

        {/* Infinite Brand Ticker / Telemetry Marquee */}
        <div className="w-full bg-secondary border-t border-b border-border py-6 overflow-hidden relative z-10 select-none">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-15 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-15 pointer-events-none" />
          
          <div className="flex animate-marquee whitespace-nowrap gap-12 text-[10px] font-semibold tracking-[0.2em] text-muted-foreground font-mono">
            <span className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              AERO_SYS • COMPLIANCE OK
            </span>
            <span className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500" />
              DGCA_GRID_ACTIVE_UPLINK
            </span>
            <span className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              HEAVY_CARRIER_RIG_V4
            </span>
            <span className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500" />
              99.9% TELEMETRY SLA
            </span>
            <span className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              FAA-PART 107 ASSURED
            </span>
            <span className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500" />
              AUTOPILOT AVOIDANCE ACTIVE
            </span>
            <span className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              MISSION COCKPIT V2
            </span>
            
            {/* Duplicated for smooth loop */}
            <span className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              AERO_SYS • COMPLIANCE OK
            </span>
            <span className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500" />
              DGCA_GRID_ACTIVE_UPLINK
            </span>
            <span className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              HEAVY_CARRIER_RIG_V4
            </span>
            <span className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500" />
              99.9% TELEMETRY SLA
            </span>
            <span className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              FAA-PART 107 ASSURED
            </span>
            <span className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500" />
              AUTOPILOT AVOIDANCE ACTIVE
            </span>
            <span className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              MISSION COCKPIT V2
            </span>
          </div>
        </div>

        {/* Cinematic Scroll-Choreographed Project Overview Section */}
        <motion.section 
          className="py-24 bg-background relative overflow-hidden border-b border-border"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Subtle grid lines background overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#1f2937_1.2px,transparent_1.2px)] [background-size:32px_32px] opacity-25 pointer-events-none" />
          
          <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Floating Animated HUD Graphic */}
              <motion.div 
                className="lg:col-span-5 flex justify-center"
                variants={itemVariants}
              >
                <div className="relative w-full max-w-[340px] aspect-square rounded-3xl border border-primary/20 bg-card/40 backdrop-blur-lg flex items-center justify-center p-8 overflow-hidden group shadow-lg">
                  {/* Rotating outer compass ring */}
                  <div className="absolute inset-4 rounded-full border border-dashed border-primary/30 animate-[spin_40s_linear_infinite]" />
                  {/* Rotating inner tech grid */}
                  <div className="absolute inset-10 rounded-full border border-primary/10 border-t-primary/45 animate-[spin_15s_linear_infinite]" />
                  {/* Inner pulse */}
                  <div className="absolute inset-16 rounded-full bg-primary/5 flex items-center justify-center">
                    <Navigation className="h-10 w-10 text-primary animate-pulse" />
                  </div>
                  
                  {/* Ambient grid lines */}
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-primary/15" />
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-primary/15" />
                  
                  {/* Glowing light reflection */}
                  <div className="absolute -inset-x-20 top-0 h-[80px] bg-gradient-to-b from-primary/10 to-transparent blur-md pointer-events-none" />
                </div>
              </motion.div>
              
              {/* Right Column: High-Impact Typography & Text */}
              <motion.div 
                className="lg:col-span-7 space-y-6"
                variants={itemVariants}
              >
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-[0.2em] rounded-full uppercase font-mono">
                  [ Real-Time Flight Analytics ]
                </span>
                
                <h2 className="text-3xl md:text-5xl font-normal leading-[1.15] tracking-tight font-display text-foreground">
                  Live telemetry monitoring <br />
                  <span className="text-primary font-normal">built for absolute pilot coordination.</span>
                </h2>
                
                <p className="text-muted-foreground font-light text-base md:text-lg leading-relaxed max-w-xl">
                  A high-performance dashboard that synchronizes flight logs, GPS coordinate overlays, and pilot stats instantly. Enable ground teams to supervise live missions and review telemetry history dynamically.
                </p>
                
                <div className="pt-2 flex items-center gap-6">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground font-mono">0.1s</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Interaction Latency</p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground font-mono">100%</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Fluid Framerate</p>
                  </div>
                </div>
              </motion.div>
              
            </div>
          </div>
        </motion.section>

        {/* Blueprint Specifications Bento Grid */}
        <motion.section 
          className="py-20 bg-background border-b border-border relative overflow-hidden"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10">
            
            {/* Elegant Asymmetrical Title Header */}
            <div className="grid lg:grid-cols-12 gap-8 items-start mb-16">
              <motion.div className="lg:col-span-6" variants={itemVariants}>
                <span className="text-[10px] font-semibold tracking-[0.2em] text-primary uppercase mb-4 block font-mono">
                  TECHNICAL SPECIFICATION
                </span>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-normal text-foreground leading-[1.1] tracking-tight font-display">
                  Designed for quiet control, <br />
                  <span className="text-primary font-normal">engineered for absolute power.</span>
                </h2>
              </motion.div>
              <motion.div className="lg:col-span-6 lg:pt-8" variants={itemVariants}>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-sans max-w-xl font-light">
                  AeroHive integrates aerospace precision with a modern developer-grade telemetry interface. Tap into specialized hardware sensors and autonomous autopilot protocols out of the box.
                </p>
              </motion.div>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: 4K Spatial Imaging (Spans 2 columns on medium+) */}
              <motion.div 
                variants={itemVariants} 
                className="md:col-span-2 min-h-[300px] bg-card border border-border rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden group/bento"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(204,101,67,0.05),transparent_50%)] pointer-events-none" />
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
                      01 / CAPTURE
                    </span>
                    <h3 className="text-3xl font-semibold text-foreground pt-2">4K Spatial Optics</h3>
                  </div>
                  <Camera className="h-6 w-6 text-primary opacity-80 group-hover/bento:scale-110 transition-transform duration-500" />
                </div>
                
                {/* Tech target SVG overlay animation */}
                <div className="absolute right-8 bottom-8 w-32 h-32 opacity-20 pointer-events-none group-hover/bento:opacity-40 transition-opacity duration-700">
                  <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-primary/70 animate-spin-slow">
                    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" strokeDasharray="4,4" />
                    <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1" />
                    <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" />
                  </svg>
                </div>

                <p className="text-muted-foreground font-light text-sm md:text-base max-w-md leading-relaxed z-10">
                  Cinema-grade triple-axis stabilized sensors capturing raw spatial feeds. Complete telemetry synchronization embeds coordinate vectors into every video frame.
                </p>
              </motion.div>

              {/* Card 2: Autopilot Control (Spans 1 column) */}
              <motion.div 
                variants={itemVariants} 
                className="min-h-[300px] bg-card border border-border rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden group/bento"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(204,101,67,0.05),transparent_50%)] pointer-events-none" />
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
                      02 / PILOT
                    </span>
                    <h3 className="text-2xl font-semibold text-foreground pt-2">Autopilot Mode</h3>
                  </div>
                  <Navigation className="h-6 w-6 text-primary opacity-80 group-hover/bento:-rotate-12 transition-transform" />
                </div>
                
                {/* Dotted path SVG animation */}
                <div className="w-full h-16 my-4 relative">
                  <svg viewBox="0 0 200 60" className="w-full h-full text-primary/30">
                    <path d="M 10 50 Q 80 -10, 120 40 T 190 20" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
                    <circle cx="10" cy="50" r="4" fill="currentColor" />
                    <circle cx="120" cy="40" r="4" fill="currentColor" className="animate-ping" style={{ animationDuration: '3s' }} />
                    <circle cx="190" cy="20" r="4" fill="currentColor" />
                  </svg>
                </div>

                <p className="text-muted-foreground font-light text-sm leading-relaxed">
                  Autonomous waypoint guidance, collision boundaries mapping, and hardware-level return-to-base routing.
                </p>
              </motion.div>

              {/* Card 3: Safety Guard (Spans 1 column) */}
              <motion.div 
                variants={itemVariants} 
                className="min-h-[300px] bg-card border border-border rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden group/bento"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.05),transparent_50%)] pointer-events-none" />
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-emerald-600 dark:text-emerald-500 uppercase bg-emerald-500/10 px-3 py-1 rounded-full">
                      03 / SAFETY
                    </span>
                    <h3 className="text-2xl font-semibold text-foreground pt-2">Failsafe Systems</h3>
                  </div>
                  <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-500 opacity-80 group-hover/bento:scale-95 transition-transform" />
                </div>
                
                {/* Tech diagnostic checklist */}
                <div className="font-mono text-[10px] text-muted-foreground space-y-1.5 my-2">
                  <div className="flex items-center justify-between border-b border-border pb-1">
                    <span>GPS LOCK</span>
                    <span className="text-emerald-600 dark:text-emerald-500 font-bold">100% OK</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-1">
                    <span>IMU CALIBRATE</span>
                    <span className="text-emerald-600 dark:text-emerald-500 font-bold">NOMINAL</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>FAILSAFE POWER</span>
                    <span className="text-emerald-600 dark:text-emerald-500 font-bold">READY</span>
                  </div>
                </div>

                <p className="text-muted-foreground font-light text-sm leading-relaxed">
                  Redundant hardware failsafes, backup receiver uplinks, and immediate low-voltage descent protocols.
                </p>
              </motion.div>

              {/* Card 4: Battery Reserve (Spans 2 columns on medium+) */}
              <motion.div 
                variants={itemVariants} 
                className="md:col-span-2 min-h-[300px] bg-card border border-border rounded-2xl p-8 flex flex-col justify-between relative overflow-hidden group/bento"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_120%,rgba(217,119,6,0.05),transparent_50%)] pointer-events-none" />
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-amber-600 dark:text-amber-500 uppercase bg-amber-500/10 px-3 py-1 rounded-full">
                      04 / POWER
                    </span>
                    <h3 className="text-3xl font-semibold text-foreground pt-2">Solid State Cells</h3>
                  </div>
                  <Battery className="h-6 w-6 text-amber-600 dark:text-amber-500 opacity-80 group-hover/bento:translate-x-0.5 transition-transform" />
                </div>
                
                {/* Glowing battery power meter widget */}
                <div className="w-full max-w-md my-4 p-4 border border-border rounded-2xl bg-background relative">
                  <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-2">
                    <span>CELL VOLTAGE: 16.8V</span>
                    <span className="text-emerald-600 dark:text-emerald-500 font-bold">CHARGE: 98%</span>
                  </div>
                  <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-primary via-amber-500 to-emerald-500 h-full w-[98%] rounded-full" />
                  </div>
                </div>

                <p className="text-muted-foreground font-light text-sm md:text-base max-w-md leading-relaxed">
                  High-density lithium-solid power packs keeping you airborne for twice the commercial flight duration. Hot-swap architecture minimizes takeoff intervals.
                </p>
              </motion.div>

            </div>

          </div>
        </motion.section>

        {/* Dynamic Telemetry Rig Showcase */}
        <motion.section 
          className="py-16 bg-background text-foreground"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
            
            {/* Header */}
            <div className="grid lg:grid-cols-12 gap-8 items-start mb-12">
              <motion.div className="lg:col-span-5" variants={itemVariants}>
                <span className="text-[10px] font-semibold tracking-[0.2em] text-primary uppercase mb-4 block">
                  HARDWARE HUB
                </span>
                <h2 className="text-3xl md:text-5xl font-normal text-foreground leading-[1.1] tracking-tight font-display">
                  The Flight Fleet. <br />
                  <span className="text-primary font-normal">Bespoke flight rigs.</span>
                </h2>
              </motion.div>
              <motion.div className="lg:col-span-7 lg:pt-8" variants={itemVariants}>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl font-sans font-light">
                  Source professional hardware carefully designed, tuned, and pre-authorized for high-stakes mission profiles.
                </p>
              </motion.div>
            </div>

            {/* Catalog Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse flex flex-col space-y-4">
                    <div className="aspect-square bg-muted rounded-none border border-border"></div>
                    <div className="h-4 bg-muted w-2/3"></div>
                    <div className="h-4 bg-muted w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20 border border-border mb-12">
                <p className="text-primary text-sm font-semibold tracking-wider uppercase mb-6">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-foreground hover:bg-primary text-background rounded-full tracking-wider text-xs px-8 py-4 cursor-pointer border-0"
                >
                  Reload Rig Catalog
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {featuredProducts.map((product) => (
                  <ModernProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    comparePrice={product.compare_price || undefined}
                    imageUrl={product.image_url || "/placeholder.svg"}
                    slug={product.slug}
                    rating={product.average_rating || 0}
                    reviewCount={12}
                    isNew={product.is_featured}
                    isFeatured={!product.compare_price && product.is_featured}
                    isOnSale={!!product.compare_price}
                    stockQuantity={product.stock_quantity}
                    onAddToCart={() => handleAddToCart({} as React.MouseEvent, product)}
                  />
                ))}
              </div>
            )}

            <motion.div className="text-center" variants={itemVariants}>
              <Link 
                href="/products"
                className="group inline-flex items-center space-x-2.5 text-xs font-semibold tracking-[0.2em] text-primary uppercase hover:opacity-85"
              >
                <span>View Full Flight Fleet</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

          </div>
        </motion.section>

        {/* Complete Aerial Solutions - Editorial Table Grid */}
        <motion.section 
          className="py-16 bg-background border-t border-border"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10">
            
            {/* Header */}
            <div className="grid lg:grid-cols-12 gap-8 items-start mb-12">
              <motion.div className="lg:col-span-5" variants={itemVariants}>
                <span className="text-[10px] font-semibold tracking-[0.2em] text-primary uppercase mb-4 block">
                  CAPABILITY MATRIX
                </span>
                <h2 className="text-3xl md:text-5xl font-normal text-foreground leading-[1.1] tracking-tight font-display">
                  Aerial Operations. <br />
                  <span className="text-primary font-normal">Unified services.</span>
                </h2>
              </motion.div>
              <motion.div className="lg:col-span-7 lg:pt-8" variants={itemVariants}>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl font-sans font-light">
                  We supply everything from certified drone pilots to customized maintenance engineering, flight compliance, and syllabus training.
                </p>
              </motion.div>
            </div>

            {/* Asymmetrical Typography Table Grid */}
            <div className="border-t border-border divide-y divide-border">
              
              {/* Row A */}
              <div className="py-8 grid md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-1 text-muted-foreground/60 text-xs font-bold font-mono">[A]</div>
                <div className="md:col-span-4">
                  <h3 className="text-2xl font-medium text-foreground">Drone-as-a-Service</h3>
                </div>
                <div className="md:col-span-5 text-sm md:text-base text-muted-foreground font-light leading-relaxed">
                  Deploy precision surveying, thermal industrial grid inspections, and expert multi-spectral aerial mapping on-demand.
                </div>
                <div className="md:col-span-2 text-left md:text-right">
                  <Link href="/drone-services" className="inline-flex items-center space-x-2 text-[10px] font-semibold tracking-wider text-primary uppercase hover:opacity-85">
                    <span>Deploy</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Row B */}
              <div className="py-8 grid md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-1 text-muted-foreground/60 text-xs font-bold font-mono">[B]</div>
                <div className="md:col-span-4">
                  <h3 className="text-2xl font-medium text-foreground">Maintenance & Repair</h3>
                </div>
                <div className="md:col-span-5 text-sm md:text-base text-muted-foreground font-light leading-relaxed">
                  Keep your high-tech fleet operating at absolute peak reliability with custom-certified bench repairs and diagnostic audits.
                </div>
                <div className="md:col-span-2 text-left md:text-right">
                  <Link href="/repair-services" className="inline-flex items-center space-x-2 text-[10px] font-semibold tracking-wider text-primary uppercase hover:opacity-85">
                    <span>Schedule</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Row C */}
              <div className="py-8 grid md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-1 text-muted-foreground/60 text-xs font-bold font-mono">[C]</div>
                <div className="md:col-span-4">
                  <h3 className="text-2xl font-medium text-foreground">Pilot Certification</h3>
                </div>
                <div className="md:col-span-5 text-sm md:text-base text-muted-foreground font-light leading-relaxed">
                  Become FAA Part 107 ready. Accelerate your internal aviation programs with comprehensive syllabus guidance.
                </div>
                <div className="md:col-span-2 text-left md:text-right">
                  <Link href="/training" className="inline-flex items-center space-x-2 text-[10px] font-semibold tracking-wider text-primary uppercase hover:opacity-85">
                    <span>Enroll</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

            </div>

          </div>
        </motion.section>

        {/* Interactive Autonomous Planner & Features Grid */}
        <TelemetryConsole />
        <FeaturesGrid />
      </main>

      <FAQSection pageName="the Homepage" />
      <ModernFooter showNewsletter={true} />
    </div>
  )
}

