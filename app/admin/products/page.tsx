"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Package, Edit3, Trash2, Search, Filter, Eye, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AdminHeader } from "@/components/admin/admin-header"
import { getProducts, deleteProduct, Product } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    // Filter products based on search query
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredProducts(filtered)
  }, [products, searchQuery])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const data = await getProducts()
      setProducts(data)
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

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteProduct(productId)
      setProducts(products.filter(p => p.id !== productId))
      toast({
        title: "Success",
        description: "Product deleted successfully"
      })
    } catch (error) {
      console.error('Error deleting product:', error)
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#0b0f19] text-slate-855 dark:text-slate-105 transition-colors duration-300 relative pb-20 p-6 md:p-8">
      {/* Background ambient grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

      <AdminHeader title="Products" description="Manage your product inventory and catalog" />
      
      <main className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-serif font-normal text-slate-900 dark:text-white tracking-tight">
              Product Inventory
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your drone configurations, specialized camera payloads, and platform accessories.
            </p>
          </div>
          <Link href="/admin/products/new">
            <Button size="sm" className="bg-[#e65737] dark:bg-[#e65737] hover:bg-[#cc5032] dark:hover:bg-[#cc5032] text-white border border-[#e65737] dark:border-[#e65737] rounded-xl px-5 h-10 text-xs font-bold transition-all shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              New Product
            </Button>
          </Link>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white/70 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
              <Input
                placeholder="Search products by name, category, or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-xl bg-white dark:bg-slate-955 border-slate-200/85 dark:border-slate-800 text-xs shadow-sm focus-visible:ring-slate-300"
              />
            </div>
            <Button variant="outline" className="rounded-xl bg-white dark:bg-slate-950 border-slate-205 dark:border-slate-800 text-xs shadow-sm hover:bg-slate-50 font-bold px-5">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border border-slate-200/60 dark:border-slate-800/60 bg-white/90 dark:bg-slate-900/60 backdrop-blur-sm animate-pulse rounded-2xl">
                <div className="aspect-square bg-slate-100 dark:bg-slate-900 rounded-t-2xl"></div>
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded w-1/2"></div>
                  <div className="h-6 bg-slate-100 dark:bg-slate-900 rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl">
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-sm font-bold mb-1 uppercase tracking-widest font-mono">
                {searchQuery ? "No products found" : "No products yet"}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                {searchQuery 
                  ? `No products match "${searchQuery}". Try adjusting your search query.`
                  : "Get started by adding your first drone flight or product config to the database catalog."
                }
              </p>
              {!searchQuery && (
                <Link href="/admin/products/new">
                  <Button size="sm" className="bg-[#e65737] hover:bg-[#cc5032] text-white">
                    <Plus className="h-4 w-4 mr-2" /> Add Product
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/60 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:border-[#e65737]/30 dark:hover:border-[#e65737]/30 transition-all duration-300 group overflow-hidden rounded-2xl flex flex-col justify-between">
                <div>
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-905">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-slate-300 dark:text-slate-700" />
                      </div>
                    )}
                    
                    {/* Status Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.is_featured && (
                        <Badge className="bg-amber-500 dark:bg-amber-600 text-white text-[9px] uppercase tracking-wider font-bold">
                          <Star className="h-3 w-3 mr-1 fill-white" />
                          Featured
                        </Badge>
                      )}
                      <Badge className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                        product.stock_quantity > 10 
                          ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30" 
                          : product.stock_quantity > 0 
                          ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30" 
                          : "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455 border-rose-100 dark:border-rose-900/30"
                      }`}>
                        {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                      </Badge>
                    </div>

                    {/* Action Buttons Overlay */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-1.5">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button size="sm" variant="secondary" className="h-7 w-7 p-0 rounded-lg bg-white dark:bg-slate-900 shadow-sm border border-slate-200/50 dark:border-slate-800/50">
                          <Edit3 className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                        </Button>
                      </Link>
                      <Link href={`/products/${product.slug}`} target="_blank">
                        <Button size="sm" variant="secondary" className="h-7 w-7 p-0 rounded-lg bg-white dark:bg-slate-900 shadow-sm border border-slate-200/50 dark:border-slate-800/50">
                          <Eye className="h-3.5 w-3.5 text-slate-600 dark:text-slate-300" />
                        </Button>
                      </Link>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="h-7 w-7 p-0 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 shadow-sm border border-red-100 dark:border-red-900/30"
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <CardContent className="p-4 space-y-2.5">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs line-clamp-2">
                        {product.name}
                      </h3>
                      {product.category && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono mt-0.5">
                          {product.category.name}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                        {product.compare_price && product.compare_price > product.price && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 line-through font-mono">
                            ₹{product.compare_price.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      {product.average_rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{product.average_rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>

                <div className="px-4 pb-4">
                  {product.sku && (
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                      SKU: {product.sku}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {!isLoading && filteredProducts.length > 0 && (
          <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl overflow-hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="space-y-1">
                  <div className="text-xl font-bold text-slate-900 dark:text-white">{filteredProducts.length}</div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">
                    {searchQuery ? "Results" : "Total Products"}
                  </div>
                </div>
                <div className="space-y-1 border-l border-slate-100 dark:border-slate-800">
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-500">
                    {filteredProducts.filter(p => p.stock_quantity > 0).length}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Available</div>
                </div>
                <div className="space-y-1 border-l border-slate-100 dark:border-slate-800">
                  <div className="text-xl font-bold text-amber-500">
                    {filteredProducts.filter(p => p.is_featured).length}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Featured</div>
                </div>
                <div className="space-y-1 border-l border-slate-100 dark:border-slate-800">
                  <div className="text-xl font-bold text-[#e65737] dark:text-[#e65737]">
                    ₹{filteredProducts.reduce((sum, p) => sum + p.price, 0).toLocaleString("en-IN")}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Catalog Value</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}