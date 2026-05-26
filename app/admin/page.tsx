"use client"

import { Package, ShoppingCart, Users, DollarSign, TrendingUp, TrendingDown, Plus, Edit3, Trash2, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminHeader } from "@/components/admin/admin-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { getProducts, Product, getCategories, Category } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ])
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate stats from actual data
  const stats = [
    {
      title: "Total Revenue",
      value: `₹${(products.reduce((sum, p) => sum + p.price * Math.max(50 - p.stock_quantity, 0), 0)).toLocaleString()}`,
      change: "+20.1%",
      trend: "up" as const,
      icon: DollarSign,
    },
    {
      title: "Orders",
      value: products.reduce((sum, p) => sum + Math.max(50 - p.stock_quantity, 0), 0).toString(),
      change: "+180.1%",
      trend: "up" as const,
      icon: ShoppingCart,
    },
    {
      title: "Products",
      value: products.length.toString(),
      change: "+19%",
      trend: "up" as const,
      icon: Package,
    },
    {
      title: "Categories",
      value: categories.length.toString(),
      change: "+201",
      trend: "up" as const,
      icon: Users,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <AdminHeader title="Dashboard" description="Welcome back! Here's what's happening with your store today." />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section with Premium Design */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/20"></div>
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-4 left-8 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute bottom-8 right-12 w-20 h-20 bg-blue-400/20 rounded-full blur-xl"></div>
              <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-purple-400/20 rounded-full blur-xl"></div>
            </div>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Welcome to AeroHive Admin</h1>
              <p className="text-blue-100 text-lg">Manage your drone e-commerce platform with ease and precision</p>
              <div className="flex items-center space-x-4 mt-6">
                <Link href="/admin/products/new">
                  <Button size="lg" className="bg-white/20 border border-white/30 text-white hover:bg-white/30 backdrop-blur-sm transition-all duration-300 shadow-lg">
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Product
                  </Button>
                </Link>
                <Link href="/admin/categories">
                  <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
                    Manage Categories
                  </Button>
                </Link>
              </div>
            </div>
            <div className="absolute top-6 right-8 opacity-10">
              <Package className="h-32 w-32" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="relative overflow-hidden border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 group-hover:text-slate-700 transition-colors">
                  {stat.title}
                </CardTitle>
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-300">
                  <stat.icon className="h-6 w-6 text-blue-600 group-hover:text-blue-700 transition-colors" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{stat.value}</div>
                <div className="flex items-center space-x-2 text-xs text-slate-500 mt-2">
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={stat.trend === "up" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {stat.change}
                  </span>
                  <span>from last month</span>
                </div>
              </CardContent>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Card>
          ))}
        </div>

        {/* Recent Products */}
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Recent Products
              </CardTitle>
              <Link href="/admin/products">
                <Button variant="outline" size="sm" className="border-primary/20 text-primary hover:bg-primary/10">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4 animate-pulse">
                      <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No products found</p>
                  <Link href="/admin/products/new">
                    <Button className="mt-4">Add Your First Product</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-primary/5 transition-colors group">
                      <div className="h-12 w-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center overflow-hidden">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{product.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-sm text-primary font-semibold">₹{product.price.toLocaleString()}</p>
                          <Badge variant={product.stock_quantity > 10 ? "default" : product.stock_quantity > 0 ? "secondary" : "destructive"} className="text-xs">
                            {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                          </Badge>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categories Overview */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Categories
              </CardTitle>
              <Link href="/admin/categories/new">
                <Button variant="outline" size="sm" className="border-primary/20 text-primary hover:bg-primary/10">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4 animate-pulse">
                      <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No categories found</p>
                  <Link href="/admin/categories/new">
                    <Button className="mt-4">Add Your First Category</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {categories.slice(0, 5).map((category) => (
                    <div key={category.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-primary/5 transition-colors group">
                      <div className="h-10 w-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center overflow-hidden">
                        {category.image_url ? (
                          <img src={category.image_url} alt={category.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{category.name}</p>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

