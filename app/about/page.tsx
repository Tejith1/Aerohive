"use client"

import { useState, useEffect, useMemo } from "react"
import { Plane, Target, Users, Globe, Award, Shield, Zap, Camera, MapPin, Wind, Star, CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
import { products } from "@/lib/products-data"
import Image from "next/image"
import { FAQSection } from "@/components/layout/faq-section"

const aboutFAQs = [
  {
    question: "How long has AeroHive been in operation?",
    answer: "AeroHive was founded in 2023 with a mission to bring advanced drone technology to everyone. In just two years, we've grown into a global leader in professional solutions."
  },
  {
    question: "Where is AeroHive based?",
    answer: "Our global headquarters is in Hyderabad, Telangana, India. We serve customers and support pilots around the world."
  },
  {
    question: "Are you hiring for new positions?",
    answer: "We're always looking for brilliant minds to join our mission. Check our careers section or use the doubt form below to inquire about openings."
  }
]

const timeline = [
  {
    year: "2023",
    title: "Foundation",
    description: "AeroHive was founded with a vision to democratize drone technology for everyone.",
    icon: Target
  },
  {
    year: "2024",
    title: "First 1000 Customers",
    description: "Reached our first major milestone with revolutionary customer service.",
    icon: Users
  },
  {
    year: "2024",
    title: "Global Expansion",
    description: "Expanded operations to 50+ countries with localized support.",
    icon: Globe
  },
  {
    year: "2025",
    title: "Innovation Leader",
    description: "Launched industry-first drone customization platform.",
    icon: Zap
  },
  {
    year: "2025",
    title: "Future Forward",
    description: "Leading the next generation of autonomous aerial solutions.",
    icon: Star
  }
]

const team = [
  {
    name: "Veerla SivaRamaKrishna",
    role: "Chief Executive Officer",
    bio: "Young engineer with good experience in aerospace technology.",
    image: "/veerla-sivaramakrishna.jpg",
    specialties: ["Aerospace Engineering", "Strategic Leadership", "Innovation"],
    linkedin: "https://www.linkedin.com/in/krishna-veerla-2010782b2/"
  },
  {
    name: "Dr. Dhulipalla Ramya Krishna",
    role: "Chief Technology Advisor",
    bio: "Doctorate in UAV precision agriculture. Pioneer in Data Science Engineering and autonomous systems analysis.",
    image: "/dr-ramya-krishna.jpg",
    specialties: ["AI/ML", "Autonomous Systems", "Computer Vision", "Image Processing"],
    linkedin: "https://www.linkedin.com/in/dr-ramya-krishna-dhulipalla-2290a828b/"
  },
  {
    name: "Meka Charan Sai Tej",
    role: "Chief Hardware & Operations",
    bio: "Pioneer in Flight Controller Design, UAV calibration, hardware validation, and telemetry testing.",
    image: "/meka-charan-sai-tej.jpg",
    specialties: ["R&D", "Patent Strategy", "Product Development"],
    linkedin: "https://www.linkedin.com/in/meka-charan-sai-tej/"
  },
  {
    name: "Daida Tejith Reddy",
    role: "Chief Software Architect & AI Lead",
    bio: "Drives scalable cloud architectures, AI/ML autonomous models, and full-stack telemetry operations.",
    image: "/daida-tejith-reddy.jpg",
    specialties: ["Software Architecture", "AI/ML", "Full-Stack Development", "Cloud Infrastructure"],
    linkedin: "https://www.linkedin.com/in/tejith-reddy-daida/"
  }
]

const values = [
  {
    icon: Shield,
    title: "Safety First",
    description: "Every drone meets the highest safety standards with comprehensive testing and certification."
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Pushing boundaries with cutting-edge technology and revolutionary design thinking."
  },
  {
    icon: Users,
    title: "Customer-Centric",
    description: "Your success is our mission. We build products that exceed expectations."
  },
  {
    icon: Globe,
    title: "Global Impact",
    description: "Making drone technology accessible worldwide while respecting local regulations."
  }
]

export default function AboutPage() {
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState(0)

  // Compute dynamic stats from product data
  const stats = useMemo(() => {
    const totalDronesDelivered = products.reduce((sum, p) => sum + p.stockQuantity, 0)
    const happyCustomers = products.reduce((sum, p) => sum + p.reviewCount, 0)
    return [
      { 
        label: "Drones Delivered", 
        value: totalDronesDelivered.toLocaleString() + "+", 
        icon: (props: any) => (
          <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {/* Custom Drone Propeller Vector */}
            <path d="M12 2v20M2 12h20" strokeLinecap="round" />
            <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.1" />
            <path d="M5 8l14 8M5 16l14-8" strokeLinecap="round" />
            <circle cx="5" cy="8" r="1.5" fill="currentColor" />
            <circle cx="19" cy="16" r="1.5" fill="currentColor" />
            <circle cx="5" cy="16" r="1.5" fill="currentColor" />
            <circle cx="19" cy="8" r="1.5" fill="currentColor" />
          </svg>
        )
      },
      { 
        label: "Countries Served", 
        value: "1", 
        icon: (props: any) => (
          <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {/* Custom Telemetry / Coordinates Radar Globe */}
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z" />
            <path d="M3 12h18" />
          </svg>
        )
      },
      { 
        label: "Happy Customers", 
        value: happyCustomers.toLocaleString() + "+", 
        icon: (props: any) => (
          <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {/* Custom Telemetry Node / User Network Grid */}
            <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M7 21v-2a4 4 0 0 1 3-3.87" />
            <circle cx="12" cy="7" r="4" />
            <circle cx="12" cy="7" r="1" fill="currentColor" />
            <path d="M12 11v6" strokeDasharray="2 2" />
            <circle cx="12" cy="17" r="1.5" fill="currentColor" />
          </svg>
        )
      },
      { 
        label: "Years of Excellence", 
        value: "2", 
        icon: (props: any) => (
          <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {/* Custom Premium Badge Logo with Wings */}
            <path d="M12 2L3 7v9c0 5.25 4.75 10 9 11 4.25-1 9-5.75 9-11V7l-9-5z" strokeLinejoin="round" />
            <path d="M8 11.5l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )
      }
    ]
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimelineIndex((prev) => (prev + 1) % timeline.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <ModernHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 border-b border-border/40 overflow-hidden bg-background">
          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="flex flex-col items-center text-center">
              {/* Custom Established Shield & Compass Logo */}
              <div className="flex justify-center mb-4 animate-pulse">
                <svg className="w-16 h-16 text-[#e65737]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M50 15c15 0 30 5 30 25 0 20-20 38-30 45-10-7-30-25-30-45 0-20 15-25 30-25z" className="fill-[#e65737]/5" />
                  <circle cx="50" cy="45" r="18" strokeDasharray="3 3" />
                  <path d="M50 32l5 13-5 5-5-5z" fill="#e65737" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M50 58l-5-13 5-5 5 5z" className="fill-background" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M50 27v3M50 60v3M32 45h3M65 45h3" />
                </svg>
              </div>

              <span className="font-mono-tech text-[11px] uppercase tracking-[0.2em] text-[#e65737] mb-6">
                [ ABOUT AERO HIVE / EST 2023 ]
              </span>

              {/* Logo / Badge integration */}
              <div className="relative mb-8 group">
                <div className="h-28 w-28 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 bg-white border border-[#e65737]/35 p-2 flex items-center justify-center">
                  <Image
                    src="/WhatsApp Image 2025-10-24 at 13.04.00_647ae0e3.jpg"
                    alt="AeroHive Logo"
                    width={112}
                    height={112}
                    priority
                    className="object-contain"
                  />
                </div>
              </div>

              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.9] max-w-5xl mb-6 text-foreground">
                We design <span className="text-[#e65737]">autonomous</span> aerial platforms.
              </h1>

              <p className="font-mono-tech text-xs tracking-wider text-muted-foreground uppercase max-w-3xl mb-12">
                Empowering the Sky, One Drone at a Time. Precision Agriculture. Emergency Response. Infrastructure Auditing.
              </p>

              {/* Stats bento layout */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full border border-border/40 p-1 bg-card/50 backdrop-blur-sm rounded-xl">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className="p-6 border border-border/30 rounded-lg flex flex-col items-center justify-center bg-background text-center transition-all hover:border-[#e65737]/40 hover:-translate-y-0.5 duration-200">
                      <IconComponent className="h-6 w-6 text-[#e65737] mb-3" />
                      <div className="font-display text-2xl font-black text-foreground mb-1">{stat.value}</div>
                      <div className="font-mono-tech text-[10px] uppercase tracking-wider text-muted-foreground">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Purpose */}
        <section className="py-20 border-b border-border/40 bg-card/20">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid lg:grid-cols-12 gap-12 items-start">
              {/* Left Title */}
              <div className="lg:col-span-5">
                <span className="font-mono-tech text-[11px] uppercase tracking-[0.2em] text-[#e65737] mb-4 block">
                  01 / TARGET & STRATEGY
                </span>
                <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tighter uppercase leading-none text-foreground">
                  Engineered <br />to win the skies.
                </h2>
                <p className="mt-6 text-muted-foreground text-sm max-w-md leading-relaxed">
                  Moving past boilerplate templates. AeroHive leverages an editorial visual framework mapping high-precision hardware to our award-winning unified aviation cockpit.
                </p>
              </div>

              {/* Right Detail Grid */}
              <div className="lg:col-span-7 grid sm:grid-cols-2 gap-8 border-t lg:border-t-0 lg:border-l border-border/40 pt-8 lg:pt-0 lg:pl-12">
                <div className="space-y-4">
                  <h3 className="font-display text-lg font-black text-foreground uppercase tracking-tight">Our Mission</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    To democratize advanced drone technology, making it accessible to professionals, businesses, and operators worldwide. We believe everyone should have tools that expand their horizons.
                  </p>
                  <div className="space-y-2 pt-2">
                    {[
                      "Advance aerial technology globally",
                      "Ensure safety & FAA compliance",
                      "Support 24/7 world-class service"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-mono-tech text-foreground">
                        <CheckCircle className="h-4 w-4 text-[#e65737]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-display text-lg font-black text-foreground uppercase tracking-tight">Our Vision</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    A world where autonomous aerial systems seamlessly integrate into daily operations, from industrial logistics to critical environmental monitoring, making systems safer and more efficient.
                  </p>
                  <div className="space-y-2 pt-2">
                    {[
                      "Zero-accident operation standards",
                      "Global drone fleet accessibility",
                      "Autonomous hardware pioneers"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-mono-tech text-foreground">
                        <CheckCircle className="h-4 w-4 text-[#e65737]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Project Context / Editorial Launch Pad */}
        <section className="py-20 border-b border-border/40 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(230,87,55,0.05),transparent_50%)] pointer-events-none" />
          <div className="container mx-auto px-6 max-w-7xl relative z-10">
            <div className="p-8 md:p-12 border border-[#e65737]/20 rounded-3xl bg-card/45 backdrop-blur-md max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 shadow-sm">
              <div className="space-y-4 flex-1">
                <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[#e65737]">
                  [ PROJECT FOCUS & SYSTEM OVERVIEW ]
                </span>
                <h3 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight text-foreground leading-tight">
                  Unified Telemetry Cockpit
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  A high-end, responsive ground-station telemetry dashboard integrated directly with autonomous drones. Our system streams flight parameters, sensor readings, and real-time path coordinates while allowing users to hire verified DGCA-certified operators dynamically.
                </p>
              </div>
              <div className="flex-shrink-0 w-24 h-24 rounded-full border border-[#e65737]/30 flex items-center justify-center bg-[#e65737]/5 animate-pulse">
                <svg className="h-10 w-10 text-[#e65737]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Company Timeline */}
        <section className="py-20 border-b border-border/40 bg-background">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16">
              <span className="font-mono-tech text-[11px] uppercase tracking-[0.2em] text-[#e65737] mb-4 block">
                02 / HISTORIC PROTOCOL
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tighter uppercase leading-none text-foreground">
                Our Timeline
              </h2>
            </div>

            <div className="relative max-w-5xl mx-auto border-l border-border/40 pl-6 space-y-12">
              {timeline.map((item, index) => {
                const Icon = item.icon
                const isActive = currentTimelineIndex === index
                return (
                  <div key={index} className="relative group">
                    {/* Timeline Node Point */}
                    <div className={`absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 bg-background transition-all duration-300 ${isActive ? 'border-[#e65737] bg-[#e65737] scale-125' : 'border-border'}`} />

                    <div className={`p-6 border border-border/40 rounded-xl bg-card/40 backdrop-blur-sm transition-all duration-300 ${isActive ? 'border-[#e65737]/45 shadow-[0_4px_20px_rgba(230,87,55,0.05)]' : ''}`}>
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="font-mono-tech text-xs font-bold text-[#e65737]">{item.year}</span>
                        <h3 className="font-display text-md font-black text-foreground uppercase">{item.title}</h3>
                        <Icon className="h-4 w-4 text-muted-foreground ml-auto" />
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 border-b border-border/40 bg-card/25">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16">
              <span className="font-mono-tech text-[11px] uppercase tracking-[0.2em] text-[#e65737] mb-4 block">
                03 / SYSTEM DESIGN LAWS
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tighter uppercase leading-none text-foreground">
                Core Principles
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((val, index) => (
                <div key={index} className="p-6 border border-border/40 bg-card/65 rounded-xl hover:border-[#e65737]/30 transition-colors duration-200">
                  <div className="w-12 h-12 rounded-lg bg-[#e65737]/10 flex items-center justify-center mb-6">
                    <val.icon className="h-6 w-6 text-[#e65737]" />
                  </div>
                  <h3 className="font-display text-sm font-black text-foreground uppercase mb-2">{val.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{val.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership Crew */}
        <section className="py-20 border-b border-border/40 bg-background">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16">
              <span className="font-mono-tech text-[11px] uppercase tracking-[0.2em] text-[#e65737] mb-4 block">
                04 / COMMAND TEAM
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tighter uppercase leading-none text-foreground">
                Meet the Crew
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <a key={index} href={member.linkedin} target="_blank" rel="noopener noreferrer" className="block h-full group">
                  <div className="h-full border border-border/40 rounded-xl overflow-hidden bg-card/30 backdrop-blur-sm hover:border-[#e65737]/40 hover:shadow-lg transition-all duration-300 flex flex-col">
                    <div className="relative aspect-square w-full bg-slate-900 overflow-hidden">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-display text-sm font-black text-foreground uppercase mb-1 tracking-tight">{member.name}</h3>
                      <p className="font-mono-tech text-[10px] text-[#e65737] uppercase tracking-wider mb-4">{member.role}</p>
                      <p className="text-muted-foreground text-xs leading-relaxed mb-6 flex-1">{member.bio}</p>
                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {member.specialties.map((spec, i) => (
                          <span key={i} className="font-mono-tech text-[9px] uppercase tracking-wider px-2 py-0.5 border border-border/30 rounded bg-background">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Contributors Section */}
            <div className="mt-20 pt-16 border-t border-border/40">
              <div className="text-center mb-12">
                <span className="font-mono-tech text-[10px] uppercase tracking-[0.2em] text-[#e65737] mb-2 block">
                  CONTRIBUTORS
                </span>
                <h3 className="font-display text-xl font-black uppercase tracking-tight text-foreground">
                  Development Team
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full px-4">
                {[
                  {
                    name: "Chavva Akshay Kumar Reddy",
                    role: "Development",
                    initials: "CA",
                    tagline: "Core Platform Architecture",
                    bio: "Engineered the frontend system architecture, state layers, and high-fidelity client components.",
                    specialties: ["React / Next.js", "State Engine", "UI/UX Architecture"]
                  },
                  {
                    name: "Bhuvanesh Surisetti",
                    role: "Development",
                    initials: "BS",
                    tagline: "Backend & Systems Integration",
                    bio: "Led backend systems orchestration, database schema mapping, and SMS telemetry pipelines.",
                    specialties: ["Node.js", "Database Orchestration", "API Integration"]
                  }
                ].map((contributor, i) => (
                  <div 
                    key={i} 
                    className="group relative p-8 border border-border/40 rounded-2xl bg-card/20 backdrop-blur-md transition-all duration-300 hover:border-[#e65737]/50 hover:shadow-[0_12px_40px_rgba(230,87,55,0.08)] hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
                  >
                    {/* Background Accent glow */}
                    <div className="absolute -right-16 -top-16 w-32 h-32 bg-[#e65737]/5 rounded-full blur-2xl group-hover:bg-[#e65737]/10 transition-colors duration-500" />
                    
                    <div>
                      {/* Header block with Initials and Role Badge */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#e65737] to-[#cc5032] flex items-center justify-center text-white font-display text-sm font-bold shadow-lg shadow-[#e65737]/10 shrink-0">
                          {contributor.initials}
                        </div>
                        <span className="font-mono-tech text-[9px] font-bold text-[#e65737] uppercase tracking-widest px-3 py-1 bg-[#e65737]/8 border border-[#e65737]/15 rounded-full">
                          {contributor.role}
                        </span>
                      </div>

                      {/* Name & Tagline */}
                      <h4 className="font-display text-base font-black uppercase text-foreground mb-1 group-hover:text-[#e65737] transition-colors duration-200">
                        {contributor.name}
                      </h4>
                      <p className="font-mono-tech text-[10px] text-muted-foreground uppercase tracking-wider mb-4">
                        {contributor.tagline}
                      </p>
                      
                      {/* Bio text */}
                      <p className="text-muted-foreground text-xs leading-relaxed mb-6">
                        {contributor.bio}
                      </p>
                    </div>

                    {/* Tech specialties tag row */}
                    <div className="flex flex-wrap gap-1.5 pt-4 border-t border-border/30">
                      {contributor.specialties.map((tech, idx) => (
                        <span 
                          key={idx} 
                          className="font-mono-tech text-[8px] uppercase tracking-wider px-2.5 py-0.5 border border-border/30 rounded bg-background/50 text-foreground/80"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-[#0c0a09] text-white">
          <div className="container mx-auto px-6 max-w-4xl text-center space-y-8">
            <span className="font-mono-tech text-[11px] uppercase tracking-[0.2em] text-[#e65737]">
              [ LAUNCH TELEMETRY PROTOCOL ]
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-none">
              Ready to soar with AeroHive?
            </h2>
            <p className="font-mono-tech text-xs tracking-wider text-slate-400 uppercase max-w-xl mx-auto leading-relaxed">
              Explore products or connect with our specialized command operators for custom aerospace designs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="bg-[#e65737] hover:bg-[#e65737]/90 text-white rounded-full font-mono-tech text-xs uppercase tracking-wider px-8 cursor-pointer" asChild>
                <a href="/products">Explore Products</a>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-full font-mono-tech text-xs uppercase tracking-wider px-8 cursor-pointer" asChild>
                <a href="/contact">Contact Our Team</a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <FAQSection pageName="our Mission" customFAQs={aboutFAQs} />
      <ModernFooter />
    </div>
  )
}
