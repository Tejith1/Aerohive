"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Plane, Camera, Zap, MapPin, Shield, Truck, Star, Clock, Wind, Users, Award, Globe, Battery, Wifi, ShoppingCart, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductCard } from "@/components/product/product-card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-black/20"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-8">
                    <Plane className="h-16 w-16 mr-4 drone-float text-cyan-400" />
                    <span className="text-2xl font-bold text-white">AeroHive Drones</span>
                  </div>
                  <h1 className="text-6xl md:text-8xl font-extrabold mb-8 text-white drop-shadow-lg">
                    The Future of 
                    <span className="block text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                      Flight is Here
                    </span>
                  </h1>
                  <p className="text-2xl text-gray-200 mb-10 leading-relaxed max-w-2xl font-medium">
                    Discover cutting-edge drones for every mission - from professional photography and racing to commercial surveillance and agricultural operations.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                    <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-xl px-10 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105" asChild>
                      <Link href="/products">
                        Explore Drones
                        <Plane className="ml-3 h-6 w-6" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" className="text-xl px-10 py-6 rounded-xl border-2 border-white text-white hover:bg-white hover:text-slate-900 transition-all duration-300" asChild>
                      <Link href="/categories">Browse Categories</Link>
                    </Button>
                  </div>
                  
                  {/* Key Stats */}
                  <div className="grid grid-cols-3 gap-8 mt-16 pt-10 border-t border-white/30">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white">500+</div>
                      <div className="text-gray-300 text-lg">Drones Available</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white">50K+</div>
                      <div className="text-gray-300 text-lg">Happy Pilots</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-white">4.8★</div>
                      <div className="text-gray-300 text-lg">Average Rating</div>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="relative z-10">
                    <img
                      src="/placeholder.svg?height=700&width=700&text=Hero+Drone+Image"
                      alt="Professional Drone"
                      className="w-full max-w-2xl mx-auto drone-float drop-shadow-2xl"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 opacity-30">
            <Wind className="h-12 w-12 text-cyan-400 drone-float" style={{ animationDelay: '0.5s' }} />
          </div>
          <div className="absolute bottom-20 right-10 opacity-30">
            <Battery className="h-12 w-12 text-cyan-400 drone-float" style={{ animationDelay: '1s' }} />
          </div>
          <div className="absolute top-1/2 right-20 opacity-20">
            <Wifi className="h-10 w-10 text-blue-400 drone-float" style={{ animationDelay: '1.5s' }} />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
                Why Choose AeroHive?
              </h2>
              <p className="text-2xl text-slate-700 max-w-4xl mx-auto leading-relaxed">
                We're more than just a drone retailer - we're your complete aviation partner
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="drone-card text-center group bg-white shadow-lg hover:shadow-xl border-0">
                <CardContent className="p-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                    <Shield className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Premium Quality</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    Military-grade components and rigorous testing ensure maximum reliability and performance.
                  </p>
                </CardContent>
              </Card>

              <Card className="drone-card text-center group bg-white shadow-lg hover:shadow-xl border-0">
                <CardContent className="p-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                    <Users className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Expert Support</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    24/7 technical support from certified drone experts and flight instructors.
                  </p>
                </CardContent>
              </Card>

              <Card className="drone-card text-center group bg-white shadow-lg hover:shadow-xl border-0">
                <CardContent className="p-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                    <Award className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Training Programs</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    Comprehensive training courses and certification programs for all skill levels.
                  </p>
                </CardContent>
              </Card>

              <Card className="drone-card text-center group bg-white shadow-lg hover:shadow-xl border-0">
                <CardContent className="p-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform">
                    <Truck className="h-10 w-10 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Fast Delivery</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    Free overnight shipping and secure packaging for safe drone delivery worldwide.
                  </p>
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
                  <Card key={i} className="overflow-hidden animate-pulse">
                    <div className="aspect-square bg-gray-200"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
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
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                {featuredProducts.map((product) => {
                  const discountPercentage = product.compare_price
                    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
                    : 0

                  return (
                    <Card key={product.id} className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <Link href={`/products/${product.slug}`}>
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {discountPercentage > 0 && (
                          <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-semibold">
                            -{discountPercentage}%
                          </div>
                        )}
                        {product.is_featured && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
                            Featured
                          </div>
                        )}
                        {product.stock_quantity === 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold">Out of Stock</div>
                          </div>
                        )}
                      </div>
                    </Link>

                    <CardContent className="p-4">
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-semibold text-card-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Rating */}
                      {product.average_rating && (
                        <div className="flex items-center gap-1 mb-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= Math.round(product.average_rating!) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">(0)</span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-primary">₹{product.price.toLocaleString('en-IN')}</span>
                        {product.compare_price && (
                          <span className="text-sm text-muted-foreground line-through">₹{product.compare_price.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </CardContent>

                    <div className="p-4 pt-0">
                      <div className="w-full space-y-2">
                        <Button 
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={product.stock_quantity === 0} 
                          className={`w-full ${product.stock_quantity === 0 ? 'bg-gray-400' : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'} text-white shadow-md hover:shadow-lg transition-all duration-300`}
                          size="sm"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          {product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
                        </Button>
                        
                        <Link href={`/products/${product.slug}`} className="w-full">
                          <Button variant="outline" className="w-full border-2 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Customize
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                  )
                })}
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
        <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                Complete Drone Services
              </h2>
              <p className="text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
                Beyond selling drones, we offer comprehensive services for all your aerial needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="bg-white/15 backdrop-blur-sm border-white/30 text-white hover:bg-white/25 transition-all duration-300 shadow-xl">
                <CardContent className="p-10 text-center">
                  <Clock className="h-16 w-16 mx-auto mb-6 text-cyan-300" />
                  <h3 className="text-2xl font-bold mb-4 text-white">Training Courses</h3>
                  <p className="text-gray-200 leading-relaxed text-lg">
                    Professional pilot certification and advanced flight training programs.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/15 backdrop-blur-sm border-white/30 text-white hover:bg-white/25 transition-all duration-300 shadow-xl">
                <CardContent className="p-10 text-center">
                  <Shield className="h-16 w-16 mx-auto mb-6 text-cyan-300" />
                  <h3 className="text-2xl font-bold mb-4 text-white">Insurance Plans</h3>
                  <p className="text-gray-200 leading-relaxed text-lg">
                    Comprehensive coverage plans to protect your investment and operations.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/15 backdrop-blur-sm border-white/30 text-white hover:bg-white/25 transition-all duration-300 shadow-xl">
                <CardContent className="p-10 text-center">
                  <Truck className="h-16 w-16 mx-auto mb-6 text-cyan-300" />
                  <h3 className="text-2xl font-bold mb-4 text-white">Repair Services</h3>
                  <p className="text-gray-200 leading-relaxed text-lg">
                    Expert repair and maintenance services to keep your drones flying.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/15 backdrop-blur-sm border-white/30 text-white hover:bg-white/25 transition-all duration-300 shadow-xl">
                <CardContent className="p-10 text-center">
                  <Globe className="h-16 w-16 mx-auto mb-6 text-cyan-300" />
                  <h3 className="text-2xl font-bold mb-4 text-white">DaaS Platform</h3>
                  <p className="text-gray-200 leading-relaxed text-lg">
                    Drone-as-a-Service for commercial operations and specialized missions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-24 bg-gradient-to-r from-slate-900 to-blue-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Plane className="h-20 w-20 mx-auto mb-8 text-cyan-400" />
              <h2 className="text-5xl font-bold mb-6 text-white">Join the AeroHive Community</h2>
              <p className="text-2xl text-gray-200 mb-12 leading-relaxed">
                Get exclusive access to new releases, expert tips, and special offers for drone enthusiasts
              </p>
              <div className="flex flex-col sm:flex-row gap-6 max-w-xl mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-8 py-6 rounded-xl border-2 border-cyan-400/30 bg-white/10 text-white placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 backdrop-blur-sm text-lg"
                />
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 px-10 py-6 rounded-xl text-lg font-semibold">
                  Subscribe
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </div>
              <p className="text-lg text-gray-300 mt-6">
                Join 50,000+ drone pilots worldwide. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
