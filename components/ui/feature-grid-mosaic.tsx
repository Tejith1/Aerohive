"use client"

import React from "react"
import { motion } from "framer-motion"
import { Star, MapPin, Clock, ShieldCheck, Sparkles, ChevronRight } from "lucide-react"
import { Button } from "./button"
import { Badge } from "./badge"

// Render the exact custom corporate logos uploaded by the user
function CustomServiceLogo({ type }: { type: string }) {
  switch (type) {
    case "spraying":
      // Agriculture Leaf Logo (Mockup 1)
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 transform transition-transform duration-500 group-hover:scale-110" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="agri-leaf-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5CD689" />
              <stop offset="50%" stopColor="#2EAD5D" />
              <stop offset="100%" stopColor="#F8D347" />
            </linearGradient>
          </defs>
          {/* Left Leaf */}
          <path d="M22 28 C22 28 32 45 49 73 L49 53 C38 43 32 30 22 28 Z" fill="url(#agri-leaf-grad)" />
          {/* Middle Leaf */}
          <path d="M32 15 C32 15 43 25 49 42 L49 73 C42 63 38 48 32 15 Z" fill="url(#agri-leaf-grad)" />
          {/* Right Leaf */}
          <path d="M51 73 C70 54 78 35 78 18 C78 18 64 34 51 43 Z" fill="url(#agri-leaf-grad)" />
        </svg>
      )
    case "photography":
      // Photography Iris Shutter Logo (Mockup 2)
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 transform transition-transform duration-500 group-hover:scale-110" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="42" stroke="#005d9e" strokeWidth="3.5" />
          {/* Shutter Blade Groups */}
          <g stroke="#3fa9f5" strokeWidth="2.5">
            {/* Top-Right Panel (horizontal lines) */}
            <line x1="38" y1="24" x2="68" y2="24" strokeWidth="3.5" stroke="#005d9e" />
            <line x1="42" y1="29" x2="72" y2="29" />
            <line x1="46" y1="34" x2="76" y2="34" />
            <line x1="50" y1="39" x2="80" y2="39" />
            
            {/* Bottom-Right Panel (vertical lines) */}
            <line x1="76" y1="38" x2="76" y2="68" strokeWidth="3.5" stroke="#005d9e" />
            <line x1="71" y1="42" x2="71" y2="72" />
            <line x1="66" y1="46" x2="66" y2="76" />
            <line x1="61" y1="50" x2="61" y2="80" />

            {/* Bottom-Left Panel (horizontal lines) */}
            <line x1="62" y1="76" x2="32" y2="76" strokeWidth="3.5" stroke="#005d9e" />
            <line x1="58" y1="71" x2="28" y2="71" />
            <line x1="54" y1="66" x2="24" y2="66" />
            <line x1="50" y1="61" x2="20" y2="61" />

            {/* Top-Left Panel (vertical lines) */}
            <line x1="24" y1="62" x2="24" y2="32" strokeWidth="3.5" stroke="#005d9e" />
            <line x1="29" y1="58" x2="29" y2="28" />
            <line x1="34" y1="54" x2="34" y2="24" />
            <line x1="39" y1="50" x2="39" y2="20" />
          </g>
          {/* Central lens eye */}
          <circle cx="50" cy="50" r="16" fill="#005d9e" />
          <circle cx="50" cy="50" r="12" fill="#004575" />
          <circle cx="53" cy="46" r="3.5" fill="white" />
        </svg>
      )
    case "mapping":
      // Compass Surveying & Mapping Globe Logo (Mockup 3)
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 transform transition-transform duration-500 group-hover:scale-110" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer Compass Track */}
          <circle cx="50" cy="50" r="35" stroke="#111" strokeWidth="2" strokeDasharray="5 2.5" />
          <circle cx="50" cy="50" r="38" stroke="#111" strokeWidth="0.8" />
          
          {/* Globe Grid */}
          <circle cx="50" cy="50" r="23" stroke="#111" strokeWidth="2.5" />
          <path d="M27 50 H73" stroke="#111" strokeWidth="1.8" />
          <path d="M50 27 V73" stroke="#111" strokeWidth="1.8" />
          <path d="M30 38 C36 43 64 43 70 38" stroke="#111" strokeWidth="1.2" />
          <path d="M30 62 C36 57 64 57 70 62" stroke="#111" strokeWidth="1.2" />
          <path d="M38 30 C43 36 43 64 38 70" stroke="#111" strokeWidth="1.2" />
          <path d="M62 30 C57 36 57 64 62 70" stroke="#111" strokeWidth="1.2" />

          {/* Points (North, South, East, West) */}
          <polygon points="50,11 53,30 50,26" fill="#111" />
          <polygon points="50,11 47,30 50,26" fill="#666" />
          
          <polygon points="50,89 53,70 50,74" fill="#666" />
          <polygon points="50,89 47,70 50,74" fill="#111" />
          
          <polygon points="89,50 70,53 74,50" fill="#111" />
          <polygon points="89,50 70,47 74,50" fill="#666" />
          
          <polygon points="11,50 30,53 26,50" fill="#666" />
          <polygon points="11,50 30,47 26,50" fill="#111" />

          {/* Diagonals */}
          <polygon points="25,25 38,34 34,34" fill="#111" />
          <polygon points="75,25 62,34 66,34" fill="#111" />
          <polygon points="25,75 38,66 34,66" fill="#111" />
          <polygon points="75,75 62,66 66,66" fill="#111" />
        </svg>
      )
    case "surveillance":
      // Security/Surveillance Drone Eye Logo (Mockup 4)
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 transform transition-transform duration-500 group-hover:scale-110" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Drone Arms */}
          <path d="M 22 26 L 36 26 L 36 31 L 64 31 L 64 26 L 78 26" stroke="#111" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Propellers */}
          <line x1="12" y1="22" x2="32" y2="22" stroke="#111" strokeWidth="3" />
          <line x1="68" y1="22" x2="88" y2="22" stroke="#111" strokeWidth="3" />
          
          {/* Central Eye Drone Body */}
          <path d="M 24 50 C 34 34, 66 34, 76 50 C 66 66, 34 66, 24 50 Z" fill="#f0efed" stroke="#111" strokeWidth="4.5" strokeLinejoin="round" />
          <circle cx="50" cy="50" r="14.5" fill="#589cc0" stroke="#111" strokeWidth="3" />
          <circle cx="50" cy="50" r="8" fill="#111" />
          <circle cx="53" cy="47" r="3" fill="white" />
        </svg>
      )
    case "inspection":
      // Industrial Inspection Magnifier Eye Logo (Mockup 5)
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 transform transition-transform duration-500 group-hover:scale-110" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Magnifier Lens Frame */}
          <circle cx="53" cy="43" r="26" stroke="#1c5d99" strokeWidth="5.5" fill="none" />
          {/* Handle */}
          <line x1="35" y1="61" x2="17" y2="79" stroke="#1c5d99" strokeWidth="8.5" strokeLinecap="round" />
          
          {/* Central Eye inside Magnifier */}
          <path d="M 37 43 C 43 33, 63 33, 69 43 C 63 53, 43 53, 37 43 Z" fill="#0f2537" />
          <circle cx="53" cy="43" r="9.5" stroke="white" strokeWidth="2.2" fill="none" />
          <circle cx="55" cy="41" r="2" fill="white" />
        </svg>
      )
    default:
      // Delivery (Default Cargo Drone Eye hybrid)
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 transform transition-transform duration-500 group-hover:scale-110" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 22 26 L 36 26 L 36 31 L 64 31 L 64 26 L 78 26" stroke="#111" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="12" y1="22" x2="32" y2="22" stroke="#111" strokeWidth="3" />
          <line x1="68" y1="22" x2="88" y2="22" stroke="#111" strokeWidth="3" />
          <path d="M 24 50 C 34 34, 66 34, 76 50 C 66 66, 34 66, 24 50 Z" fill="#f0efed" stroke="#111" strokeWidth="4.5" strokeLinejoin="round" />
          <circle cx="50" cy="50" r="14.5" fill="#3F51B5" stroke="#111" strokeWidth="3" />
          <circle cx="50" cy="50" r="8" fill="#111" />
          <circle cx="53" cy="47" r="3" fill="white" />
        </svg>
      )
  }
}

// Custom colors for tags to match category
const categoryTagColors: Record<string, { text: string; bg: string; border: string }> = {
  mapping: { text: "text-blue-650 dark:text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  photography: { text: "text-sky-650 dark:text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  spraying: { text: "text-emerald-650 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  surveillance: { text: "text-slate-800 dark:text-zinc-350", bg: "bg-slate-500/10", border: "border-slate-500/20" },
  inspection: { text: "text-blue-750 dark:text-blue-350", bg: "bg-blue-600/10", border: "border-blue-600/20" },
  delivery: { text: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" }
}

interface FeatureGridMosaicProps {
  services: any[]
  providers: any[]
  user: any | null
  formatPrice: (service: any) => string
  handleOpenBooking: (service: any) => void
}

export function FeatureGridMosaic({
  services,
  providers,
  user,
  formatPrice,
  handleOpenBooking
}: FeatureGridMosaicProps) {
  if (!services || services.length === 0) {
    return (
      <div className="text-center py-20 bg-white/40 dark:bg-card/10 rounded-[32px] border border-dashed border-slate-200 dark:border-border">
        <p className="text-sm text-slate-500 dark:text-muted-foreground">No services found matching filters.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1240px] mx-auto px-4 py-8">
      {/* Side-by-side horizontal cards (2 columns on large screens) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {services.map((service, index) => {
          const provider = providers.find(p => p.id === service.providerId)
          const tagColor = categoryTagColors[service.serviceType] || categoryTagColors.photography

          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (index % 2) * 0.1 }}
              className="rounded-[36px] bg-white dark:bg-card border border-slate-200/60 dark:border-border p-5 md:p-6 flex flex-col md:flex-row gap-6 shadow-[0_15px_45px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] group hover:border-slate-350 dark:hover:border-border transition-all duration-300"
            >
              {/* Left Side: Graphic Panel (Matching white theme background & custom vector logo) */}
              <div className="w-full md:w-[230px] h-[280px] md:h-auto rounded-[28px] bg-slate-50/70 dark:bg-background/40 border border-slate-100 dark:border-border/60 p-5 flex flex-col justify-between shrink-0 relative overflow-hidden select-none">
                {/* Top Row */}
                <div className="flex justify-between items-center z-10">
                  <span className={`text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full border ${tagColor.bg} ${tagColor.text} ${tagColor.border}`}>
                    {service.serviceType}
                  </span>
                  <span className="text-slate-400 dark:text-muted-foreground group-hover:text-primary transition-colors duration-300">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Center Custom Logo */}
                <div className="relative flex-1 flex flex-col items-center justify-center z-10">
                  <div className="absolute w-24 h-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all duration-500 scale-125" />
                  
                  {/* Vector Logo Graphic */}
                  <CustomServiceLogo type={service.serviceType} />
                  
                  <span className="text-[9px] text-slate-450 dark:text-muted-foreground font-bold uppercase tracking-[0.25em] mt-5">
                    ✨ Operations ✨
                  </span>
                </div>

                {/* Bottom Row */}
                <div className="border-t border-slate-200/60 dark:border-border/60 pt-3 mt-1 flex justify-between items-end z-10">
                  <div>
                    <p className="text-[8px] uppercase tracking-widest text-slate-400 dark:text-muted-foreground font-bold">Standard Payload</p>
                    <p className="text-[10px] font-bold text-slate-800 dark:text-foreground truncate max-w-[120px] mt-0.5">
                      {service.equipment[0] || "Quadcopter"}
                    </p>
                  </div>
                  <div className="text-[8px] text-slate-400 dark:text-muted-foreground font-bold uppercase tracking-widest">
                    Active Fleet
                  </div>
                </div>

                {/* Subtle soft background shape */}
                <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-slate-100 dark:bg-card/20 blur-xl pointer-events-none" />
              </div>

              {/* Right Side: Details & Actions */}
              <div className="flex-1 flex flex-col justify-between text-left py-1">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-450 dark:text-muted-foreground font-bold uppercase tracking-widest">
                        {provider ? provider.companyName : "AeroHive Operator"}
                      </span>
                      {provider && (
                        provider.isVerified ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20 py-0 px-2 text-[8px] rounded-full flex items-center gap-0.5 font-bold uppercase pointer-events-none scale-95 origin-left">
                            <ShieldCheck className="w-2.5 h-2.5" /> Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-500 dark:bg-muted/40 dark:text-muted-foreground border border-slate-200/55 dark:border-border/40 py-0 px-2 text-[8px] rounded-full flex items-center gap-0.5 font-bold uppercase pointer-events-none scale-95 origin-left">
                            Not Verified
                          </Badge>
                        )
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-muted-foreground">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="font-bold">{provider ? provider.rating : "5.0"}</span>
                    </div>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug group-hover:text-primary transition-colors duration-300">
                    {service.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed line-clamp-3 md:line-clamp-4">
                    {service.description}
                  </p>
                </div>

                {/* Footer specs & Actions */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-border mt-6">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-zinc-400">
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-muted/50 px-3 py-1 rounded-full border border-slate-100 dark:border-border/40">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{service.turnaroundTime || "2-3 days"} turnaround</span>
                    </div>
                    
                    <div className="font-bold text-slate-900 dark:text-white">
                      {formatPrice(service)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      {provider && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-450 dark:text-muted-foreground truncate max-w-[160px]">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{provider.location}</span>
                        </div>
                      )}
                    </div>

                    {user && service.providerId === user.id ? (
                      <Button
                        className="bg-slate-100 dark:bg-muted text-slate-400 dark:text-muted-foreground rounded-full h-10 px-5 cursor-not-allowed border-0 font-bold text-xs"
                        disabled
                      >
                        Your Service
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleOpenBooking(service)}
                        className="bg-zinc-950 hover:bg-primary text-white dark:bg-white dark:hover:bg-primary dark:text-background dark:hover:text-white rounded-full h-10 px-6 transition-all duration-300 border-0 font-bold text-xs flex items-center gap-1.5 shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Instant Book Service
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
