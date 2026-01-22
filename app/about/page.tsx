"use client"

import { useState, useEffect } from "react"
import { Plane, Target, Users, Globe, Award, Shield, Zap, Camera, MapPin, Wind, Clock, Star, CheckCircle, ArrowRight, Play, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
import Image from "next/image"

const stats = [
  { label: "Drones Delivered", value: "50,000+", icon: Plane },
  { label: "Countries Served", value: "75", icon: Globe },
  { label: "Happy Customers", value: "25,000+", icon: Users },
  { label: "Years of Excellence", value: "8", icon: Award }
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
    bio: "Young engineer with good expereince in aerospace technology.",
    image: "/placeholder.svg?height=400&width=400&text=Sarah+Chen+CEO",
    specialties: ["Aerospace Engineering", "Strategic Leadership", "Innovation"]
  },
  {
    name: "Dr. Dhulipalla Ramya Krishna",
    role: "Chief Technology Advisor",
    bio: "Doctorate in Applications of UAV in Precision Agriculture", Best women Researcher, pioneer in Data Science Engineering",
    image: "/placeholder.svg?height=400&width=400&text=Marcus+CTO",
    specialties: ["AI/ML", "Autonomous Systems", "Computer Vision", "Image Processing"]
  },
  {
    name: "Meka Charan Sai Tej",
    role: "Chief Hardware and Operations Officer ",
    bio: "Pioneer in Flight Controller Design & Integration, Hardware Testing, Calibration, and Validation",
    image: "/placeholder.svg?height=400&width=400&text=Emily+Innovation",
    specialties: ["R&D", "Patent Strategy", "Product Development"]
  },
  {
    name: "Daida Tejith Reddy",
    role: "Web Developer – Drone Operations Platform",
    bio: "Expertise in full-stack web development, cloud-based platforms, and API integration.",
    image: "/placeholder.svg?height=400&width=400&text=James+VP",
    specialties: ["Customer Success", "Global Operations", "Service Excellence"]
  }
]

const values = [
  {
    icon: Shield,
    title: "Safety First",
    description: "Every drone meets the highest safety standards with comprehensive testing and certification.",
    color: "text-blue-600"
  },
  {
    icon: Zap,
    title: "Innovation",
    description: "Pushing boundaries with cutting-edge technology and revolutionary design thinking.",
    color: "text-purple-600"
  },
  {
    icon: Users,
    title: "Customer-Centric",
    description: "Your success is our mission. We build products that exceed expectations.",
    color: "text-green-600"
  },
  {
    icon: Globe,
    title: "Global Impact",
    description: "Making drone technology accessible worldwide while respecting local regulations.",
    color: "text-orange-600"
  }
]

const achievements = [
  "Industry's First AI-Powered Drone Customization Platform",
  "Winner of 2024 Innovation Excellence Award",
  "Certified by FAA, EASA, and 50+ Aviation Authorities",
  "Carbon-Neutral Shipping & Manufacturing",
  "24/7 Global Customer Support in 15 Languages",
  "Over 1M Flight Hours Logged by Our Community"
]

export default function AboutPage() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimelineIndex((prev) => (prev + 1) % timeline.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <ModernHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 aviation-gradient">
            <div className="absolute inset-0 bg-black/20"></div>
            {/* Floating Animation Elements */}
            <div className="absolute top-20 left-10 animate-float">
              <Plane className="h-8 w-8 text-white/30 transform rotate-45" />
            </div>
            <div className="absolute top-40 right-20 animate-float-delayed">
              <Camera className="h-6 w-6 text-white/40" />
            </div>
            <div className="absolute bottom-32 left-32 animate-float">
              <MapPin className="h-7 w-7 text-white/35 transform -rotate-12" />
            </div>
            <div className="absolute bottom-20 right-16 animate-float-delayed">
              <Wind className="h-9 w-9 text-white/25" />
            </div>
          </div>

          <div className="relative z-10 container mx-auto px-4 text-center text-white">
            <div className="max-w-5xl mx-auto">
              {/* Main Hero Content */}
              <div className="mb-12">
                <Badge className="bg-white/20 text-white border-white/30 mb-8 px-6 py-2 text-sm font-medium">
                  🚁 Leading the Future of Aviation
                </Badge>

                {/* Brand Logo Integration */}
                <div className="flex flex-col items-center justify-center mb-8 group">
                  <div className="relative mb-4">
                    <div className="h-28 w-28 md:h-36 md:w-36 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 bg-white group-hover:scale-105 group-hover:rotate-3">
                      <img
                        src="/WhatsApp Image 2025-10-24 at 13.04.00_647ae0e3.jpg"
                        alt="AeroHive Logo"
                        className="h-full w-full object-contain p-2"
                      />
                    </div>
                    <div className="absolute -inset-4 bg-white/20 blur-3xl rounded-full -z-10 group-hover:bg-white/30 transition-all duration-500"></div>
                  </div>
                  <div className="flex items-center -mt-12 md:-mt-16">
                    <img
                      src="/Aerohive text logo scaled up.png"
                      alt="AeroHive"
                      className="w-auto object-contain transition-all duration-500 group-hover:scale-105"
                      style={{ filter: 'brightness(0) invert(1)', height: '220px' }}
                    />
                  </div>
                  <div className="-mt-16 md:-mt-20">
                    <p className="text-2xl md:text-3xl font-light text-blue-100 tracking-wider">
                      Empowering the Sky, One Drone at a Time
                    </p>
                  </div>
                </div>
                <p className="text-lg md:text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
                  We're not just selling drones – we're pioneering the future of aerial technology.
                  From precision agriculture to emergency response, our cutting-edge solutions are
                  transforming industries and saving lives across the globe.
                </p>
              </div>

              {/* Hero Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group-hover:scale-105">
                      <stat.icon className="h-8 w-8 mx-auto mb-3 text-blue-200" />
                      <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-blue-200 text-sm">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-primary hover:bg-blue-50 px-8 py-4 text-lg font-semibold">
                  <Target className="h-5 w-5 mr-2" />
                  Our Mission
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg font-semibold">
                  <Play className="h-5 w-5 mr-2" />
                  Watch Our Story
                </Button>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="bg-primary/10 text-primary mb-6 px-4 py-2">Our Purpose</Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Transforming Tomorrow's Aviation
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our mission extends far beyond selling drones. We're building an ecosystem that empowers
                innovation, enhances safety, and opens new possibilities in the sky.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Mission */}
              <div className="space-y-8">
                <div className="relative">
                  <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-primary to-blue-400 rounded-full"></div>
                  <div className="pl-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Target className="h-8 w-8 text-primary" />
                      <h3 className="text-3xl font-bold text-gray-900">Our Mission</h3>
                    </div>
                    <p className="text-lg text-gray-600 leading-relaxed mb-6">
                      To democratize advanced drone technology, making it accessible to professionals,
                      businesses, and enthusiasts worldwide. We believe everyone should have access to
                      tools that enhance their capabilities and expand their horizons.
                    </p>
                    <div className="space-y-3">
                      {[
                        "Advance aerial technology for global benefit",
                        "Ensure safety and reliability in every product",
                        "Foster innovation through collaboration",
                        "Support customers with world-class service"
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vision */}
              <div className="space-y-8">
                <div className="relative">
                  <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-purple-500 to-pink-400 rounded-full"></div>
                  <div className="pl-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Star className="h-8 w-8 text-purple-600" />
                      <h3 className="text-3xl font-bold text-gray-900">Our Vision</h3>
                    </div>
                    <p className="text-lg text-gray-600 leading-relaxed mb-6">
                      A world where autonomous aerial systems seamlessly integrate into daily life,
                      from delivery services to emergency response, environmental monitoring to
                      entertainment, creating safer and more efficient solutions for humanity.
                    </p>

                    {/* Vision Cards */}
                    <div className="space-y-4">
                      {[
                        { icon: Shield, title: "Safety Leadership", desc: "Zero-accident vision for all operations" },
                        { icon: Globe, title: "Global Accessibility", desc: "Drone technology for every community" },
                        { icon: Zap, title: "Innovation Pioneer", desc: "Leading breakthrough technologies" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                          <item.icon className="h-6 w-6 text-purple-600 mt-1" />
                          <div>
                            <h4 className="font-semibold text-gray-900">{item.title}</h4>
                            <p className="text-gray-600 text-sm">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Company Timeline */}
        <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="bg-blue-100 text-blue-700 mb-6 px-4 py-2">Our Journey</Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Eight Years of Innovation
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From a small startup to a global leader, discover the milestones that shaped our journey.
              </p>
            </div>

            <div className="relative max-w-6xl mx-auto">
              {/* Timeline Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary via-blue-400 to-purple-500 rounded-full"></div>

              <div className="space-y-16">
                {timeline.map((item, index) => (
                  <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                      <Card className={`bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${currentTimelineIndex === index ? 'ring-2 ring-primary' : ''}`}>
                        <CardContent className="p-8">
                          <div className="flex items-center gap-3 mb-4">
                            {index % 2 === 0 ? (
                              <>
                                <div>
                                  <Badge className="bg-primary text-white mb-2">{item.year}</Badge>
                                  <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
                                </div>
                                <item.icon className="h-8 w-8 text-primary" />
                              </>
                            ) : (
                              <>
                                <item.icon className="h-8 w-8 text-primary" />
                                <div>
                                  <Badge className="bg-primary text-white mb-2">{item.year}</Badge>
                                  <h3 className="text-2xl font-bold text-gray-900">{item.title}</h3>
                                </div>
                              </>
                            )}
                          </div>
                          <p className="text-gray-600 leading-relaxed">{item.description}</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Timeline Dot */}
                    <div className="absolute left-1/2 transform -translate-x-1/2">
                      <div className={`w-6 h-6 rounded-full border-4 border-white shadow-lg transition-all duration-300 ${currentTimelineIndex === index ? 'bg-primary scale-125' : 'bg-gray-300'}`}></div>
                    </div>

                    <div className="w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="bg-green-100 text-green-700 mb-6 px-4 py-2">Our Values</Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Principles That Guide Us
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                These core values shape every decision we make and every product we create.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <value.icon className={`h-8 w-8 ${value.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="py-24 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="bg-white/20 text-white border-white/30 mb-6 px-4 py-2">Leadership</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Meet Our Visionary Team
              </h2>
              <p className="text-xl text-blue-200 max-w-3xl mx-auto">
                Industry veterans and innovative thinkers driving the future of drone technology.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="group bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-6 text-center">
                    <div className="relative mb-6">
                      <div className="w-24 h-24 mx-auto rounded-full overflow-hidden ring-4 ring-white/30 group-hover:ring-white/50 transition-all duration-300">
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                    <p className="text-blue-200 font-medium mb-4">{member.role}</p>
                    <p className="text-blue-100 text-sm leading-relaxed mb-4">{member.bio}</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {member.specialties.map((specialty, i) => (
                        <Badge key={i} className="bg-white/20 text-white border-white/30 text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="bg-yellow-100 text-yellow-700 mb-6 px-4 py-2">Recognition</Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Industry-Leading Achievements
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our commitment to excellence has earned recognition from industry leaders worldwide.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <Card key={index} className="group bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <CheckCircle className="h-6 w-6 text-primary mt-1 group-hover:scale-110 transition-transform duration-300" />
                      <p className="text-gray-700 font-medium leading-relaxed">{achievement}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button size="lg" className="btn-aviation px-8 py-4 text-lg">
                <ArrowRight className="h-5 w-5 mr-2" />
                View All Certifications
              </Button>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 aviation-gradient text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <Plane className="h-16 w-16 mx-auto mb-6 animate-pulse" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Soar with AeroHive?
              </h2>
              <p className="text-xl text-blue-100 mb-12 leading-relaxed">
                Join thousands of professionals, businesses, and enthusiasts who trust AeroHive
                for their aerial technology needs. Experience the difference that innovation,
                quality, and exceptional service can make.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-primary hover:bg-blue-50 px-8 py-4 text-lg font-semibold">
                  <Plane className="h-5 w-5 mr-2" />
                  Explore Products
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg font-semibold">
                  <Users className="h-5 w-5 mr-2" />
                  Contact Our Team
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <ModernFooter />

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
