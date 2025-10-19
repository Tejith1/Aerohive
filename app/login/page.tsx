"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Headphones, ArrowRight, Shield, CheckCircle, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading: authLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      await login(formData.email, formData.password)
      // The login function handles redirection
    } catch (error: any) {
      // Error handling is done in the auth context
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-purple-100/20"></div>
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-br from-blue-50 to-transparent rounded-full blur-3xl transform translate-x-1/4 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-indigo-50 to-transparent rounded-full blur-3xl transform -translate-x-1/4 translate-y-1/4"></div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <Link href="/" className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
            <div className="text-white font-bold text-xl">A</div>
          </div>
          <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AeroHive
          </span>
        </Link>
        
        <Link href="/register">
          <Button variant="ghost" className="text-gray-600 hover:text-gray-800">
            Don't have an account?
          </Button>
        </Link>
      </div>

      <main className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-16 max-w-6xl w-full items-center">
          {/* Left side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-lg rounded-3xl overflow-hidden">
              <CardHeader className="text-center pb-6 pt-12 px-12">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg mb-6">
                  <Headphones className="text-white h-8 w-8" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 mb-3">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  Sign in to your account to continue your audio journey
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="px-12 pb-8 space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="h-14 pl-12 pr-4 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-300"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="h-14 pl-12 pr-12 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-300"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-lg hover:bg-gray-100"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="remember"
                        checked={formData.rememberMe}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))}
                        className="rounded-md"
                      />
                      <Label htmlFor="remember" className="text-sm font-medium text-gray-600">
                        Remember me
                      </Label>
                    </div>
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </CardContent>

                <CardFooter className="px-12 pb-12 pt-4">
                  <div className="w-full space-y-6">
                    <Button 
                      type="submit" 
                      className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                      {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
                    </Button>

                    <div className="text-center">
                      <Link
                        href="/register"
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Don't have an account? <span className="font-semibold text-blue-600 hover:text-blue-700">Create one</span>
                      </Link>
                    </div>

                    <div className="text-center">
                      <Link
                        href="/admin/login"
                        className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Admin Portal
                      </Link>
                    </div>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Right side - Benefits */}
          <div className="hidden lg:block">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Experience Premium <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Audio</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed max-w-md mx-auto">
                Join thousands of audiophiles who trust AeroHive for their professional audio needs
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Quality Guaranteed</h3>
                  <p className="text-gray-600">Studio-grade audio equipment with professional certification and lifetime support.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Secure & Private</h3>
                  <p className="text-gray-600">Your personal data is protected with enterprise-grade encryption and privacy controls.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Headphones className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Expert Support</h3>
                  <p className="text-gray-600">24/7 technical assistance from certified audio engineers and product specialists.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}