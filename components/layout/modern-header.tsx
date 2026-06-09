"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
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
  Sun,
  Moon,
  Package
} from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { useAuth } from "@/contexts/auth-context"
import {
  DronesIcon,
  CategoriesIcon,
  DronePilotsIcon,
  ServicesIcon,
  AboutIcon,
  ContactIcon,
  AdminPanelIcon,
  MyOrdersIcon
} from "@/components/ui/custom-icons"
import { NotificationDropdown } from "./notification-dropdown"
import { useTheme } from "next-themes"

export function ModernHeader() {
  const { getTotalItems } = useCartStore()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const cartItemCount = getTotalItems()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null)

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

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
      label: "Drones",
      icon: DronesIcon,
      hasMegaMenu: true,
      columns: [
        {
          title: "Drone Fleet",
          items: [
            { href: "/products?category=Enterprise", label: "Enterprise Fleet", desc: "Heavy-duty payload carriers" },
            { href: "/products?category=Photography", label: "Cinematic Drones", desc: "Ultra-HD aerial cameras" },
            { href: "/products?category=Racing", label: "FPV & Speed Drones", desc: "High-velocity modular racing" },
            { href: "/products?category=Agriculture", label: "Agricultural Drones", desc: "Automated crop spraying systems" }
          ]
        },
        {
          title: "Key Features",
          items: [
            { href: "/login", label: "Real-Time Telemetry", desc: "Live speed & battery analysis" },
            { href: "/register", label: "Airspace Safety", desc: "DGCA compliant zoning guides" },
            { href: "/categories", label: "Autopilot Guidance", desc: "Waypoints & autonomous routes" }
          ]
        },
        {
          title: "Models",
          items: [
            { href: "/products", label: "Hive-X Sonnet ↗", desc: "Standard commercial flyer" },
            { href: "/products", label: "Hive-Pro Opus ↗", desc: "Premium multi-spectral flagship" },
            { href: "/products", label: "Hive-Mini Haiku ↗", desc: "Compact inspection drone" }
          ]
        }
      ]
    },
    {
      href: "/categories",
      label: "Categories",
      icon: CategoriesIcon
    },
    {
      href: "/drone-pilots",
      label: "Drone Pilots",
      icon: DronePilotsIcon
    },
    {
      href: "#",
      label: "Services",
      icon: ServicesIcon,
      hasMegaMenu: true,
      columns: [
        {
          title: "Drone Services",
          items: [
            { href: "/drone-services", label: "Air Telemetry Analysis", desc: "Deep sensor data extraction" },
            { href: "/training", label: "Pilot Certification", desc: "DGCA test preparation course" },
            { href: "/drone-services", label: "Enterprise Solutions", desc: "Custom hardware consultations" }
          ]
        },
        {
          title: "Maintenance",
          items: [
            { href: "/repair-services", label: "Hardware Diagnostics", desc: "Propeller & rotor balancing" },
            { href: "/repair-services", label: "Sensor Calibration", desc: "IMU & compass alignment check" }
          ]
        }
      ]
    },
    {
      href: "/about",
      label: "About",
      icon: AboutIcon
    },
    {
      href: "/contact",
      label: "Contact",
      icon: ContactIcon
    }
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-500 ${scrolled
      ? 'bg-background/90 backdrop-blur-xl shadow-sm border-b border-border py-2'
      : 'bg-transparent py-4'
      }`}>
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group shrink-0" aria-label="AeroHive Home">
            <span className="text-xl font-bold tracking-tight">AeroHive</span>
          </Link>

          {/* Desktop Navigation with Claude-Style Hover Mega Menus */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationLinks.map((link) => (
              link.hasMegaMenu ? (
                <div
                  key={link.label}
                  className="relative py-2.5"
                  onMouseEnter={() => setHoveredMenu(link.label)}
                  onMouseLeave={() => setHoveredMenu(null)}
                >
                  <button className="flex items-center space-x-2 text-foreground hover:text-primary hover:bg-primary/5 font-sans text-[15px] font-semibold tracking-wide px-4 py-2 rounded-xl cursor-pointer border-0 bg-transparent transition-all duration-300">
                    {link.icon && <link.icon className="h-4.5 w-4.5 text-muted-foreground group-hover:text-primary transition-colors" />}
                    <span>{link.label}</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${hoveredMenu === link.label ? 'rotate-180 text-primary' : ''}`} />
                  </button>

                  {/* AnimatePresence framer motion dropdown panel */}
                  <AnimatePresence>
                    {hoveredMenu === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`absolute top-full mt-2 bg-[#f7f5f0] dark:bg-[#181816] border border-border rounded-[28px] shadow-md p-8 z-[1000] flex gap-10 text-left ${
                          link.label === "Drones"
                            ? "left-[-100px] xl:left-[-180px] w-[720px]"
                            : "left-1/2 -translate-x-1/2 w-[520px]"
                        }`}
                      >
                        {link.columns?.map((col, idx) => (
                          <div key={idx} className="flex-1 space-y-4">
                            <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest font-sans">
                              {col.title}
                            </h4>
                            <div className="space-y-4">
                              {col.items.map((item, itemIdx) => (
                                <Link
                                  key={itemIdx}
                                  href={item.href}
                                  className="block group/item transition-colors"
                                  onClick={() => setHoveredMenu(null)}
                                >
                                  <p className="text-[14px] font-semibold text-foreground group-hover/item:text-primary font-sans transition-colors">
                                    {item.label}
                                  </p>
                                  {item.desc && (
                                    <p className="text-[12px] text-muted-foreground font-sans mt-0.5 leading-relaxed font-normal">
                                      {item.desc}
                                    </p>
                                  )}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Button
                  key={link.href}
                  variant="ghost"
                  asChild
                  className="text-foreground hover:text-primary hover:bg-primary/5 font-sans text-[15px] font-semibold tracking-wide transition-all duration-300 rounded-xl px-4 py-2 relative group cursor-pointer"
                >
                  <Link href={link.href} className="flex items-center space-x-2">
                    {link.icon && <link.icon className="h-4.5 w-4.5 text-muted-foreground group-hover:text-primary transition-colors" />}
                    <span>{link.label}</span>
                    <span className="absolute bottom-1 w-0 h-[3px] bg-primary transition-all duration-300 group-hover:w-8 rounded-full"></span>
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
              className="hidden md:flex h-10 w-10 rounded-xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all duration-200"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {/* Notifications */}
                <NotificationDropdown />

                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all duration-200 cursor-pointer"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  aria-label="Toggle Theme"
                >
                  {mounted && theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 p-2 rounded-xl hover:bg-primary/5 transition-all duration-200 group" aria-label="User Menu">
                      <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
                        {user?.first_name ? user.first_name[0].toUpperCase() : "U"}
                      </div>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-semibold text-foreground">
                          {user?.first_name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user?.is_admin ? "Admin" : "Premium Member"}
                        </p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 p-3 bg-card border border-border rounded-2xl shadow-md">
                    <div className="px-3 py-4 border-b border-border mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center">
                          {user?.first_name ? user.first_name[0].toUpperCase() : "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {user?.first_name || "User"} {user?.last_name || ""}
                          </p>
                          <p className="text-sm text-muted-foreground">{user?.email || "No email"}</p>
                        </div>
                      </div>
                    </div>

                    <DropdownMenuItem asChild>
                      <Link href="/account" className="flex items-center space-x-3 w-full px-3 py-3 hover:bg-muted rounded-xl transition-all duration-200">
                        <User className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium text-foreground">My Account</div>
                          <div className="text-sm text-muted-foreground">Profile & Settings</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="flex items-center space-x-3 w-full px-3 py-3 hover:bg-muted rounded-xl transition-all duration-200">
                        <MyOrdersIcon className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium text-foreground">My Orders</div>
                          <div className="text-sm text-muted-foreground">Track & Manage</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>

                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center space-x-3 w-full px-3 py-3 hover:bg-primary/10 rounded-xl transition-all duration-200">
                          <AdminPanelIcon className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium text-primary">Admin Dashboard</div>
                            <div className="text-sm text-muted-foreground">Manage Platform</div>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <div className="border-t border-border mt-2 pt-2">
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-3 py-3 hover:bg-red-500/10 rounded-xl text-red-650 dark:text-red-400 cursor-pointer transition-all duration-200"
                      >
                        <LogOut className="h-5 w-5" />
                        <div>
                          <div className="font-medium">Sign Out</div>
                          <div className="text-sm text-red-400">Logout from account</div>
                        </div>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Theme Toggle for Guests */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all duration-200 cursor-pointer"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  aria-label="Toggle Theme"
                >
                  {mounted && theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  asChild
                  className="hidden md:flex hover:bg-primary/5 text-foreground hover:text-primary font-sans text-[15px] font-semibold tracking-wide rounded-xl px-4 py-2 transition-all duration-200"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="bg-primary hover:bg-primary/95 text-white rounded-full px-6 py-2 font-sans text-[15px] font-semibold tracking-wide transition-all duration-300 border-0"
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
              className="relative h-10 w-10 rounded-xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all duration-200"
              aria-label="Shopping Cart"
            >
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary text-white border-0 animate-bounce-in shadow-sm">
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-10 w-10 rounded-xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="lg:hidden border-t border-border bg-card mt-1 rounded-b-2xl shadow-md overflow-hidden"
          >
            <nav className="p-5 space-y-2">
              {navigationLinks.map((link) => (
                link.hasMegaMenu ? (
                  <div key={link.label} className="space-y-2">
                    <div className="font-semibold text-foreground px-3 py-2 text-sm uppercase tracking-wider flex items-center gap-2">
                      {link.icon && <link.icon className="h-4.5 w-4.5 text-primary" />}
                      <span>{link.label}</span>
                    </div>
                    <div className="pl-4 space-y-2">
                      {link.columns?.flatMap(col => col.items).map((item, itemIdx) => (
                        <Link
                          key={itemIdx}
                          href={item.href}
                          className="flex items-center space-x-3 py-2.5 text-muted-foreground hover:text-primary transition-all rounded-xl hover:bg-primary/5 px-3"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <span className="text-sm font-semibold">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center space-x-3 py-3 px-3 text-foreground hover:text-primary font-medium transition-all rounded-xl hover:bg-primary/5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.icon && <link.icon className="h-4.5 w-4.5 text-muted-foreground" />}
                    <span>{link.label}</span>
                  </Link>
                )
              ))}

              {!isAuthenticated && (
                <div className="pt-4 border-t border-border space-y-2">
                  <Link
                    href="/login"
                    className="block text-center py-3 px-3 text-foreground hover:text-primary font-medium rounded-xl hover:bg-primary/5 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="block text-center py-3 px-3 text-white bg-primary font-medium rounded-xl hover:shadow-md transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* Mobile Theme Toggle */}
              <div className="pt-4 border-t border-border flex items-center justify-between px-3">
                <span className="text-sm font-semibold text-foreground">
                  {mounted && theme === "dark" ? "Dark Mode" : "Light Mode"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all duration-200 cursor-pointer"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  aria-label="Toggle Theme"
                >
                  {mounted && theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}