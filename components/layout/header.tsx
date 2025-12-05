"use client"

import Link from "next/link"
import { ShoppingCart, User, LogOut, Plane, Shield, Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/lib/cart-store"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"

export function Header() {
  const { getTotalItems } = useCartStore()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const cartItemCount = getTotalItems()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const navigationLinks = [
    { href: "/products", label: "Drones", hasDropdown: false },
    { 
      href: "#", 
      label: "Services", 
      hasDropdown: true,
      dropdownItems: [
        { href: "/drone-services", label: "Drone Services" },
        { href: "/repair-services", label: "Repair Services" },
        { href: "/training", label: "Training" }
      ]
    },
    { href: "/categories", label: "Categories", hasDropdown: false },
    { href: "/about", label: "About", hasDropdown: false },
    { href: "/contact", label: "Contact", hasDropdown: false }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg">
              <Plane className="text-white h-6 w-6" />
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              AeroHive
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              link.hasDropdown ? (
                <DropdownMenu key={link.label}>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors group">
                      <span>{link.label}</span>
                      <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    {link.dropdownItems?.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="flex items-center w-full px-3 py-2 hover:bg-gray-50 rounded">
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                </Link>
              )
            ))}
          </nav>

          {/* Right side - Auth, Cart, Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white font-bold hover:shadow-lg transition-all duration-200 transform hover:scale-105">
                      {user?.first_name ? user.first_name[0].toUpperCase() : "U"}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2">
                    <div className="px-3 py-3 border-b border-gray-200 mb-2">
                      <p className="font-semibold text-gray-900">{user?.first_name} {user?.last_name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>

                    <DropdownMenuItem asChild>
                      <Link href="/account" className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded-md transition-colors">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>My Account</span>
                      </Link>
                    </DropdownMenuItem>

                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-gray-50 rounded-md transition-colors">
                          <Shield className="h-4 w-4 text-gray-500" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-3 py-2 hover:bg-red-50 rounded-md text-red-600 cursor-pointer transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" asChild className="hover:bg-blue-50 hover:text-blue-600">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md">
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Cart Button */}
            <Button variant="ghost" size="icon" asChild className="relative hover:bg-blue-50 hover:text-blue-600">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-orange-500 to-red-500 border-0">
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-blue-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white/95 backdrop-blur-md">
            <nav className="px-4 py-4 space-y-3">
              {navigationLinks.map((link) => (
                link.hasDropdown ? (
                  <div key={link.label} className="space-y-2">
                    <div className="font-medium text-gray-900 py-2">{link.label}</div>
                    <div className="pl-4 space-y-2">
                      {link.dropdownItems?.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block py-2 text-gray-600 hover:text-blue-600 transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              ))}
              
              {!isAuthenticated && (
                <div className="pt-4 border-t space-y-2">
                  <Link
                    href="/login"
                    className="block py-2 text-gray-700 hover:text-blue-600 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block py-2 text-blue-600 hover:text-blue-700 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
