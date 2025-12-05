"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Filter, Grid, List, SlidersHorizontal, Star, Package, Search, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ModernProductCard } from "@/components/ui/modern-product-card"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
import { useCartStore } from "@/lib/cart-store"
import { getProducts, Product, getCategories, Category } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("created_desc")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const { addItem } = useCartStore()

  useEffect(() => {
    loadData()
  }, [])

  const handleAddToCart = (product: Product) => {
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

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [productsData, categoriesData] = await Promise.all([
        getProducts({ active: true }),
        getCategories()
      ])
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading products:', error)
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === "all" || product.category?.id === selectedCategory
    
    const matchesPrice = (!priceRange.min || product.price >= parseFloat(priceRange.min)) &&
                        (!priceRange.max || product.price <= parseFloat(priceRange.max))
    
    return matchesSearch && matchesCategory && matchesPrice
  })

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price_asc":
        return a.price - b.price
      case "price_desc":
        return b.price - a.price
      case "name_asc":
        return a.name.localeCompare(b.name)
      case "name_desc":
        return b.name.localeCompare(a.name)
      case "created_desc":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  return (
    <div className="min-h-screen flex flex-col">
      <ModernHeader />

      <main className="flex-1 pt-20">
        {/* Hero Header */}
        <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50 py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <Package className="text-white h-8 w-8" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Drone <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Collection</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Discover our premium selection of professional-grade drones and aerial equipment
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          {/* Filters and Search */}
          <div className="grid gap-6 lg:grid-cols-4 mb-8">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'} lg:col-span-1`}>
            <Card className="border-0 shadow-xl bg-white rounded-2xl sticky top-32">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-gray-900">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                    <Filter className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xl font-bold">Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <Label htmlFor="search" className="text-sm font-semibold text-gray-700">Search Products</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search drones..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="mt-2 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Price Range (₹)</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <Input
                      placeholder="Min"
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("all")
                    setPriceRange({ min: "", max: "" })
                  }}
                  className="w-full rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-all duration-300"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
              <div className="flex items-center space-x-6">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-all duration-300"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <p className="text-sm font-medium text-gray-600">
                    {isLoading ? "Loading..." : `${sortedProducts.length} products available`}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-52 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="created_desc">✨ Newest First</SelectItem>
                    <SelectItem value="created_asc">📅 Oldest First</SelectItem>
                    <SelectItem value="price_asc">💰 Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">💎 Price: High to Low</SelectItem>
                    <SelectItem value="name_asc">🔤 Name: A to Z</SelectItem>
                    <SelectItem value="name_desc">🔢 Name: Z to A</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex bg-gray-100 rounded-xl p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`rounded-lg transition-all duration-300 ${
                      viewMode === "grid" 
                        ? "bg-white shadow-md text-blue-600" 
                        : "hover:bg-gray-200 text-gray-600"
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`rounded-lg transition-all duration-300 ${
                      viewMode === "list" 
                        ? "bg-white shadow-md text-blue-600" 
                        : "hover:bg-gray-200 text-gray-600"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products */}
            {isLoading ? (
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="border-0 shadow-xl bg-white rounded-2xl animate-pulse overflow-hidden">
                    <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300"></div>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="h-5 bg-gray-200 rounded-lg w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                        <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
                        <div className="h-10 bg-gray-200 rounded-xl"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <Card className="border-0 shadow-xl bg-white rounded-2xl">
                <CardContent className="p-16 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-8">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No products found</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                    We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
                  </p>
                  <Button 
                    onClick={() => {
                      setSearchQuery("")
                      setSelectedCategory("all")
                      setPriceRange({ min: "", max: "" })
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "md:grid-cols-2 xl:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                {sortedProducts.map((product) => (
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
                    onAddToCart={() => handleAddToCart(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        </div>
      </main>

      <ModernFooter />
    </div>
  )
}