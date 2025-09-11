"use client"

import Link from "next/link"
import { useState } from "react"
import { ShoppingCart, User, Search, Menu, X, Plane, Camera, Zap, Shield, MapPin, Wind } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/lib/cart-store"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const { getTotalItems } = useCartStore()
  const cartItemCount = getTotalItems()

  // Mock data - replace with actual state management
  const isLoggedIn = false

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90 shadow-lg border-blue-100/50">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Enhanced Premium Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary via-blue-500 to-secondary flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-blue-300/50">
                <Plane className="text-white h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AeroHive
              </span>
              <span className="text-xs text-muted-foreground -mt-1 font-medium">Professional Drones</span>
            </div>
          </Link>

          {/* Enhanced Premium Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link href="/products" className="flex items-center space-x-2 text-foreground hover:text-primary transition-all duration-300 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 group relative">
              <Plane className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
              <span>Drones</span>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse ml-1"></div>
              <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full group-hover:left-0"></div>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-2 text-foreground hover:text-primary transition-all duration-300 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 group">
                <Wind className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span>Services</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 p-2 bg-white/95 backdrop-blur-md border border-blue-100 shadow-xl rounded-xl">
                <DropdownMenuItem asChild>
                  <Link href="/training" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
                    <span className="font-medium">Training & Certification</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/repair-services" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300">
                    <span className="font-medium">Repair Services</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/drone-services" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300">
                    <span className="font-medium">Drone-as-a-Service</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/categories" className="text-foreground hover:text-primary transition-all duration-300 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 relative group">
              <span>Categories</span>
              <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full group-hover:left-0"></div>
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary transition-all duration-300 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 relative group">
              <span>About</span>
              <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full group-hover:left-0"></div>
            </Link>
            <Link href="/contact" className="text-foreground hover:text-primary transition-all duration-300 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 relative group">
              <span>Contact</span>
              <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full group-hover:left-0"></div>
            </Link>
          </nav>

          {/* Enhanced Premium Search Bar */}
          <div className="hidden lg:flex items-center space-x-3 flex-1 max-w-lg mx-8">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors duration-300" />
              <Input
                type="search"
                placeholder="Search drones, parts, accessories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            <Button size="sm" className="btn-aviation h-12 px-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Enhanced Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Enhanced User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-12 w-12 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 group">
                  <User className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 bg-white/95 backdrop-blur-md border border-blue-100 shadow-xl rounded-xl">
                {isLoggedIn ? (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
                        <User className="h-4 w-4" />
                        <span className="font-medium">My Account</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300">
                        <Plane className="h-4 w-4" />
                        <span className="font-medium">My Orders</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/wishlist" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300">
                        <span className="font-medium">Wishlist</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem className="p-3 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all duration-300">
                      <span className="font-medium">Logout</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
                        <User className="h-4 w-4" />
                        <span className="font-medium">Login</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300">
                        <span className="font-medium">Create Account</span>
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Enhanced Premium Cart */}
            <Button variant="ghost" size="icon" asChild className="relative h-12 w-12 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 group">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                {cartItemCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white border-2 border-white shadow-lg font-semibold animate-bounce"
                  >
                    {cartItemCount}
                  </Badge>
                )}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </Button>

            {/* Enhanced Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden h-12 w-12 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 group" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? 
                <X className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" /> : 
                <Menu className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              }
            </Button>
          </div>
        </div>

        {/* Enhanced Premium Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-blue-100 bg-white/95 backdrop-blur-md animate-slide-in-down">
            <div className="py-6 space-y-6">
              {/* Enhanced Mobile Search */}
              <div className="px-4">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 group-focus-within:text-primary transition-colors duration-300" />
                  <Input
                    type="search"
                    placeholder="Search drones..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Enhanced Mobile Navigation */}
              <nav className="px-4 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-primary border-b border-blue-100 pb-2">Drones</h3>
                  <div className="space-y-2">
                    <Link
                      href="/products"
                      className="flex items-center space-x-3 text-foreground hover:text-primary transition-all duration-300 py-3 px-4 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Plane className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">All Drones</span>
                    </Link>
                    <Link
                      href="/categories?filter=racing"
                      className="flex items-center space-x-3 text-foreground hover:text-primary transition-all duration-300 py-3 px-4 rounded-lg hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">Racing Drones</span>
                    </Link>
                    <Link
                      href="/categories?filter=photography"
                      className="flex items-center space-x-3 text-foreground hover:text-primary transition-all duration-300 py-3 px-4 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Camera className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">Photography Drones</span>
                    </Link>
                    <Link
                      href="/categories?filter=surveillance"
                      className="flex items-center space-x-3 text-foreground hover:text-primary transition-all duration-300 py-3 px-4 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 group"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Shield className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">Surveillance Drones</span>
                    </Link>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-primary border-b border-blue-100 pb-2">Services</h3>
                  <div className="space-y-2">
                    <Link
                      href="/training"
                      className="flex items-center space-x-3 text-foreground hover:text-primary transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>Training & Certification</span>
                    </Link>
                    <Link
                      href="/repair-services"
                      className="flex items-center space-x-3 text-foreground hover:text-primary transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>Repair Services</span>
                    </Link>
                    <Link
                      href="/drone-services"
                      className="flex items-center space-x-3 text-foreground hover:text-primary transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span>Drone-as-a-Service</span>
                    </Link>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    href="/categories"
                    className="flex items-center space-x-3 text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>Categories</span>
                  </Link>
                  <Link
                    href="/about"
                    className="flex items-center space-x-3 text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>About</span>
                  </Link>
                  <Link
                    href="/contact"
                    className="flex items-center space-x-3 text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>Contact</span>
                  </Link>
                </div>
              </nav>

              {/* Mobile User Actions */}
              <div className="px-4 pt-4 border-t space-y-3">
                {!isLoggedIn && (
                  <div className="flex space-x-3">
                    <Button asChild className="flex-1 btn-aviation">
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                        Login
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="flex-1">
                      <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
