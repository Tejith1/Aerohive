"use client"

import { useState } from "react"
import { ArrowLeft, Star, Heart, Share2, Truck, Shield, RefreshCw, Plane, Plus, Minus, ShoppingCart, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import DroneCustomization from "@/components/product/drone-customization"
import Link from "next/link"
import { getProductBySlug } from "@/lib/products-data"
import { notFound } from "next/navigation"
import { useCartStore } from "@/lib/cart-store"
import { toast } from "@/hooks/use-toast"

interface ProductDetailPageProps {
  params: {
    slug: string
  }
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const productData = getProductBySlug(params.slug)
  
  if (!productData) {
    notFound()
  }

  const { addItem } = useCartStore()
  const [selectedImage, setSelectedImage] = useState(0)
  const [showCustomization, setShowCustomization] = useState(false)
  const [customConfig, setCustomConfig] = useState(null)
  const [totalPrice, setTotalPrice] = useState(productData.price)
  const [quantity, setQuantity] = useState(1)

  const handleCustomizationChange = (config: any, price: number) => {
    setCustomConfig(config)
    setTotalPrice(price)
  }

  const handleAddToCart = () => {
    if (productData.stockQuantity === 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      })
      return
    }

    // Add to cart with specified quantity
    const itemToAdd = {
      id: productData.id,
      name: productData.name,
      price: totalPrice,
      imageUrl: productData.imageUrl || productData.images[0],
      slug: productData.slug,
      stockQuantity: productData.stockQuantity,
    }

    // Add the item first time
    addItem(itemToAdd)
    
    // Add additional quantities if needed
    for (let i = 1; i < quantity; i++) {
      addItem(itemToAdd)
    }

    toast({
      title: "🎉 Added to Cart!",
      description: `${quantity} x ${productData.name} added to your cart.`,
      className: "border-green-200 bg-green-50 text-green-900",
    })

    // Reset quantity after adding to cart
    setQuantity(1)
  }

  const handleBuyNow = () => {
    if (productData.stockQuantity === 0) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      })
      return
    }

    // Add to cart first
    handleAddToCart()
    
    // Navigate to checkout (for future implementation)
    // router.push('/checkout')
    
    toast({
      title: "🚀 Redirecting to Checkout",
      description: "Taking you to complete your purchase...",
      className: "border-blue-200 bg-blue-50 text-blue-900",
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-primary transition-colors">Drones</Link>
            <span>/</span>
            <Link href="/categories?filter=racing" className="hover:text-primary transition-colors">{productData.category}</Link>
            <span>/</span>
            <span className="text-foreground">{productData.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-lg">
                {productData.badge && (
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-primary text-white px-3 py-1 text-sm font-bold">
                      {productData.badge}
                    </Badge>
                  </div>
                )}
                <img
                  src={productData.images[selectedImage]}
                  alt={productData.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-3">
                {productData.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${productData.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              <div>
                <div className="text-sm text-primary font-medium uppercase tracking-wide mb-2">
                  {productData.category}
                </div>
                <h1 className="text-4xl font-bold text-foreground mb-4">
                  {productData.name}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(productData.averageRating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{productData.averageRating}</span>
                  <span className="text-muted-foreground">({productData.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold text-primary">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                  {productData.comparePrice > productData.price && (
                    <span className="text-xl text-muted-foreground line-through">
                      ₹{productData.comparePrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                {productData.comparePrice > productData.price && (
                  <div className="text-green-600 font-medium">
                    Save ₹{(productData.comparePrice - productData.price).toLocaleString('en-IN')} ({Math.round(((productData.comparePrice - productData.price) / productData.comparePrice) * 100)}% off)
                  </div>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                {productData.stockQuantity > 0 ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    ✓ In Stock ({productData.stockQuantity} available)
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    Out of Stock
                  </Badge>
                )}
              </div>

              {/* Customization Toggle */}
              <div className="space-y-4">
                <Button
                  onClick={() => setShowCustomization(!showCustomization)}
                  variant={showCustomization ? "default" : "outline"}
                  className="w-full h-12 text-lg"
                >
                  <Plane className="h-5 w-5 mr-2" />
                  {showCustomization ? "Hide Customization" : "Customize Your Drone"}
                </Button>
              </div>

              {/* Add to Cart Section */}
              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-gray-200 rounded-xl bg-gray-50">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-12 w-12 hover:bg-gray-100 rounded-l-xl"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.min(productData.stockQuantity, quantity + 1))}
                      className="h-12 w-12 hover:bg-gray-100 rounded-r-xl"
                      disabled={quantity >= productData.stockQuantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 h-12 text-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={productData.stockQuantity === 0}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart - ₹{(totalPrice * quantity).toLocaleString('en-IN')}
                  </Button>
                </div>

                {/* Buy Now Button */}
                <Button
                  onClick={handleBuyNow}
                  className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                  disabled={productData.stockQuantity === 0}
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Buy Now - ₹{(totalPrice * quantity).toLocaleString('en-IN')}
                </Button>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 h-12 border-2 hover:bg-red-50 hover:border-red-200 transition-all duration-300">
                    <Heart className="h-5 w-5 mr-2" />
                    Add to Wishlist
                  </Button>
                  <Button variant="outline" className="flex-1 h-12 border-2 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300">
                    <Share2 className="h-5 w-5 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 pt-6 border-t">
                <h3 className="font-semibold text-lg">Key Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  {productData.features.slice(0, 6).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping & Returns */}
              <div className="space-y-3 pt-6 border-t">
                <div className="flex items-center gap-3 text-sm">
                  <Truck className="h-5 w-5 text-primary" />
                  <span>Free overnight shipping on orders over ₹41,500</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>2-year manufacturer warranty included</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  <span>30-day return policy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Drone Customization Section */}
          {showCustomization && (
            <div className="mb-12">
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Plane className="h-6 w-6 text-primary" />
                    Customize Your {productData.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DroneCustomization
                    droneId={productData.id.toString()}
                    basePrice={productData.price}
                    onConfigurationChange={handleCustomizationChange}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Product Details Tabs */}
          <Tabs defaultValue="description" className="space-y-8">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto h-12">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({productData.reviewCount})</TabsTrigger>
              <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-6">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-4">Product Description</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {productData.description}
                  </p>
                  
                  <h4 className="text-lg font-semibold mb-3">What's in the Box</h4>
                  <div className="grid md:grid-cols-2 gap-2">
                    {productData.inTheBox.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="specifications" className="space-y-6">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6">Technical Specifications</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(productData.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-3 border-b">
                        <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>
                  <div className="text-center py-12 text-muted-foreground">
                    <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Customer reviews will be loaded here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="space-y-6">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6">Shipping & Returns</h3>
                  <div className="space-y-4 text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <Truck className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium text-foreground">Free Shipping</h4>
                        <p>Free overnight shipping on orders over ₹41,500. Standard shipping available for smaller orders.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <RefreshCw className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium text-foreground">30-Day Returns</h4>
                        <p>Easy returns within 30 days of purchase. Items must be in original condition.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-medium text-foreground">Warranty</h4>
                        <p>2-year manufacturer warranty covering defects and normal wear.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
