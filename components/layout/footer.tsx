import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail, Plane, Phone, MapPin, Clock, Youtube, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 to-blue-900 text-white mt-16">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Enhanced Brand Section */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Plane className="text-white h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-2xl">AeroHive</span>
                <span className="text-sm text-blue-200">Professional Drones</span>
              </div>
            </Link>
            <p className="text-blue-100 text-sm leading-relaxed">
              Your premier destination for professional drones and aviation technology. Empowering pilots and businesses with cutting-edge aerial solutions.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-blue-200 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-blue-200 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-blue-200 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-blue-200 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
                <Youtube className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-blue-200 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Drone Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg">Drone Categories</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/categories?filter=racing" className="text-blue-200 hover:text-white transition-colors flex items-center space-x-2">
                  <span>Racing Drones</span>
                </Link>
              </li>
              <li>
                <Link href="/categories?filter=photography" className="text-blue-200 hover:text-white transition-colors flex items-center space-x-2">
                  <span>Photography Drones</span>
                </Link>
              </li>
              <li>
                <Link href="/categories?filter=surveillance" className="text-blue-200 hover:text-white transition-colors flex items-center space-x-2">
                  <span>Surveillance Drones</span>
                </Link>
              </li>
              <li>
                <Link href="/categories?filter=agricultural" className="text-blue-200 hover:text-white transition-colors flex items-center space-x-2">
                  <span>Agricultural Drones</span>
                </Link>
              </li>
              <li>
                <Link href="/categories?filter=mapping" className="text-blue-200 hover:text-white transition-colors flex items-center space-x-2">
                  <span>Mapping Drones</span>
                </Link>
              </li>
              <li>
                <Link href="/categories?filter=beginner" className="text-blue-200 hover:text-white transition-colors flex items-center space-x-2">
                  <span>Beginner Drones</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Services & Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg">Services & Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/training" className="text-blue-200 hover:text-white transition-colors">
                  Training & Certification
                </Link>
              </li>
              <li>
                <Link href="/repair-services" className="text-blue-200 hover:text-white transition-colors">
                  Repair Services
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-blue-200 hover:text-white transition-colors">
                  24/7 Support
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="text-blue-200 hover:text-white transition-colors">
                  Warranty & Insurance
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-blue-200 hover:text-white transition-colors">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-blue-200 hover:text-white transition-colors">
                  About AeroHive
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Hours */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white text-lg">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3 text-blue-200">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <div>
                  <div className="font-medium text-white">1-800-AEROHIVE</div>
                  <div className="text-xs">24/7 Drone Support</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-blue-200">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <div>
                  <div className="font-medium text-white">support@aerohive.com</div>
                  <div className="text-xs">Technical Support</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-blue-200">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <div>
                  <div className="font-medium text-white">Aviation District</div>
                  <div className="text-xs">Global Headquarters</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-blue-200">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <div>
                  <div className="font-medium text-white">24/7 Support</div>
                  <div className="text-xs">Expert assistance anytime</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-bold text-white mb-2">Stay Flight-Ready</h3>
            <p className="text-blue-200 mb-6">
              Get the latest drone technology updates, pilot tips, and exclusive offers
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-sm"
              />
              <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap items-center gap-6 text-sm text-blue-200">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookie Policy
              </Link>
              <Link href="/regulations" className="hover:text-white transition-colors">
                Drone Regulations
              </Link>
            </div>
            <div className="text-sm text-blue-200">
              © 2024 AeroHive. All rights reserved. | Certified drone dealer | FAA compliant operations
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
