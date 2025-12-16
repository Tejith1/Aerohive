"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowRight, Plane, Camera, Zap, MapPin, Shield, Truck, Star, Clock, Wind, Users, Award, Globe, Battery, Wifi, ShoppingCart, Settings, Play, Eye, Headphones, Gauge, Navigation, Wifi as WifiIcon, Mail, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HeroSection } from "@/components/ui/hero-section"
import { ModernProductCard } from "@/components/ui/modern-product-card"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
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

      // Check for OAuth success
      if (code || localStorage.getItem('oauth_success') === 'true') {
        console.log('🎉 OAuth callback detected')

        // Give time for auth context to update
        setTimeout(async () => {
          await refreshUser()
          localStorage.removeItem('oauth_success')
          window.history.replaceState({}, '', '/')
        }, 1000)
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
        className: "border-blue-200 bg-blue-50 text-blue-900",
        duration: 15000,
      })
    } else if (message === 'email-confirmed') {
      toast({
        title: "✅ Email Confirmed!",
        description: "Your account is now active. Welcome to AeroHive! You can now log in and start shopping.",
        className: "border-green-200 bg-green-50 text-green-900",
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

        // Retry once on network/connection errors
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
    e.preventDefault()

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
      className: "border-green-200 bg-green-50 text-green-900",
    })
  }

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ModernHeader key={user?.id || 'guest'} />

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <HeroSection
          title="Soar Above"
          subtitle="Professional Drones"
          description="From advanced racing drones to professional aerial photography systems, discover our complete range of cutting-edge drones designed for enthusiasts and professionals alike."
          primaryButtonText="Explore Drones"
          primaryButtonHref="/products"
          secondaryButtonText="Watch Demo"
          secondaryButtonHref="/demo"
          backgroundImage="/WhatsApp Image 2025-10-24 at 09.33.29_68a8851c.jpg"
          stats={[
            { label: "Drone Models", value: "200+" },
            { label: "Pilots Served", value: "25K+" },
            { label: "Average Rating", value: "4.9★" }
          ]}
          features={[
            "Professional Grade",
            "Expert Support",
            "Fast Shipping",
            "Full Warranty"
          ]}
        />

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Why Choose <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">AeroHive</span>?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Experience unmatched quality and innovation with our professional drone solutions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="group bg-gradient-to-br from-blue-50 to-indigo-50 border-0 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                <CardContent className="p-8 text-center relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">4K Cameras</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Professional-grade cameras with stabilized gimbals for stunning aerial photography and videography.
                  </p>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-purple-50 to-pink-50 border-0 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                <CardContent className="p-8 text-center relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Navigation className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Smart Navigation</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Advanced GPS and obstacle avoidance systems for precise autonomous flight and safe operation.
                  </p>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-green-50 to-emerald-50 border-0 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                <CardContent className="p-8 text-center relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Safety First</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Multiple safety features including return-to-home, low battery protection, and collision avoidance.
                  </p>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/30 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                </CardContent>
              </Card>

              <Card className="group bg-gradient-to-br from-orange-50 to-red-50 border-0 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                <CardContent className="p-8 text-center relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Battery className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Long Flight Time</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Extended battery life with intelligent power management for longer flights and more productivity.
                  </p>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/30 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
                Featured Drones
              </h2>
              <p className="text-2xl text-slate-700 max-w-4xl mx-auto leading-relaxed">
                Handpicked selection of our most popular and cutting-edge drone models
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="overflow-hidden animate-pulse rounded-2xl border-0">
                    <div className="aspect-square bg-gray-200"></div>
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 text-lg mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                >
                  Try Again
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
                    reviewCount={0}
                    isNew={false}
                    isFeatured={product.is_featured}
                    isOnSale={!!product.compare_price}
                    stockQuantity={product.stock_quantity}
                    onAddToCart={() => handleAddToCart({} as React.MouseEvent, product)}
                  />
                ))}
              </div>
            )}

            <div className="text-center">
              <Button size="lg" variant="outline" className="text-xl px-10 py-6 border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-300" asChild>
                <Link href="/products">
                  View All Drones
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
                Complete <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Aerial Solutions</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Beyond premium products, we offer comprehensive services for all your drone and aviation needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="group bg-white border-0 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                <CardContent className="p-8 text-center relative">
                  <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg border-2 border-blue-100">
                    <img
                      src="/WhatsApp Image 2025-10-24 at 09.33.29_68a8851c.jpg"
                      alt="AeroHive Drone Services"
                      className="h-full w-full object-contain p-2"
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Pilot Services</h3>
                  <div className="text-gray-600 leading-relaxed text-sm mb-6 space-y-2">
                    <p className="font-semibold text-blue-600">Specialized Operations:</p>
                    <ul className="grid grid-cols-2 gap-2 text-left px-4">
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Surveying</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Spraying</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> 3D Mapping</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Inspections</li>
                    </ul>
                  </div>
                  <Button variant="outline" className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl" asChild>
                    <Link href="/drone-services">Explore Services</Link>
                  </Button>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </CardContent>
              </Card>

              <Card className="group bg-white border-0 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                <CardContent className="p-8 text-center relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Settings className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Drone Care</h3>
                  <div className="text-gray-600 leading-relaxed text-sm mb-6 space-y-2">
                    <p className="font-semibold text-purple-600">Maintenance & Repair:</p>
                    <ul className="text-left px-4 space-y-1">
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-500" /> General Checkups</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-500" /> Comprehensive Service</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-500" /> Firmware Updates</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-purple-500" /> Diagnostic Testing</li>
                    </ul>
                  </div>
                  <Button variant="outline" className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 rounded-xl" asChild>
                    <Link href="/repair-services">Book Service</Link>
                  </Button>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </CardContent>
              </Card>

              <Card className="group bg-white border-0 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                <CardContent className="p-8 text-center relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Shield className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Custom & Defense</h3>
                  <div className="text-gray-600 leading-relaxed text-sm mb-6 space-y-2">
                    <p className="font-semibold text-orange-600">Advanced Solutions:</p>
                    <ul className="text-left px-4 space-y-1">
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-orange-500" /> Defence Applications</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-orange-500" /> Custom Drone Building</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-orange-500" /> Multi-industry Solutions</li>
                      <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-orange-500" /> Tactical Modifications</li>
                    </ul>
                  </div>
                  <Button variant="outline" className="border-2 border-orange-200 text-orange-600 hover:bg-orange-50 rounded-xl" asChild>
                    <Link href="/repair-services?filter=custom">Custom Solutions</Link>
                  </Button>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-repeat" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="w-20 h-20 bg-white/90 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-8 backdrop-blur-sm shadow-lg">
                <img
                  src="/WhatsApp Image 2025-10-24 at 09.33.29_68a8851c.jpg"
                  alt="AeroHive Logo"
                  className="h-full w-full object-contain p-2"
                />
              </div>
              <h2 className="text-5xl font-bold mb-6 text-white">
                Stay <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Airborne</span>
              </h2>
              <p className="text-xl text-blue-100 mb-12 leading-relaxed">
                Get exclusive access to new drone releases, flight tips, and special offers for pilots
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm text-lg"
                />
                <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  Subscribe
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              <p className="text-blue-200">
                Join 50,000+ drone enthusiasts worldwide. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </section>
      </main>

      <ModernFooter />
    </div>
  )
}
