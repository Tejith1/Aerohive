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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <AdminHeader title="Products" description="Manage your product inventory and catalog" />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Product Management
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your drone inventory and product catalog
              </p>
            </div>
            <Link href="/admin/products/new">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                <Plus className="h-5 w-5 mr-2" />
                Add New Product
              </Button>
            </Link>
          </div>

          {/* Search and Filter Bar */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products by name, category, or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 border-primary/20 focus:border-primary"
                  />
                </div>
                <Button variant="outline" className="h-12 px-6 border-primary/20 text-primary hover:bg-primary/10">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? "No products found" : "No products yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery 
                  ? `No products match "${searchQuery}". Try adjusting your search.`
                  : "Get started by adding your first product to the catalog."
                }
              </p>
              {!searchQuery && (
                <Link href="/admin/products/new">
                  <Button size="lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Add Your First Product
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-primary/50" />
                    </div>
                  )}
                  
                  {/* Status Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {product.is_featured && (
                      <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    <Badge variant={product.stock_quantity > 10 ? "default" : product.stock_quantity > 0 ? "secondary" : "destructive"}>
                      {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/products/${product.slug}`} target="_blank">
                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      className="h-8 w-8 p-0"
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Product Info */}
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      {product.category && (
                        <p className="text-sm text-muted-foreground">
                          {product.category.name}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-primary">
                          ₹{product.price.toLocaleString()}
                        </span>
                        {product.compare_price && product.compare_price > product.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{product.compare_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {product.average_rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{product.average_rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {product.sku && (
                      <p className="text-xs text-muted-foreground font-mono">
                        SKU: {product.sku}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {!isLoading && filteredProducts.length > 0 && (
          <Card className="mt-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{filteredProducts.length}</div>
                  <div className="text-sm text-muted-foreground">
                    {searchQuery ? "Search Results" : "Total Products"}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {filteredProducts.filter(p => p.stock_quantity > 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">In Stock</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {filteredProducts.filter(p => p.is_featured).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Featured</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    ₹{filteredProducts.reduce((sum, p) => sum + p.price, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}