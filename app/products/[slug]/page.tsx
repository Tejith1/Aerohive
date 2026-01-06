"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft, Star, Heart, Share2, Truck, Shield, RefreshCw, Plane, Plus, Minus, ShoppingCart, Camera, Battery } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/layout/header"
import { ModernFooter } from "@/components/layout/modern-footer"
import Link from "next/link"
import { getProducts, Product } from "@/lib/supabase"
import { notFound } from "next/navigation"
import { useCartStore } from "@/lib/cart-store"
import { toast } from "@/hooks/use-toast"

export default function ProductDetailPage() {
  const params = useParams()
  const { addItem } = useCartStore()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    loadProduct()
  }, [params.slug])

  const loadProduct = async () => {
    try {
      setIsLoading(true)
      const products = await getProducts({ active: true })
      const foundProduct = products.find(p => p.slug === params.slug)

      if (!foundProduct) {
        notFound()
      }

      setProduct(foundProduct)
    } catch (error) {
      console.error('Error loading product:', error)
      toast({
        title: "Error",
        description: "Failed to load product",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </main>
        <ModernFooter />
      </div>
    )
  }

  if (!product) {
    notFound()
  }

  const allImages = [product.image_url, ...product.images].filter(Boolean)

  const handleAddToCart = () => {
    if (product.stock_quantity === 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      })
      return
    }

    addItem({
      id: parseInt(product.id),
      name: product.name,
      price: product.price,
      imageUrl: product.image_url || "/placeholder.svg",
      slug: product.slug,
      stockQuantity: product.stock_quantity
    })

    toast({
      title: "Added to Cart",
      description: `${quantity} ${product.name} added to your cart.`,
    })
  }

  const handleBuyNow = () => {
    if (product.stock_quantity === 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      })
      return
    }

    // Add to cart first
    addItem({
      id: parseInt(product.id),
      name: product.name,
      price: product.price,
      imageUrl: product.image_url || "/placeholder.svg",
      slug: product.slug,
      stockQuantity: product.stock_quantity
    })

    // Redirect to checkout
    window.location.href = '/checkout'
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary">Products</Link>
          <span>/</span>
          <span className="text-primary">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-xl bg-white shadow-lg">
              <img
                src={allImages[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.is_featured && (
                <Badge className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  Featured
                </Badge>
              )}
            </div>

            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                        ? "border-primary shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                {product.category && (
                  <Badge variant="outline" className="text-xs">
                    {product.category.name}
                  </Badge>
                )}
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= (product.average_rating || 4.5)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                        }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({product.average_rating || 4.5}) • 218 reviews
                  </span>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

              <p className="text-gray-600 mb-4">
                {product.short_description || product.description}
              </p>
            </div>

            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-bold text-primary">₹{product.price.toLocaleString()}</span>
              {product.compare_price && (
                <>
                  <span className="text-xl text-gray-400 line-through">₹{product.compare_price.toLocaleString()}</span>
                  <Badge className="bg-green-100 text-green-800">
                    Save ₹{(product.compare_price - product.price).toLocaleString()}
                  </Badge>
                </>
              )}
            </div>

            {/* Key Features */}
            {(product.specifications?.intelligent_features && product.specifications.intelligent_features.length > 0) && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.specifications.intelligent_features.slice(0, 6).map((feature: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 min-w-[50px] text-center">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    disabled={quantity >= product.stock_quantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {product.stock_quantity < 10 && (
                  <Badge variant="outline" className="text-orange-600">
                    Only {product.stock_quantity} left
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3"
                  disabled={product.stock_quantity === 0}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>

                <Button
                  onClick={handleBuyNow}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3"
                  disabled={product.stock_quantity === 0}
                >
                  <Plane className="h-5 w-5 mr-2" />
                  {product.stock_quantity === 0 ? "Out of Stock" : "Buy Now"}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist
                  </Button>
                  <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-2 text-sm">
                <Truck className="h-5 w-5 text-green-600" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>2 Year Warranty</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <RefreshCw className="h-5 w-5 text-purple-600" />
                <span>30 Day Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="specifications" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="specifications">Technical Specifications</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="accessories">Included Accessories</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="specifications" className="mt-8">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plane className="h-6 w-6 text-primary" />
                  <span>Technical Specifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Flight Performance */}
                  <div>
                    <h4 className="font-semibold text-lg mb-6 flex items-center">
                      <Plane className="h-5 w-5 mr-2 text-blue-600" />
                      Flight Performance
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Flight Time</span>
                        <span className="font-semibold text-gray-900">
                          {product.battery_life ? `${product.battery_life} min` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Max Speed</span>
                        <span className="font-semibold text-gray-900">
                          {product.max_speed ? `${product.max_speed} km/h` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Range</span>
                        <span className="font-semibold text-gray-900">
                          {product.max_range ? `${product.max_range} m` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Max Altitude</span>
                        <span className="font-semibold text-gray-900">
                          {product.specifications?.max_altitude || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Wind Resistance</span>
                        <span className="font-semibold text-gray-900">
                          {product.specifications?.wind_resistance || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">GPS Navigation</span>
                        <span className="font-semibold text-gray-900">
                          {product.has_gps ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-600">Obstacle Avoidance</span>
                        <span className="font-semibold text-gray-900">
                          {product.has_obstacle_avoidance ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Power & Physical */}
                  <div>
                    <h4 className="font-semibold text-lg mb-6 flex items-center">
                      <Battery className="h-5 w-5 mr-2 text-orange-600" />
                      Power & Physical
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Battery Capacity</span>
                        <span className="font-semibold text-gray-900">
                          {product.specifications?.battery_capacity || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Charging Time</span>
                        <span className="font-semibold text-gray-900">
                          {product.specifications?.charging_time || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Weight</span>
                        <span className="font-semibold text-gray-900">
                          {product.weight ? `${product.weight} kg` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Dimensions</span>
                        <span className="font-semibold text-gray-900">
                          {product.dimensions && (product.dimensions.length && product.dimensions.width && product.dimensions.height)
                            ? `${product.dimensions.length}mm × ${product.dimensions.width}mm × ${product.dimensions.height}mm`
                            : product.specifications?.dimensions || 'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Warranty</span>
                        <span className="font-semibold text-gray-900">
                          {product.warranty_months ? `${product.warranty_months} months` : '12 months'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-600">SKU</span>
                        <span className="font-semibold text-gray-900 font-mono">
                          {product.sku || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Camera & Gimbal */}
                  <div>
                    <h4 className="font-semibold text-lg mb-6 flex items-center">
                      <Camera className="h-5 w-5 mr-2 text-green-600" />
                      Camera & Gimbal
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Camera Resolution</span>
                        <span className="font-semibold text-gray-900">
                          {product.camera_resolution || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Video Resolution</span>
                        <span className="font-semibold text-gray-900">
                          {product.specifications?.video_resolution || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Gimbal Type</span>
                        <span className="font-semibold text-gray-900">
                          {product.specifications?.gimbal_type || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-600">Photo Modes</span>
                        <span className="font-semibold text-gray-900">
                          {product.specifications?.photo_modes || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Features */}
                  <div>
                    <h4 className="font-semibold text-lg mb-6 flex items-center">
                      <Shield className="h-5 w-5 mr-2 text-purple-600" />
                      Additional Features
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Return to Home</span>
                        <span className="font-semibold text-gray-900">
                          {product.specifications?.return_to_home ? 'Yes' : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Follow Me Mode</span>
                        <span className="font-semibold text-gray-900">
                          {product.specifications?.follow_me_mode ? 'Yes' : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Intelligent Flight Modes</span>
                        <span className="font-semibold text-gray-900">
                          {product.specifications?.intelligent_flight_modes || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-gray-200">
                        <span className="text-gray-600">Remote Controller Range</span>
                        <span className="font-semibold text-gray-900">
                          {product.specifications?.controller_range || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-gray-600">Operating Temperature</span>
                        <span className="font-semibold text-gray-900">
                          {product.specifications?.operating_temperature || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom specifications from JSON */}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div className="mt-8 pt-8 border-t">
                    <h4 className="font-semibold text-lg mb-6">Additional Technical Details</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      {Object.entries(product.specifications).map(([key, value]) => {
                        // Skip already displayed fields
                        const skipFields = ['flight_time', 'max_speed', 'range', 'max_altitude', 'wind_resistance',
                          'battery_capacity', 'charging_time', 'dimensions', 'camera_resolution',
                          'video_resolution', 'gimbal_type', 'photo_modes', 'return_to_home',
                          'follow_me_mode', 'intelligent_flight_modes', 'controller_range', 'operating_temperature'];

                        if (skipFields.includes(key)) return null;

                        return (
                          <div key={key} className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-600 mb-1">
                              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </div>
                            <div className="font-semibold text-gray-900">
                              {typeof value === 'string' || typeof value === 'number' ? value.toString() : 'Complex Data'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="description" className="mt-8">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {product.description || "No detailed description available."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accessories" className="mt-8">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>What's in the Box</CardTitle>
              </CardHeader>
              <CardContent>
                {product.specifications?.included_accessories && product.specifications.included_accessories.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {product.specifications.included_accessories.map((accessory: string, index: number) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>{accessory}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No accessories information available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-8">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-600">
                  <Star className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <ModernFooter />
    </div>
  )
}
