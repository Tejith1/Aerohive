"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Plane, Camera, Zap, MapPin, Shield, Truck, Star, Clock, Wind, Users, Award, Globe, Battery, Wifi, ShoppingCart, Settings, Play, Eye, Headphones, Gauge, Navigation, Wifi as WifiIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HeroSection } from "@/components/ui/hero-section"
import { ModernProductCard } from "@/components/ui/modern-product-card"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
import { useCartStore } from "@/lib/cart-store"
import { toast } from "@/hooks/use-toast"
import { getProducts, Product } from "@/lib/supabase"

export default function HomePage() {
  const { addItem } = useCartStore()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true)
        const products = await getProducts({ 
          featured: true, 
          active: true, 
          limit: 4 
        })
        setFeaturedProducts(products)
        setError(null)
      } catch (err) {
        console.error('Error fetching featured products:', err)
        setError('Failed to load featured products')
        // No fallback data needed since we're fetching directly from database
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

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
  return (
    <div className="min-h-screen flex flex-col">
      <ModernHeader />

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
          backgroundImage="/placeholder.svg?height=600&width=600&text=Professional+Drone"
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
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Plane className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Drone Services</h3>
                  <p className="text-gray-600 leading-relaxed text-lg mb-6">
                    Professional drone services including aerial photography, mapping, surveying, and custom operations.
                  </p>
                  <Button variant="outline" className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 rounded-xl" asChild>
                    <Link href="/drone-services">Learn More</Link>
                  </Button>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </CardContent>
              </Card>

              <Card className="group bg-white border-0 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                <CardContent className="p-8 text-center relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Settings className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Repair Services</h3>
                  <p className="text-gray-600 leading-relaxed text-lg mb-6">
                    Expert repair services and maintenance programs to keep your drones flying at peak performance.
                  </p>
                  <Button variant="outline" className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 rounded-xl" asChild>
                    <Link href="/repair-services">Learn More</Link>
                  </Button>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </CardContent>
              </Card>

              <Card className="group bg-white border-0 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                <CardContent className="p-8 text-center relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">Training & Certification</h3>
                  <p className="text-gray-600 leading-relaxed text-lg mb-6">
                    Comprehensive training programs and certifications from licensed pilots and aviation experts.
                  </p>
                  <Button variant="outline" className="border-2 border-green-200 text-green-600 hover:bg-green-50 rounded-xl" asChild>
                    <Link href="/training">Learn More</Link>
                  </Button>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-600 to-emerald-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
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
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
                <Plane className="h-10 w-10 text-white" />
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
