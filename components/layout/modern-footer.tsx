"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  ArrowRight, 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Linkedin,
  Plane,
  Shield,
  Award,
  Headphones
} from "lucide-react"

export function ModernFooter() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    products: [
      { href: "/products", label: "All Drones" },
      { href: "/categories/professional", label: "Professional Drones" },
      { href: "/categories/racing", label: "Racing Drones" },
      { href: "/categories/photography", label: "Photography Drones" },
      { href: "/categories/accessories", label: "Accessories" },
    ],
    services: [
      { href: "/drone-services", label: "Drone Services" },
      { href: "/repair-services", label: "Repair & Maintenance" },
      { href: "/training", label: "Training Programs" },
      { href: "/support", label: "Technical Support" },
      { href: "/warranty", label: "Warranty" },
    ],
    company: [
      { href: "/about", label: "About AeroHive" },
      { href: "/contact", label: "Contact Us" },
      { href: "/careers", label: "Careers" },
      { href: "/press", label: "Press Kit" },
      { href: "/blog", label: "Blog" },
    ],
    support: [
      { href: "/help", label: "Help Center" },
      { href: "/shipping", label: "Shipping Info" },
      { href: "/returns", label: "Returns & Refunds" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  }

  const socialLinks = [
    { href: "https://facebook.com", label: "Facebook", icon: Facebook },
    { href: "https://twitter.com", label: "Twitter", icon: Twitter },
    { href: "https://instagram.com", label: "Instagram", icon: Instagram },
    { href: "https://youtube.com", label: "YouTube", icon: Youtube },
    { href: "https://linkedin.com", label: "LinkedIn", icon: Linkedin },
  ]

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-700">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6">
              <Plane className="h-16 w-16 mx-auto text-blue-400 animate-float" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Stay in the <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Loop</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Get exclusive access to new drone releases, expert tips, and special offers for aviation enthusiasts.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-6">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 rounded-xl py-3"
              />
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-gray-400">
              Join 50,000+ drone pilots worldwide. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <div className="text-white font-bold text-xl">A</div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-2xl bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  AeroHive
                </span>
                <span className="text-sm text-gray-400 font-medium -mt-1">Professional Drones</span>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed mb-6">
              Leading provider of professional-grade drones and aviation solutions. 
              Trusted by pilots worldwide for cutting-edge technology and exceptional support.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Shield className="h-4 w-4 text-green-400" />
                <span>Secure Shopping</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Award className="h-4 w-4 text-yellow-400" />
                <span>Award Winning</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Headphones className="h-4 w-4 text-blue-400" />
                <span>24/7 Support</span>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="h-5 w-5 text-blue-400" />
                <span>support@aerohive.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="h-5 w-5 text-green-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="h-5 w-5 text-red-400" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white">Products</h3>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white">Services</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-6 text-white">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © {currentYear} AeroHive Drones. All rights reserved. | Built with passion for aviation excellence.
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.href}
                    href={social.href}
                    className="h-10 w-10 rounded-xl bg-gray-800/50 hover:bg-gradient-to-br hover:from-blue-600 hover:to-indigo-600 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Additional Links */}
          <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6 pt-6 border-t border-gray-800">
            <Link href="/sitemap" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Sitemap
            </Link>
            <Link href="/accessibility" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Accessibility
            </Link>
            <Link href="/security" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Security
            </Link>
            <Link href="/cookies" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}