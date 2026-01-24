"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Search,
  Bell,
  Settings,
  Heart,
  Package
} from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { useAuth } from "@/contexts/auth-context"
import { NotificationDropdown } from "./notification-dropdown"

export function ModernHeader() {
  const { getTotalItems } = useCartStore()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const cartItemCount = getTotalItems()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Log user changes for debugging
  useEffect(() => {
    if (user) {
      console.log('👤 Header: User updated:', user.first_name, user.last_name)
    }
  }, [user])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const navigationLinks = [
    {
      href: "/products",
      label: "Products",
      description: "Browse our drone collection"
    },
    {
      href: "/categories",
      label: "Categories",
      description: "Shop by category"
    },
    {
      href: "/drone-pilots",
      label: "Drone Pilots",
      description: "Find certified drone operators"
    },
    {
      href: "#",
      label: "Services",
      hasDropdown: true,
      dropdownItems: [
        { href: "/drone-services", label: "Drone Services", icon: Package },
        { href: "/repair-services", label: "Repair Services", icon: Settings },
        { href: "/training", label: "Training", icon: User }
      ]
    },
    {
      href: "/about",
      label: "About",
      description: "Our story and mission"
    },
    {
      href: "/contact",
      label: "Contact",
      description: "Get in touch"
    }
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
      ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50'
      : 'bg-white/80 backdrop-blur-md'
      }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 bg-white">
                <img
                  src="/WhatsApp Image 2025-10-24 at 13.04.00_647ae0e3.jpg"
                  alt="AeroHive Logo"
                  className="h-full w-full object-contain p-1"
                />
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-all duration-300"></div>
            </div>
            <div className="flex items-center -ml-8">
              <img
                src="/Aerohive text logo scaled up.png"
                alt="AeroHive"
                className="w-auto object-contain"
                style={{ filter: 'none', height: '140px' }}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationLinks.map((link) => (
              link.hasDropdown ? (
                <DropdownMenu key={link.label}>
                  <DropdownMenuTrigger className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium px-3 py-2 rounded-lg cursor-pointer border-0 bg-transparent">
                    <span>{link.label}</span>
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white border rounded-md shadow-md p-1" sideOffset={5}>
                    {link.dropdownItems?.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link
                          href={item.href}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer"
                        >
                          <item.icon className="h-4 w-4 text-gray-500" />
                          <span>{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  key={link.href}
                  variant="ghost"
                  asChild
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium transition-all duration-300 rounded-xl px-4 py-2 relative group"
                >
                  <Link href={link.href}>
                    {link.label}
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 group-hover:w-8 rounded-full"></span>
                  </Link>
                </Button>
              )
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-10 w-10 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all duration-200"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {/* Notifications */}
                <NotificationDropdown />

                {/* Wishlist */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex h-10 w-10 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all duration-200"
                  asChild
                >
                  <Link href="/wishlist">
                    <Heart className="h-5 w-5" />
                  </Link>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
                        {user?.first_name ? user.first_name[0].toUpperCase() : "U"}
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.first_name || "User"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {user?.is_admin ? "Admin" : "Premium Member"}
                        </p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 p-3 bg-white/95 backdrop-blur-lg border border-gray-200/50 rounded-2xl shadow-xl">
                    <div className="px-3 py-4 border-b border-gray-200 mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center">
                          {user?.first_name ? user.first_name[0].toUpperCase() : "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {user?.first_name || "User"} {user?.last_name || ""}
                          </p>
                          <p className="text-sm text-gray-500">{user?.email || "No email"}</p>
                        </div>
                      </div>
                    </div>

                    <DropdownMenuItem asChild>
                      <Link href="/account" className="flex items-center space-x-3 w-full px-3 py-3 hover:bg-gray-50 rounded-xl transition-all duration-200">
                        <User className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">My Account</div>
                          <div className="text-sm text-gray-500">Profile & Settings</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="flex items-center space-x-3 w-full px-3 py-3 hover:bg-gray-50 rounded-xl transition-all duration-200">
                        <Package className="h-5 w-5 text-gray-500" />
                        <div>
                          <div className="font-medium">My Orders</div>
                          <div className="text-sm text-gray-500">Track & Manage</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center space-x-3 w-full px-3 py-3 hover:bg-blue-50 rounded-xl transition-all duration-200">
                          <Settings className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-blue-600">Admin Dashboard</div>
                            <div className="text-sm text-blue-500">Manage Platform</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <div className="border-t border-gray-200 mt-2 pt-2">
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-3 py-3 hover:bg-red-50 rounded-xl text-red-600 cursor-pointer transition-all duration-200"
                      >
                        <LogOut className="h-5 w-5" />
                        <div>
                          <div className="font-medium">Sign Out</div>
                          <div className="text-sm text-red-500">Logout from account</div>
                        </div>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  asChild
                  className="hidden md:flex hover:bg-gray-100 text-gray-700 hover:text-gray-900 font-medium rounded-xl px-4 py-2 transition-all duration-200"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl rounded-xl px-6 py-2 font-medium transition-all duration-300 hover:scale-105"
                >
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="relative h-10 w-10 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all duration-200"
            >
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-r from-orange-500 to-red-500 border-0 animate-bounce-in">
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-10 w-10 rounded-xl hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-lg mt-2 rounded-b-2xl shadow-xl">
            <nav className="p-4 space-y-2">
              {navigationLinks.map((link) => (
                link.hasDropdown ? (
                  <div key={link.label} className="space-y-2">
                    <div className="font-semibold text-gray-900 py-2">{link.label}</div>
                    <div className="pl-4 space-y-2">
                      {link.dropdownItems?.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center space-x-2 py-3 text-gray-600 hover:text-blue-600 transition-colors rounded-xl hover:bg-blue-50 px-3"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block py-3 px-3 text-gray-700 hover:text-blue-600 font-medium transition-colors rounded-xl hover:bg-blue-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              ))}

              {!isAuthenticated && (
                <div className="pt-4 border-t border-gray-200/50 space-y-2">
                  <Link
                    href="/login"
                    className="block py-3 px-3 text-gray-700 hover:text-blue-600 font-medium rounded-xl hover:bg-blue-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="block py-3 px-3 text-white bg-gradient-to-r from-blue-600 to-indigo-600 font-medium rounded-xl hover:shadow-lg transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
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