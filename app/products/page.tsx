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
import Link from "next/link"
import { useCartStore } from "@/lib/cart-store"
import { getProducts, Product, getCategories, Category } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Lock, ArrowRight } from "lucide-react"
import { ComingSoonOverlay } from "@/components/ui/coming-soon-overlay"
import { FAQSection } from "@/components/layout/faq-section"

const productFAQs = [
  {
    question: "How do I choose the right drone for my needs?",
    answer: "Consider your primary use case (photography, racing, or commercial) and check the flight time and camera specifications on each product page."
  },
  {
    question: "Do you offer bulk discounts for corporate orders?",
    answer: "Yes, we offer special pricing for bulk orders and corporate partnerships. Please use the 'Ask a Doubt' form below to get a quote."
  },
  {
    question: "What is your return policy for drones?",
    answer: "We offer a 15-day return policy for unopened items. For items that have been flown, returns are handled on a case-by-case basis through our support team."
  }
]

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
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth()

  const isGlobalLoading = authLoading || (isLoading && products.length === 0)

  useEffect(() => {
    loadData()
  }, [])

  // Sync category filter with URL query parameter
  useEffect(() => {
    const categoryParam = searchParams?.get("category")
    if (categoryParam && categories.length > 0) {
      const getSlugFromParam = (param: string) => {
        const p = param.toLowerCase();
        if (p.includes('enterprise') || p.includes('industrial')) return 'industrial-drones';
        if (p.includes('agriculture') || p.includes('agricultural')) return 'agricultural-drones';
        if (p.includes('photography') || p.includes('cinematic')) return 'photography-drones';
        if (p.includes('racing') || p.includes('fpv')) return 'racing-drones';
        if (p.includes('surveillance') || p.includes('security')) return 'surveillance-drones';
        if (p.includes('delivery') || p.includes('logistics')) return 'delivery-drones';
        return p;
      };

      const targetSlug = getSlugFromParam(categoryParam);
      const matched = categories.find(c => 
        c.slug === targetSlug || 
        c.slug.includes(targetSlug) ||
        c.name.toLowerCase().includes(targetSlug.replace('-drones', '')) ||
        c.id.toString() === categoryParam
      )
      if (matched) {
        setSelectedCategory(matched.id.toString())
      }
    }
  }, [searchParams, categories])

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
      variant: "success",
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
    const matchesSearch = (product.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.category?.name || "").toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === "all" || 
      String(product.category?.id) === String(selectedCategory) || 
      String(product.category_id) === String(selectedCategory)

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
      case "created_asc":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case "created_desc":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <ModernHeader />

      <main className="flex-1">
        {/* Elegant Editorial Hero Header */}
        <section className="relative bg-background text-foreground pt-28 lg:pt-36 pb-16 border-b border-border overflow-hidden text-center">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.01] pointer-events-none"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Custom Drone Schematic Logo */}
              <div className="flex justify-center mb-2">
                <svg className="w-20 h-20 text-primary animate-spin-slow" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="50" cy="50" r="44" strokeDasharray="3 3" className="opacity-40" />
                  <line x1="20" y1="20" x2="80" y2="80" />
                  <line x1="80" y1="20" x2="20" y2="80" />
                  <rect x="42" y="42" width="16" height="16" rx="3" className="fill-background stroke-primary" />
                  <circle cx="50" cy="50" r="3" className="fill-primary animate-pulse" />
                  <circle cx="20" cy="20" r="8" strokeDasharray="2 1" />
                  <circle cx="80" cy="20" r="8" strokeDasharray="2 1" />
                  <circle cx="20" cy="80" r="8" strokeDasharray="2 1" />
                  <circle cx="80" cy="80" r="8" strokeDasharray="2 1" />
                  <line x1="50" y1="50" x2="90" y2="50" strokeWidth="1" className="opacity-60" />
                </svg>
              </div>

              {/* Subtle top indicator */}
              <div className="inline-flex items-center justify-center space-x-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                <span className="text-[11px] font-bold tracking-[0.25em] text-slate-400 uppercase font-sans">
                  Drone Inventory
                </span>
              </div>
              {/* Beautiful massive editorial headline */}
              <h1 className="text-5xl md:text-7xl font-light tracking-[-0.02em] font-serif text-slate-900 dark:text-slate-100 leading-tight">
                Our Drone <span className="font-semibold text-primary">Collection</span>
              </h1>
              {/* Large book-like italicized summary */}
              <p className="text-xl md:text-2xl text-slate-750 dark:text-slate-300 italic max-w-3xl mx-auto leading-relaxed font-serif">
                Discover our premium selection of professional-grade drones, customized payloads, and high-performance aerial equipment engineered for enterprise scale.
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-6 py-12 relative">
          <div className={!isAdmin && !authLoading ? "opacity-20 blur-sm pointer-events-none transition-all duration-300" : "transition-all duration-300"}>
            {/* Filters and Search */}
            <div className="grid gap-6 lg:grid-cols-4 mb-8">
              {/* Filters Sidebar */}
              <div className={`lg:block ${showFilters ? 'block' : 'hidden'} lg:col-span-1`}>
                <Card className="border border-border shadow-[0_4px_20px_rgba(0,0,0,0.015)] bg-card rounded-3xl sticky top-32 p-2 text-foreground">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold font-sans">Filters</CardTitle>
                      <SlidersHorizontal className="h-4 w-4 text-slate-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Search */}
                    <div className="space-y-2">
                      <Label htmlFor="search-input" className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Search</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-450 w-4 h-4" />
                        <Input
                          id="search-input"
                          placeholder="Search drones..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 pr-4 rounded-full border border-border bg-card text-foreground focus:ring-1 focus:ring-primary focus:border-primary font-sans text-sm transition-all"
                        />
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Category</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full rounded-full border border-border bg-card text-foreground focus:ring-1 focus:ring-primary focus:border-primary font-sans text-sm transition-all">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
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
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-sans">Price Range (₹)</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Min"
                          type="number"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                          className="rounded-full border border-border bg-card text-foreground focus:ring-1 focus:ring-primary focus:border-primary font-sans text-sm transition-all"
                        />
                        <Input
                          placeholder="Max"
                          type="number"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                          className="rounded-full border border-border bg-card text-foreground focus:ring-1 focus:ring-primary focus:border-primary font-sans text-sm transition-all"
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
                      className="w-full rounded-full border border-border hover:bg-muted text-muted-foreground transition-all duration-300 font-sans text-xs font-semibold uppercase tracking-wider"
                    >
                      Clear Filters
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Products Grid */}
              <div className="lg:col-span-3">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 bg-card/50 border border-border p-4 rounded-3xl backdrop-blur-sm shadow-[0_2px_12px_rgba(0,0,0,0.01)]">
                  <div className="flex items-center space-x-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden rounded-full border border-border hover:bg-muted text-foreground transition-all duration-300 font-sans text-xs font-semibold uppercase tracking-wider"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5 mr-2" />
                      Filters
                    </Button>

                    <div className="flex items-center space-x-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>
                      <p className="text-xs font-semibold text-slate-550 dark:text-slate-400 font-sans tracking-wide uppercase">
                        {isGlobalLoading ? "Updating..." : `${sortedProducts.length} products available`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-52 rounded-full border border-border bg-card text-foreground focus:ring-1 focus:ring-primary focus:border-primary font-sans text-xs font-semibold tracking-wider uppercase transition-all">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="created_desc">Newest First</SelectItem>
                        <SelectItem value="created_asc">Oldest First</SelectItem>
                        <SelectItem value="price_asc">Price: Low to High</SelectItem>
                        <SelectItem value="price_desc">Price: High to Low</SelectItem>
                        <SelectItem value="name_asc">Name: A to Z</SelectItem>
                        <SelectItem value="name_desc">Name: Z to A</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex bg-muted rounded-full p-1">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className={`rounded-full transition-all duration-300 px-3 py-1 ${viewMode === "grid"
                          ? "bg-card shadow-sm text-primary"
                          : "hover:bg-muted text-muted-foreground"
                          }`}
                      >
                        <Grid className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className={`rounded-full transition-all duration-300 px-3 py-1 ${viewMode === "list"
                          ? "bg-card shadow-sm text-primary"
                          : "hover:bg-muted text-muted-foreground"
                          }`}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="relative">
                  {isGlobalLoading && products.length === 0 ? (
                    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="border-0 shadow-[0_4px_20px_rgba(0,0,0,0.015)] bg-card rounded-3xl animate-pulse overflow-hidden">
                          <div className="aspect-square bg-muted"></div>
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              <div className="h-5 bg-muted rounded-full w-3/4"></div>
                              <div className="h-4 bg-muted rounded-full w-1/2"></div>
                              <div className="h-8 bg-muted rounded-full w-1/3"></div>
                              <div className="h-10 bg-muted rounded-full"></div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : sortedProducts.length === 0 ? (
                    <Card className="border border-border shadow-[0_4px_20px_rgba(0,0,0,0.015)] bg-card rounded-3xl">
                      <CardContent className="p-16 text-center">
                        <div className="w-16 h-16 border border-border bg-background rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                          <Package className="h-6 w-6 text-slate-400 stroke-[1.5]" />
                        </div>
                        <h3 className="text-2xl font-serif font-normal text-slate-900 mb-4">No products found</h3>
                        <p className="text-slate-600 font-serif mb-8 max-w-md mx-auto leading-relaxed">
                          We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
                        </p>
                        <Button
                          onClick={() => {
                            setSearchQuery("")
                            setSelectedCategory("all")
                            setPriceRange({ min: "", max: "" })
                          }}
                          className="bg-foreground hover:bg-primary text-background rounded-full px-8 py-3 font-sans text-xs font-semibold uppercase tracking-wider shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                        >
                          Clear All Filters
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className={`grid gap-6 ${viewMode === "grid"
                      ? "md:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-1"
                      } transition-all duration-300`}>
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
          </div>

          {/* Locked Overlay */}
          <ComingSoonOverlay
            show={!isAdmin && !authLoading}
            title="Access Restricted"
            description="This section is locked for regular customers. Only administrators can access this content."
          />
        </div>
      </main>

      <FAQSection pageName="Products" customFAQs={productFAQs} />
      <ModernFooter />
    </div>
  )
}