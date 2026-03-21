"use client"

import { useState, useEffect } from "react"
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, HeadphonesIcon, Plane, Globe, Shield, Zap, CheckCircle, AlertCircle, User, FileText, Camera, Star, ArrowRight, Loader2 } from "lucide-react"
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
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    icon: Phone,
    title: "Phone Support",
    details: ["+91 7075894588", "+91 9014369289"],
    description: "24/7 technical support available",
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    icon: MapPin,
    title: "Headquarters",
    details: ["HYDERABAD, TELANGANA, INDIA", "Pincode: 500090"],
    description: "Visit our innovation center",
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    icon: Clock,
    title: "Business Hours",
    details: ["Mon-Fri: 6AM - 10PM PST", "Sat-Sun: 8AM - 6PM PST"],
    description: "Extended hours for global support",
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  }
]

const supportChannels = [
  {
    icon: HeadphonesIcon,
    title: "Phone Support",
    description: "Speak directly with our technical experts",
    response: "< 2 minutes",
    availability: "24/7",
    color: "text-green-600"
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Detailed technical assistance via email",
    response: "< 2 hours",
    availability: "24/7",
    color: "text-purple-600"
  },
  {
    icon: FileText,
    title: "Support Portal",
    description: "Access documentation, tutorials, and FAQs",
    response: "Instant",
    availability: "24/7",
    color: "text-orange-600"
  }
]

const offices = [
  {
    city: "Hyderabad",
    country: "India",
    address: "HYDERABAD, TELANGANA, INDIA - 500090",
    phone: "+91 7075894588",
    email: "aerohive.help@gmail.com",
    type: "Global Headquarters",
    timezone: "IST",
    specialties: ["R&D", "Engineering", "Innovation"]
  },

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
  { value: "high", label: "Technical Issue", color: "text-orange-600" },
  { value: "urgent", label: "Critical/Emergency", color: "text-red-600" }
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <ModernHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 aviation-gradient text-white overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 animate-float">
              <MessageSquare className="h-8 w-8 text-white/20" />
            </div>
            <div className="absolute top-32 right-20 animate-float-delayed">
              <HeadphonesIcon className="h-6 w-6 text-white/30" />
            </div>
            <div className="absolute bottom-32 left-32 animate-float">
              <Mail className="h-7 w-7 text-white/25" />
            </div>
            <div className="absolute bottom-20 right-16 animate-float-delayed">
              <Globe className="h-9 w-9 text-white/20" />
            </div>
          </div>

          <div className="relative z-10 container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <Badge className="bg-white/20 text-white border-white/30 mb-6 px-6 py-2 text-sm font-medium">
                🌍 Global Support Network
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Contact Us
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                Get in touch with our world-class support team. We're here to help you soar.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-blue-200 text-sm">Support Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">&lt; 2hrs</div>
                  <div className="text-blue-200 text-sm">Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">15</div>
                  <div className="text-blue-200 text-sm">Languages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">98%</div>
                  <div className="text-blue-200 text-sm">Satisfaction Rate</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  <Send className="h-5 w-5 mr-2" />
                  Send Us a Message
                </Button>
                <Button size="lg" className="bg-white/20 backdrop-blur-sm border border-white/40 text-white hover:bg-white/30 px-8 py-4 text-lg font-semibold transition-all duration-300">
                  <Phone className="h-5 w-5 mr-2" />
                  Call Now: +91 7075894588
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Contact Info */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {contactInfo.map((info, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${info.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <info.icon className={`h-8 w-8 ${info.color}`} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{info.title}</h3>
                    <div className="space-y-1 mb-3">
                      {info.details.map((detail, i) => (
                        <p key={i} className="text-gray-700 font-medium">{detail}</p>
                      ))}
                    </div>
                    <p className="text-gray-500 text-sm">{info.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Support Channels */}
        <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="shadow-xl border-0">
                  <CardHeader className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-t-lg">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      <Send className="h-6 w-6" />
                      Send Us a Message
                    </CardTitle>
                    <p className="text-blue-100">
                      Fill out the form below and we'll get back to you within 2 hours.
                    </p>
                  </CardHeader>
                  <CardContent className="p-8">
                    {submitSuccess ? (
                      <div className="text-center py-12">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent Successfully!</h3>
                        <p className="text-gray-600 mb-6">
                          Thank you for contacting us. Our team will respond within 2 hours.
                        </p>
                        <Button onClick={() => setSubmitSuccess(false)} className="btn-aviation">
                          Send Another Message
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Info */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-gray-700 font-medium">
                              Full Name *
                            </Label>
                            <Input
                              id="name"
                              type="text"
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              placeholder="Enter your full name"
                              required
                              className="h-12"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700 font-medium">
                              Email Address *
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              placeholder="your.email@company.com"
                              required
                              className="h-12"
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-gray-700 font-medium">
                              Phone Number
                            </Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="+91 7075894588"
                              className="h-12"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="company" className="text-gray-700 font-medium">
                              Company/Organization
                            </Label>
                            <Input
                              id="company"
                              type="text"
                              value={formData.company}
                              onChange={(e) => handleInputChange('company', e.target.value)}
                              placeholder="Your company name"
                              className="h-12"
                            />
                          </div>
                        </div>

                        {/* Department & Priority */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Department *</Label>
                            <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select department" />
                              </SelectTrigger>
                              <SelectContent>
                                {departments.map((dept) => (
                                  <SelectItem key={dept.value} value={dept.value}>
                                    <div className="flex items-center gap-2">
                                      <span>{dept.icon}</span>
                                      <span>{dept.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-gray-700 font-medium">Priority Level *</Label>
                            <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                              <SelectContent>
                                {priorities.map((priority) => (
                                  <SelectItem key={priority.value} value={priority.value}>
                                    <span className={priority.color}>{priority.label}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Subject */}
                        <div className="space-y-2">
                          <Label htmlFor="subject" className="text-gray-700 font-medium">
                            Subject *
                          </Label>
                          <Input
                            id="subject"
                            type="text"
                            value={formData.subject}
                            onChange={(e) => handleInputChange('subject', e.target.value)}
                            placeholder="Brief description of your inquiry"
                            required
                            className="h-12"
                          />
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                          <Label htmlFor="message" className="text-gray-700 font-medium">
                            Message *
                          </Label>
                          <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('message', e.target.value)}
                            placeholder="Please provide detailed information about your inquiry..."
                            required
                            rows={6}
                            className="resize-none"
                          />
                        </div>

                        {/* Preferences */}
                        <div className="space-y-4 p-6 bg-gray-50 rounded-lg border">
                          <h4 className="font-medium text-gray-900">Communication Preferences</h4>
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="newsletter"
                                checked={formData.newsletter}
                                onCheckedChange={(checked) => handleInputChange('newsletter', !!checked)}
                              />
                              <Label htmlFor="newsletter" className="text-sm text-gray-700">
                                Subscribe to our newsletter for product updates and drone industry news
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="updates"
                                checked={formData.updates}
                                onCheckedChange={(checked) => handleInputChange('updates', !!checked)}
                              />
                              <Label htmlFor="updates" className="text-sm text-gray-700">
                                Receive updates about my inquiry via email and SMS
                              </Label>
                            </div>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                          type="submit"
                          disabled={isSubmitting || !formData.name || !formData.email || !formData.department || !formData.priority || !formData.subject || !formData.message}
                          className="w-full h-14 text-lg btn-aviation"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
                              Sending Message...
                            </>
                          ) : (
                            <>
                              <Send className="h-5 w-5 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>

                        <p className="text-xs text-gray-500 text-center">
                          By submitting this form, you agree to our Terms of Service and Privacy Policy.
                          We typically respond within 2 hours during business hours.
                        </p>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Support Channels */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Other Ways to Reach Us</h2>
                  <div className="space-y-4">
                    {supportChannels.map((channel, index) => (
                      <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <channel.icon className={`h-6 w-6 ${channel.color}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{channel.title}</h3>
                              <p className="text-gray-600 text-sm mb-3">{channel.description}</p>
                              <div className="flex items-center gap-4 text-xs">
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  {channel.response}
                                </Badge>
                                <Badge variant="outline" className="text-blue-600 border-blue-600">
                                  {channel.availability}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Emergency Contact */}
                <Card className="border-2 border-red-200 bg-red-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                      <h3 className="font-bold text-red-800">Emergency Support</h3>
                    </div>
                    <p className="text-red-700 text-sm mb-4">
                      For critical technical issues or safety concerns with your drone.
                    </p>
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Emergency Line
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Global Offices */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="bg-primary/10 text-primary mb-6 px-4 py-2">Global Presence</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Worldwide Offices</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                With offices across four continents, we provide local support with global expertise.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {offices.map((office, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <Badge className="bg-primary text-white mb-3">{office.type}</Badge>
                      <h3 className="text-xl font-bold text-gray-900">{office.city}</h3>
                      <p className="text-gray-600">{office.country}</p>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{office.address}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{office.phone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{office.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{office.timezone}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-gray-500 mb-2">Specialties:</p>
                      <div className="flex flex-wrap gap-1">
                        {office.specialties.map((specialty, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection pageName="Contact Support" customFAQs={contactFAQs} />

        {/* Customer Reviews */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
              <p className="text-gray-600 mb-6">Real feedback from our satisfied customers</p>
              <Button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Star className="h-5 w-5 mr-2" />
                {showReviewForm ? "Cancel" : "Write a Review"}
              </Button>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <Card className="max-w-2xl mx-auto mb-12 border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Share Your Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reviewName" className="font-medium">Your Name *</Label>
                        <Input
                          id="reviewName"
                          placeholder="Enter your name"
                          value={reviewFormData.reviewer_name}
                          onChange={(e) => setReviewFormData(prev => ({ ...prev, reviewer_name: e.target.value }))}
                          required
                          className="h-11 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reviewRole" className="font-medium">Your Role <span className="text-sm font-normal text-gray-500">(optional)</span></Label>
                        <Input
                          id="reviewRole"
                          placeholder="e.g., Photographer, Farmer"
                          value={reviewFormData.reviewer_role}
                          onChange={(e) => setReviewFormData(prev => ({ ...prev, reviewer_role: e.target.value }))}
                          className="h-11 rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reviewLocation" className="font-medium">Location <span className="text-sm font-normal text-gray-500">(optional)</span></Label>
                      <Input
                        id="reviewLocation"
                        placeholder="e.g., Hyderabad, Telangana"
                        value={reviewFormData.reviewer_location}
                        onChange={(e) => setReviewFormData(prev => ({ ...prev, reviewer_location: e.target.value }))}
                        className="h-11 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium">Rating *</Label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewFormData(prev => ({ ...prev, rating: star }))}
                            className="p-1 transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-8 w-8 transition-colors ${
                                star <= reviewFormData.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-sm text-gray-600">{reviewFormData.rating}/5</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reviewComment" className="font-medium">Your Review *</Label>
                      <Textarea
                        id="reviewComment"
                        placeholder="Tell us about your experience with AeroHive..."
                        value={reviewFormData.comment}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReviewFormData(prev => ({ ...prev, comment: e.target.value }))}
                        required
                        rows={4}
                        className="rounded-xl resize-none"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {reviewSubmitting ? (
                        <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Submitting...</>
                      ) : (
                        <><Send className="h-5 w-5 mr-2" /> Submit Review</>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Reviews Grid */}
            {reviewsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {displayedReviews.map((review) => (
                  <Card key={review.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                        ))}
                        {[...Array(5 - review.rating)].map((_, i) => (
                          <Star key={`empty-${i}`} className="h-5 w-5 text-gray-200" />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-4 leading-relaxed">"{review.comment}"</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{review.reviewer_name}</h4>
                          {review.reviewer_role && <p className="text-gray-600 text-sm">{review.reviewer_role}</p>}
                          {review.reviewer_location && <p className="text-gray-500 text-xs">{review.reviewer_location}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
