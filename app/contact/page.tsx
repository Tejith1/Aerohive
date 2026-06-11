"use client"

import { useState, useEffect } from "react"
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, HeadphonesIcon, Globe, AlertCircle, User, FileText, Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
import { toast } from "@/hooks/use-toast"
import { getCustomerReviews, createCustomerReview, type CustomerReview } from "@/lib/supabase"
import { FAQSection } from "@/components/layout/faq-section"

const contactFAQs = [
  {
    question: "How fast can I expect a response?",
    answer: "Our standard response time is under 2 hours during business hours. For emergency technical support, we respond within minutes."
  },
  {
    question: "Do you offer on-site technical support?",
    answer: "Yes, for corporate clients and major projects, we provide on-site technical assistance and pilot training."
  },
  {
    question: "How do I claim my drone warranty?",
    answer: "You can initiate a warranty claim by contacting our 'Warranty & Returns' department through the contact form or by calling our support line."
  }
]

const contactInfo = [
  {
    icon: Mail,
    title: "Email Support",
    details: ["support@aerohive.co.in", "aerohive.help@gmail.com"],
    description: "Get detailed responses within 2 hours",
    color: "text-blue-600 dark:text-[#e65737]",
    bgColor: "bg-blue-600/10 dark:bg-[#e65737]/10"
  },
  {
    icon: Phone,
    title: "Phone Support",
    details: ["+91 7075894588", "+91 9014369289"],
    description: "24/7 technical support available",
    color: "text-blue-600 dark:text-[#e65737]",
    bgColor: "bg-blue-600/10 dark:bg-[#e65737]/10"
  },
  {
    icon: MapPin,
    title: "Headquarters",
    details: ["HYDERABAD, TELANGANA, INDIA", "Pincode: 500090"],
    description: "Visit our innovation center",
    color: "text-blue-600 dark:text-[#e65737]",
    bgColor: "bg-blue-600/10 dark:bg-[#e65737]/10"
  },
  {
    icon: Clock,
    title: "Business Hours",
    details: ["Mon-Fri: 6AM - 10PM PST", "Sat-Sun: 8AM - 6PM PST"],
    description: "Extended hours for global support",
    color: "text-blue-600 dark:text-[#e65737]",
    bgColor: "bg-blue-600/10 dark:bg-[#e65737]/10"
  }
]

const supportChannels = [
  {
    icon: HeadphonesIcon,
    title: "Phone Support",
    description: "Speak directly with our technical experts",
    response: "< 2 minutes",
    availability: "24/7",
    color: "text-blue-600 dark:text-[#e65737]"
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Detailed technical assistance via email",
    response: "< 2 hours",
    availability: "24/7",
    color: "text-blue-600 dark:text-[#e65737]"
  },
  {
    icon: FileText,
    title: "Support Portal",
    description: "Access documentation, tutorials, and FAQs",
    response: "Instant",
    availability: "24/7",
    color: "text-blue-600 dark:text-[#e65737]"
  }
]

const departments = [
  { value: "sales", label: "Sales & Product Inquiries", icon: "💼" },
  { value: "technical", label: "Technical Support", icon: "🔧" },
  { value: "warranty", label: "Warranty & Returns", icon: "🛡️" },
  { value: "partnership", label: "Business Partnerships", icon: "🤝" },
  { value: "media", label: "Media & Press", icon: "📸" },
  { value: "careers", label: "Careers & HR", icon: "👥" },
  { value: "feedback", label: "General Feedback", icon: "💬" }
]

const priorities = [
  { value: "low", label: "General Inquiry", color: "text-green-600" },
  { value: "medium", label: "Product Support", color: "text-yellow-600" },
  { value: "high", label: "Technical Issue", color: "text-blue-600 dark:text-orange-500" },
  { value: "urgent", label: "Critical/Emergency", color: "text-[#e65737]" }
]

const defaultReviews = [
  {
    id: "default-1",
    reviewer_name: "Priya Reddy",
    reviewer_role: "Professional Photographer",
    rating: 5,
    comment: "AeroHive's customer support is exceptional. They helped me customize the perfect drone for aerial photography.",
    reviewer_location: "Hyderabad, Telangana",
    created_at: new Date().toISOString()
  },
  {
    id: "default-2",
    reviewer_name: "Rajesh Rao",
    reviewer_role: "Agricultural Manager",
    rating: 5,
    comment: "Outstanding technical support and quick response times. The team really knows their products inside and out.",
    reviewer_location: "Warangal, Telangana",
    created_at: new Date().toISOString()
  },
  {
    id: "default-3",
    reviewer_name: "Sneha Gupta",
    reviewer_role: "Search & Rescue Coordinator",
    rating: 5,
    comment: "When we had an emergency equipment failure, AeroHive's 24/7 support got us back in the air within hours.",
    reviewer_location: "Karimnagar, Telangana",
    created_at: new Date().toISOString()
  }
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    department: "",
    priority: "",
    subject: "",
    message: "",
    newsletter: false,
    updates: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Review system state
  const [reviews, setReviews] = useState<CustomerReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewFormData, setReviewFormData] = useState({
    reviewer_name: "",
    reviewer_role: "",
    reviewer_location: "",
    rating: 5,
    comment: ""
  })

  // Fetch reviews on mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getCustomerReviews()
        setReviews(data)
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
      } finally {
        setReviewsLoading(false)
      }
    }
    fetchReviews()
  }, [])

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewFormData.reviewer_name || !reviewFormData.comment) {
      toast({ title: "Please fill in your name and review", variant: "destructive" })
      return
    }
    setReviewSubmitting(true)
    try {
      const newReview = await createCustomerReview(reviewFormData)
      setReviews(prev => [newReview, ...prev])
      setReviewFormData({ reviewer_name: "", reviewer_role: "", reviewer_location: "", rating: 5, comment: "" })
      setShowReviewForm(false)
      toast({ title: "✅ Review Submitted!", description: "Thank you for your feedback!" })
    } catch (error: any) {
      console.error('Review submit error:', error)
      toast({ title: "Error", description: error.message || "Failed to submit review.", variant: "destructive" })
    } finally {
      setReviewSubmitting(false)
    }
  }

  const displayedReviews = reviews.length > 0 ? reviews : defaultReviews

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setSubmitSuccess(true)
      toast({
        title: "Message Sent Successfully!",
        description: "We've received your inquiry and will respond to support@aerohive.co.in shortly.",
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        department: "",
        priority: "",
        subject: "",
        message: "",
        newsletter: false,
        updates: false
      })
    } catch (error: any) {
      console.error('Contact form error:', error)
      toast({
        title: "Error Sending Message",
        description: error.message || "Please try again or contact us directly.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <ModernHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 border-b border-border/40 overflow-hidden bg-background">
          <div className="container mx-auto px-6 max-w-7xl relative z-10 text-center">
            {/* Custom Transmission Waves & Satellite Uplink Logo */}
            <div className="flex justify-center mb-6 animate-pulse">
              <svg className="w-16 h-16 text-blue-600 dark:text-[#e65737]" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="50" cy="50" r="40" strokeDasharray="3 3" className="opacity-30" />
                <path d="M40 75h20M50 75V60M35 45a15 15 0 0 1 30 0" strokeWidth="2" />
                <path d="M50 45a10 10 0 0 1 0-20 10 10 0 0 1 0 20" strokeDasharray="2 2" />
                <path d="M50 35a20 20 0 0 1 0-40 20 20 0 0 1 0 40" strokeDasharray="4 2" />
                <circle cx="50" cy="45" r="3" className="fill-blue-600 dark:fill-[#e65737]" />
                <circle cx="50" cy="15" r="2" className="fill-blue-600 dark:fill-[#e65737] animate-ping" />
              </svg>
            </div>

            <span className="font-mono-tech text-[11px] uppercase tracking-[0.2em] text-blue-600 dark:text-[#e65737] mb-6 block">
              [ TRANSMISSION PROTOCOL / ESTABLISHED ]
            </span>
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.9] max-w-4xl mx-auto mb-6 text-foreground">
              Contact <span className="text-blue-600 dark:text-[#e65737]">Support</span>
            </h1>
            <p className="font-mono-tech text-xs tracking-wider text-muted-foreground uppercase max-w-xl mx-auto mb-10">
              Get in touch with our specialized drone operators. Direct uplink. Response SLA under 2 hours.
            </p>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border border-border/40 p-1 bg-card/50 backdrop-blur-sm rounded-xl">
              {[
                { label: "UPLINK AVAILABILITY", value: "24/7" },
                { label: "STANDARD RESPONSE", value: "< 2 HRS" },
                { label: "SUPPORTED LANGUAGES", value: "15" },
                { label: "CUSTOMER SATISFACTION", value: "98%" }
              ].map((stat, idx) => (
                <div key={idx} className="p-4 border border-border/30 rounded-lg bg-background text-center">
                  <div className="font-display text-xl font-black text-foreground">{stat.value}</div>
                  <div className="font-mono-tech text-[9px] uppercase tracking-wider text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Contact Info grid */}
        <section className="py-12 border-b border-border/40 bg-card/25">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="p-6 border border-border/40 bg-card/65 rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-blue-600/15 dark:bg-[#e65737]/15 flex items-center justify-center mb-4">
                      <info.icon className="h-5 w-5 text-blue-600 dark:text-[#e65737]" />
                    </div>
                    <h3 className="font-display text-sm font-black text-foreground uppercase mb-2">{info.title}</h3>
                    <div className="space-y-1 mb-4 font-mono-tech text-xs">
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-foreground font-semibold">{detail}</p>
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs">{info.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Support Channels split */}
        <section className="py-20 bg-background border-b border-border/40">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid lg:grid-cols-12 gap-12 items-start">
              
              {/* Form Side */}
              <div className="lg:col-span-8">
                <div className="border border-border/40 rounded-xl p-8 bg-card/30 backdrop-blur-sm">
                  <h2 className="font-display text-2xl font-black text-foreground uppercase tracking-tight mb-2">
                    Send Transmission
                  </h2>
                  <p className="font-mono-tech text-[10px] uppercase tracking-wider text-muted-foreground mb-8">
                    Complete the protocol below to dispatch an automated ticket query.
                  </p>

                  {submitSuccess ? (
                    <div className="text-center py-12 border border-dashed border-[#e65737]/40 rounded-xl">
                      <User className="h-12 w-12 text-blue-600 dark:text-[#e65737] mx-auto mb-4 animate-bounce" />
                      <h3 className="font-display text-lg font-black text-foreground uppercase mb-2">Transmit Succeeded!</h3>
                      <p className="text-muted-foreground text-xs mb-6 max-w-md mx-auto">
                        Inquiry logged successfully. AeroHive dispatch agents will reach out to you within 2 hours.
                      </p>
                      <Button onClick={() => setSubmitSuccess(false)} className="bg-blue-600 dark:bg-[#e65737] hover:bg-blue-700 dark:hover:bg-[#e65737]/90 text-white rounded-full font-mono-tech text-xs uppercase tracking-wider px-6 cursor-pointer">
                        Send New Transmit
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="font-mono-tech text-[10px] uppercase tracking-wider text-muted-foreground">
                            Full Name *
                          </Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Enter operator name"
                            required
                            className="h-11 rounded-lg border-border/50 bg-background/50 focus-visible:ring-blue-500 dark:focus-visible:ring-[#e65737] focus-visible:border-blue-500 dark:focus-visible:border-[#e65737]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="font-mono-tech text-[10px] uppercase tracking-wider text-muted-foreground">
                            Email Address *
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="operator@company.com"
                            required
                            className="h-11 rounded-lg border-border/50 bg-background/50 focus-visible:ring-blue-500 dark:focus-visible:ring-[#e65737] focus-visible:border-blue-500 dark:focus-visible:border-[#e65737]"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="font-mono-tech text-[10px] uppercase tracking-wider text-muted-foreground">
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="+91 7075894588"
                            className="h-11 rounded-lg border-border/50 bg-background/50 focus-visible:ring-blue-500 dark:focus-visible:ring-[#e65737] focus-visible:border-blue-500 dark:focus-visible:border-[#e65737]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company" className="font-mono-tech text-[10px] uppercase tracking-wider text-muted-foreground">
                            Company/Organization
                          </Label>
                          <Input
                            id="company"
                            value={formData.company}
                            onChange={(e) => handleInputChange('company', e.target.value)}
                            placeholder="Enter enterprise entity"
                            className="h-11 rounded-lg border-border/50 bg-background/50 focus-visible:ring-blue-500 dark:focus-visible:ring-[#e65737] focus-visible:border-blue-500 dark:focus-visible:border-[#e65737]"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="font-mono-tech text-[10px] uppercase tracking-wider text-muted-foreground">
                            Department *
                          </Label>
                          <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                            <SelectTrigger className="h-11 rounded-lg border-border/50 bg-background/50 focus:ring-blue-500 dark:focus:ring-[#e65737] focus:border-blue-500 dark:focus:border-[#e65737]">
                              <SelectValue placeholder="Choose Department" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              {departments.map((dept) => (
                                <SelectItem key={dept.value} value={dept.value}>
                                  <span className="font-mono-tech text-xs tracking-wider uppercase">{dept.icon} {dept.label}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-mono-tech text-[10px] uppercase tracking-wider text-muted-foreground">
                            Priority level *
                          </Label>
                          <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                            <SelectTrigger className="h-11 rounded-lg border-border/50 bg-background/50 focus:ring-blue-500 dark:focus:ring-[#e65737] focus:border-blue-500 dark:focus:border-[#e65737]">
                              <SelectValue placeholder="Choose Severity" />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                              {priorities.map((prio) => (
                                <SelectItem key={prio.value} value={prio.value}>
                                  <span className={`font-mono-tech text-xs tracking-wider uppercase ${prio.color}`}>{prio.label}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject" className="font-mono-tech text-[10px] uppercase tracking-wider text-muted-foreground">
                          Subject *
                        </Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => handleInputChange('subject', e.target.value)}
                          placeholder="Transmission heading"
                          required
                          className="h-11 rounded-lg border-border/50 bg-background/50 focus-visible:ring-blue-500 dark:focus-visible:ring-[#e65737] focus-visible:border-blue-500 dark:focus-visible:border-[#e65737]"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="font-mono-tech text-[10px] uppercase tracking-wider text-muted-foreground">
                          Message Body *
                        </Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => handleInputChange('message', e.target.value)}
                          placeholder="Type details of aerial query..."
                          required
                          rows={5}
                          className="rounded-lg border-border/50 bg-background/50 focus-visible:ring-blue-500 dark:focus-visible:ring-[#e65737] focus-visible:border-blue-500 dark:focus-visible:border-[#e65737] resize-none"
                        />
                      </div>

                      <div className="space-y-3 p-4 border border-border/40 rounded-lg bg-background/30 font-mono-tech text-xs">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="newsletter"
                            checked={formData.newsletter}
                            onCheckedChange={(checked) => handleInputChange('newsletter', !!checked)}
                          />
                          <Label htmlFor="newsletter" className="text-muted-foreground uppercase text-[10px] tracking-wider cursor-pointer">
                            Subscribe to pre-release drone catalogs & telemetry firmware updates
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="updates"
                            checked={formData.updates}
                            onCheckedChange={(checked) => handleInputChange('updates', !!checked)}
                          />
                          <Label htmlFor="updates" className="text-muted-foreground uppercase text-[10px] tracking-wider cursor-pointer">
                            Receive real-time updates of this ticket via email and SMS
                          </Label>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting || !formData.name || !formData.email || !formData.department || !formData.priority || !formData.subject || !formData.message}
                        className="w-full h-12 bg-blue-600 dark:bg-[#e65737] hover:bg-blue-700 dark:hover:bg-[#e65737]/90 text-white rounded-full font-mono-tech text-xs uppercase tracking-wider cursor-pointer"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Transmitting...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send className="h-4 w-4" />
                            Transmit Protocol
                          </span>
                        )}
                      </Button>
                    </form>
                  )}
                </div>
              </div>

              {/* Side Channels */}
              <div className="lg:col-span-4 space-y-6">
                <div>
                  <h3 className="font-display text-md font-black text-foreground uppercase mb-4 tracking-tight">
                    Direct Channels
                  </h3>
                  <div className="space-y-4">
                    {supportChannels.map((channel, i) => (
                      <div key={i} className="p-5 border border-border/40 bg-card/25 rounded-xl">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-blue-600/15 dark:bg-[#e65737]/15 flex items-center justify-center">
                            <channel.icon className="h-5 w-5 text-blue-600 dark:text-[#e65737]" />
                          </div>
                          <div>
                            <h4 className="font-display text-xs font-black text-foreground uppercase mb-1">{channel.title}</h4>
                            <p className="text-muted-foreground text-xs mb-3">{channel.description}</p>
                            <div className="flex items-center gap-2 font-mono-tech text-[9px] uppercase">
                              <span className="border border-border/30 rounded px-1.5 py-0.5 bg-background text-blue-600 dark:text-[#e65737]">
                                {channel.response}
                              </span>
                              <span className="border border-border/30 rounded px-1.5 py-0.5 bg-background text-muted-foreground">
                                {channel.availability}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="p-6 border border-red-500/30 bg-red-950/10 rounded-xl space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <h3 className="font-display text-xs font-black text-red-500 uppercase tracking-tight">
                      Emergency Support Line
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    For critical system failures during active flight telemetry operations or FAA compliance issues.
                  </p>
                  <Button className="w-full bg-red-600 hover:bg-red-500 text-white rounded-full font-mono-tech text-[10px] uppercase tracking-wider py-5 cursor-pointer">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Emergency Desk
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Global Offices */}
        <section className="py-20 border-b border-border/40 bg-card/25">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16">
              <span className="font-mono-tech text-[11px] uppercase tracking-[0.2em] text-blue-600 dark:text-[#e65737] mb-4 block">
                05 / GEOLOCATION NODES
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tighter uppercase leading-none text-foreground">
                Our Offices
              </h2>
            </div>

            <div className="max-w-md mx-auto border border-border/40 p-6 rounded-xl bg-card/65">
              <span className="font-mono-tech text-[9px] uppercase tracking-wider px-2 py-0.5 border border-blue-600/30 dark:border-[#e65737]/30 text-blue-600 dark:text-[#e65737] rounded bg-background inline-block mb-4">
                GLOBAL HEADQUARTERS
              </span>
              <h3 className="font-display text-lg font-black text-foreground uppercase mb-1">Hyderabad</h3>
              <p className="text-muted-foreground text-xs mb-4">India</p>
              
              <div className="space-y-2 text-xs font-mono-tech text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-blue-600 dark:text-[#e65737] shrink-0" />
                  <span>HYDERABAD, TELANGANA, INDIA - 500090</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600 dark:text-[#e65737] shrink-0" />
                  <span>+91 7075894588</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-[#e65737] shrink-0" />
                  <span>aerohive.help@gmail.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-[#e65737] shrink-0" />
                  <span>IST (UTC +5:30)</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/30">
                <p className="font-mono-tech text-[9px] text-muted-foreground uppercase mb-2">Specialties:</p>
                <div className="flex flex-wrap gap-1.5">
                  {["R&D", "Aeronautical Design", "Aviation Systems"].map((spec, i) => (
                    <span key={i} className="font-mono-tech text-[9px] uppercase tracking-wider px-2 py-0.5 border border-border/30 rounded bg-background text-foreground">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center mb-16">
              <span className="font-mono-tech text-[11px] uppercase tracking-[0.2em] text-blue-600 dark:text-[#e65737] mb-4 block">
                06 / OPERATOR CRITIQUES
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-black tracking-tighter uppercase leading-none text-foreground mb-6">
                Customer Reviews
              </h2>
              <Button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-blue-600 dark:bg-[#e65737] hover:bg-blue-700 dark:hover:bg-[#e65737]/90 text-white rounded-full font-mono-tech text-xs uppercase tracking-wider px-6 cursor-pointer"
              >
                <Star className="h-4 w-4 mr-2" />
                {showReviewForm ? "Cancel Review" : "Write a Review"}
              </Button>
            </div>

            {/* Write Review Form */}
            {showReviewForm && (
              <div className="max-w-2xl mx-auto border border-border/40 rounded-xl p-8 bg-card/30 backdrop-blur-sm mb-16">
                <h3 className="font-display text-md font-black text-foreground uppercase mb-6 flex items-center gap-2">
                  <Star className="h-5 w-5 text-blue-600 dark:text-[#e65737]" /> Share Your Feedback
                </h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="reviewName" className="font-mono-tech text-[9px] uppercase tracking-wider text-muted-foreground">Your Name *</Label>
                      <Input
                        id="reviewName"
                        placeholder="Enter name"
                        value={reviewFormData.reviewer_name}
                        onChange={(e) => setReviewFormData(prev => ({ ...prev, reviewer_name: e.target.value }))}
                        required
                        className="h-10 border-border/50 bg-background/50 focus-visible:ring-blue-500 dark:focus-visible:ring-[#e65737] focus-visible:border-blue-500 dark:focus-visible:border-[#e65737]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="reviewRole" className="font-mono-tech text-[9px] uppercase tracking-wider text-muted-foreground">Your Role</Label>
                      <Input
                        id="reviewRole"
                        placeholder="e.g. Flight Captain"
                        value={reviewFormData.reviewer_role}
                        onChange={(e) => setReviewFormData(prev => ({ ...prev, reviewer_role: e.target.value }))}
                        className="h-10 border-border/50 bg-background/50 focus-visible:ring-blue-500 dark:focus-visible:ring-[#e65737] focus-visible:border-blue-500 dark:focus-visible:border-[#e65737]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reviewLocation" className="font-mono-tech text-[9px] uppercase tracking-wider text-muted-foreground">Location</Label>
                    <Input
                      id="reviewLocation"
                      placeholder="e.g. Hyderabad, India"
                      value={reviewFormData.reviewer_location}
                      onChange={(e) => setReviewFormData(prev => ({ ...prev, reviewer_location: e.target.value }))}
                      className="h-10 border-border/50 bg-background/50 focus-visible:ring-blue-600 dark:focus-visible:ring-[#e65737] focus-visible:border-blue-600 dark:focus-visible:border-[#e65737]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-mono-tech text-[9px] uppercase tracking-wider text-muted-foreground block">Rating *</Label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewFormData(prev => ({ ...prev, rating: star }))}
                          className="transition-transform hover:scale-110 p-0.5"
                        >
                          <Star
                            className={`h-6 w-6 transition-colors ${
                              star <= reviewFormData.rating
                                ? "text-blue-600 dark:text-[#e65737] fill-current"
                                : "text-border"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="font-mono-tech text-xs text-muted-foreground ml-2">{reviewFormData.rating}/5</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reviewComment" className="font-mono-tech text-[9px] uppercase tracking-wider text-muted-foreground">Comment *</Label>
                    <Textarea
                      id="reviewComment"
                      placeholder="Enter details of feedback..."
                      value={reviewFormData.comment}
                      onChange={(e) => setReviewFormData(prev => ({ ...prev, comment: e.target.value }))}
                      required
                      rows={4}
                      className="border-border/50 bg-background/50 focus-visible:ring-blue-500 dark:focus-visible:ring-[#e65737] focus-visible:border-blue-500 dark:focus-visible:border-[#e65737] resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="w-full h-11 bg-blue-600 dark:bg-[#e65737] hover:bg-blue-700 dark:hover:bg-[#e65737]/90 text-white rounded-full font-mono-tech text-xs uppercase tracking-wider cursor-pointer"
                  >
                    {reviewSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" /> Submit Review
                      </span>
                    )}
                  </Button>
                </form>
              </div>
            )}

            {/* Display Reviews */}
            {reviewsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-[#e65737]" />
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {displayedReviews.map((review) => (
                  <div key={review.id} className="p-6 border border-border/40 bg-card/35 rounded-xl flex flex-col justify-between hover:border-blue-600/30 dark:hover:border-[#e65737]/30 transition-colors duration-200">
                    <div>
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-blue-600 dark:text-[#e65737] fill-current" />
                        ))}
                        {[...Array(5 - review.rating)].map((_, i) => (
                          <Star key={`empty-${i}`} className="h-4 w-4 text-border" />
                        ))}
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed mb-6">"{review.comment}"</p>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-border/20">
                      <div className="w-8 h-8 rounded-full bg-blue-600/10 dark:bg-[#e65737]/10 flex items-center justify-center text-blue-600 dark:text-[#e65737]">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-display text-[10px] font-black text-foreground uppercase tracking-tight">{review.reviewer_name}</h4>
                        {review.reviewer_role && <p className="font-mono-tech text-[9px] text-blue-600 dark:text-[#e65737] uppercase tracking-wider">{review.reviewer_role}</p>}
                        {review.reviewer_location && <p className="text-muted-foreground text-[8px] font-mono-tech uppercase">{review.reviewer_location}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <FAQSection pageName="Contact Support" customFAQs={contactFAQs} />
      <ModernFooter />
    </div>
  )
}
