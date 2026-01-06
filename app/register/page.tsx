"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, UserPlus, Plane, ArrowRight, Shield, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ModernHeader } from "@/components/layout/modern-header"
import { ModernFooter } from "@/components/layout/modern-footer"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser, signInWithGoogle } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    subscribeNewsletter: false,
  })

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle()
      // Supabase will handle the redirect
    } catch (error) {
      console.error('Google sign-up failed:', error)
      toast({
        title: "Sign-up Failed",
        description: "Failed to sign up with Google. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive"
      })
      return
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Error", 
        description: "Please agree to the terms and conditions",
        variant: "destructive"
      })
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      console.log('🔵 Starting registration process...')
      console.log('📧 Email:', formData.email)
      console.log('👤 Name:', formData.firstName, formData.lastName)
      console.log('🌐 Browser online:', navigator.onLine)
      console.log('🔗 Current origin:', window.location.origin)
      
      await registerUser(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.phone
      )
      console.log('✅ Registration completed successfully!')
      // The register function handles redirection and toast messages
    } catch (error: any) {
      console.error('❌ Registration failed in form handler')
      console.error('Error type:', typeof error)
      console.error('Error name:', error?.name)
      console.error('Error message:', error?.message)
      console.error('Error stack:', error?.stack)
      console.error('Full error:', error)
      
      // Check if it's actually a network/fetch error (not an auth error)
      const isNetworkError = 
        error?.name === 'TypeError' || 
        error?.message?.toLowerCase().includes('fetch') ||
        error?.message?.toLowerCase().includes('network') ||
        !error?.message
      
      if (isNetworkError) {
        console.error('🔴 Detected network error - Supabase may be unreachable')
        toast({
          title: "Connection Failed",
          description: "Unable to reach authentication server. Please check your internet connection or try again in a moment.",
          variant: "destructive"
        })
      }
      // Otherwise, auth context already handled the error toast
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-purple-100/20"></div>
      
      <ModernHeader />

      <main className="flex-1 flex items-center justify-center py-20 px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl w-full items-center">
          {/* Left side - Marketing content */}
          <div className="hidden lg:block space-y-8 animate-fade-in-scale">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <Sparkles className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-700">Join 50,000+ pilots worldwide</span>
              </div>
              
              <h1 className="text-5xl font-bold tracking-tight">
                <span className="block text-gray-900">Start Your</span>
                <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Aerial Journey
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Create your account and get access to premium drones, expert support, and exclusive pilot community.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {[
                { icon: Shield, title: "Secure & Trusted", description: "Your data is encrypted and protected" },
                { icon: Plane, title: "Premium Products", description: "Access to latest drone technology" },
                { icon: Sparkles, title: "Expert Support", description: "24/7 assistance from drone specialists" }
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-gray-100">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Registration form */}
          <Card className="w-full border-0 shadow-2xl bg-white/95 backdrop-blur-sm animate-slide-in-right">
            <CardHeader className="text-center pb-6 pt-8">
              <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <UserPlus className="text-white h-8 w-8" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Create Account
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Join AeroHive and start your drone journey today
              </CardDescription>
            </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 px-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="h-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="h-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
                  required
                />
                <p className="text-xs text-gray-500">Use a real email address to receive confirmation link</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone <span className="text-gray-400">(Optional)</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Must be at least 6 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="h-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-lg pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                    className="mt-0.5"
                    required
                  />
                  <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                    I agree to the{" "}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="newsletter"
                    checked={formData.subscribeNewsletter}
                    onCheckedChange={(checked) => setFormData({ ...formData, subscribeNewsletter: checked as boolean })}
                    className="mt-0.5"
                  />
                  <Label htmlFor="newsletter" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                    Subscribe to our newsletter for drone updates and exclusive offers
                  </Label>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pb-8 pt-6 px-8">
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or sign up with</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleGoogleSignup}
                variant="outline"
                className="w-full h-12 flex items-center justify-center gap-3 border-2 border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all duration-300"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google logo"
                  className="w-5 h-5"
                />
                <span>Sign up with Google</span>
              </Button>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
        </div>
      </main>

      <ModernFooter />
    </div>
  )
}
