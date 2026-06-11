"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Shield } from "lucide-react"

interface HeroSectionProps {
  title: string
  subtitle: string
  description: string
  primaryButtonText: string
  primaryButtonHref: string
  secondaryButtonText?: string
  secondaryButtonHref?: string
  backgroundImage?: string
  stats?: {
    label: string
    value: string
  }[]
  features?: string[]
}

export function HeroSection({
  title,
  subtitle,
  description,
  primaryButtonText,
  primaryButtonHref,
  secondaryButtonText,
  secondaryButtonHref,
  backgroundImage = "/hero-drone.jpg",
  stats,
  features
}: HeroSectionProps) {
  // Balanced organic stagger animations for human-designed feel
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
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
    <section className="relative bg-background text-foreground min-h-[80vh] flex items-center pt-28 lg:pt-36 pb-16 border-b border-border overflow-hidden">
      
      {/* Structural Minimal Grid Background (inspired by architectural drawings) */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.015] pointer-events-none"></div>
      
      <div className="container mx-auto px-6 lg:px-12 relative z-10 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          
          {/* Text/Editorial side */}
          <motion.div 
            className="lg:col-span-7 space-y-10 text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Elegant minimal hairline category tag */}
            <motion.div variants={itemVariants} className="inline-flex items-center space-x-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase font-mono">
                SYSTEM COCKPIT V2
              </span>
            </motion.div>

            {/* Massive editorial high-contrast header */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-normal tracking-tight text-foreground leading-[1.1] font-display">
                {title} <br />
                <span className="text-primary font-normal">{subtitle}</span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed font-sans font-light">
                {description}
              </p>
            </motion.div>

            {/* Editorial Features Grid */}
            {features && (
              <motion.div 
                variants={itemVariants} 
                className="grid grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t border-border max-w-lg"
              >
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 text-base text-foreground">
                    <span className="h-1.5 w-1.5 bg-primary rounded-full shrink-0"></span>
                    <span className="font-sans font-light text-sm">{feature}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Premium clicking boxes */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-6 pt-4">
              <Button
                size="lg"
                className="bg-foreground hover:bg-primary text-background px-6 py-3.5 text-sm font-medium rounded-full transition-all duration-300 shadow-sm cursor-pointer border-0"
                asChild
              >
                <Link href={primaryButtonHref}>
                  {primaryButtonText}
                </Link>
              </Button>

              {secondaryButtonText && secondaryButtonHref && (
                <Link 
                  href={secondaryButtonHref}
                  className="group inline-flex items-center space-x-2 text-xs font-semibold tracking-wider text-primary uppercase hover:text-primary/80 transition-colors cursor-pointer font-mono"
                >
                  <span>{secondaryButtonText}</span>
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </motion.div>

            {/* Clean numeric highlights */}
            {stats && (
              <motion.div 
                variants={itemVariants} 
                className="grid grid-cols-3 gap-8 pt-8 border-t border-border max-w-md"
              >
                {stats.map((stat, index) => (
                  <div key={index} className="space-y-1">
                    <div className="text-3xl font-normal text-foreground tracking-tight font-mono">{stat.value}</div>
                    <div className="text-[9px] font-semibold tracking-widest text-muted-foreground uppercase font-mono">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>

          {/* Visual Showcase */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <motion.div 
              className="relative w-full max-w-[460px] aspect-[4/5] bg-card overflow-hidden border border-border rounded-3xl shadow-sm"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
            >
              <Image
                src={backgroundImage}
                alt="AeroHive Aviation System"
                fill
                priority
                className="object-cover transition-all duration-700 hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              
              {/* Floating tech panel overlay */}
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-[#141412] text-slate-100 border border-slate-800 text-left space-y-3.5 z-20 pointer-events-none shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-[9px] font-mono tracking-[0.15em] text-slate-400 uppercase">FLIGHT TELEMETRY FEED</span>
                  <span className="text-emerald-450 animate-pulse flex items-center gap-1.5 text-[8px] font-mono font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block"></span>
                    UPLINK_ACTIVE
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-1 font-mono">
                  <div>
                    <span className="text-[8px] tracking-wider text-slate-500 block uppercase">PROP_SPEED</span>
                    <span className="text-[10px] text-slate-200">14,200 RPM</span>
                  </div>
                  <div>
                    <span className="text-[8px] tracking-wider text-slate-500 block uppercase">LATENCY</span>
                    <span className="text-[10px] text-slate-200">4.2 ms</span>
                  </div>
                  <div>
                    <span className="text-[8px] tracking-wider text-slate-500 block uppercase">GNSS_UPLINK</span>
                    <span className="text-[10px] text-slate-200">18 SATELLITES</span>
                  </div>
                  <div>
                    <span className="text-[8px] tracking-wider text-slate-500 block uppercase">PAYLOAD</span>
                    <span className="text-[10px] text-slate-200">ACTIVE_THERMAL</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}