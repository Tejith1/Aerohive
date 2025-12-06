"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase, getCurrentUser } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  is_admin: boolean
  phone?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error: any } | void>
  signInWithGoogle: () => Promise<void>
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: any } | void>
  register: (email: string, password: string, firstName: string, lastName: string, phone?: string) => Promise<void>
  logout: () => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user
  const isAdmin = user?.is_admin || false

  // Initialize auth state
  useEffect(() => {
    initializeAuth()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state change:', event, session?.user?.email)
        
        // Only handle specific events, don't redirect on every change
        if (event === 'SIGNED_IN' && session) {
          console.log('📊 User signed in, fetching profile...')
          await fetchUserProfile()
          
          // Check if this is an OAuth sign-in (Google, etc.)
          const provider = session.user.app_metadata?.provider
          if (provider === 'google') {
            toast({
              title: "✅ Welcome!",
              description: "You've successfully signed in with Google.",
              className: "border-green-200 bg-green-50 text-green-900",
              duration: 5000,
            })
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('📊 User signed out')
          setUser(null)
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('📊 Token refreshed')
          // Don't fetch profile on token refresh to avoid loops
        } else if (event === 'USER_UPDATED') {
          console.log('📊 User updated')
          await fetchUserProfile()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const initializeAuth = async () => {
    try {
      console.log('🔄 Initializing auth...')
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError)
        setUser(null)
        setIsLoading(false)
        return
      }

      if (session?.user) {
        console.log('✅ Session found:', session.user.email)
        await fetchUserProfile()
      } else {
        console.log('ℹ️ No active session')
        setUser(null)
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      console.log('🔍 Fetching user profile...', authUser?.email)
      
      if (authUser) {
        // Get user profile from users table
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (error) {
          console.error('❌ Error fetching user profile:', error)
          // If profile doesn't exist, user might need to complete registration
          return
        }

        console.log('✅ User profile loaded:', userProfile?.email)
        setUser(userProfile)
      } else {
        console.log('❌ No auth user found')
        setUser(null)
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Login error details:', error)
        
        // Special handling for email not confirmed
        if (error.message === 'Email not confirmed') {
          toast({
            title: "Email Not Confirmed",
            description: "Please check your email and click the confirmation link. If you don't see the email, contact support.",
            variant: "destructive",
          })
          
          // For admin accounts, show additional help
          if (email === 'admin1@gmail.com' || email === 'admin@aerohive.com') {
            toast({
              title: "Admin Account Issue",
              description: "Admin email needs to be confirmed in Supabase dashboard. Contact the system administrator.",
              variant: "destructive",
            })
          }
        } else if (error.message === 'Invalid login credentials') {
          toast({
            title: "Invalid Credentials",
            description: "The email or password you entered is incorrect. Please try again.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Login Failed",
            description: error.message || "An unexpected error occurred during login.",
            variant: "destructive",
          })
        }
        throw error
      }

      // Fetch user profile to check role
      if (data.user) {
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single()

        if (!profileError && userProfile) {
          setUser(userProfile)
          
          // Show welcome toast immediately
          toast({
            title: userProfile.is_admin ? "Welcome back, Admin!" : "Welcome back!",
            description: `Signed in as ${userProfile.first_name} ${userProfile.last_name}`,
            className: "border-green-200 bg-green-50 text-green-900",
            duration: 3000,
          })
          
          // Redirect based on user role
          if (userProfile.is_admin) {
            router.push('/admin')
          } else {
            router.push('/')
          }
        } else {
          // If profile doesn't exist, create it
          const { error: createProfileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              password_hash: 'managed_by_supabase_auth',
              first_name: data.user.user_metadata?.first_name || 'User',
              last_name: data.user.user_metadata?.last_name || '',
              is_admin: data.user.email === 'admin1@gmail.com' || data.user.email === 'admin@aerohive.com',
              is_active: true
            })
          
          if (!createProfileError) {
            // Fetch the newly created profile
            const { data: newProfile } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single()
            
            if (newProfile) {
              setUser(newProfile)
              router.push(newProfile.is_admin ? '/admin' : '/')
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.message !== 'Email not confirmed') {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid email or password",
          variant: "destructive",
        })
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, firstName: string, lastName: string, phone?: string) => {
    try {
      setIsLoading(true)
      console.log('🔵 Auth Context: Starting server-side signup...')
      console.log('📧 Email:', email)
      console.log('👤 User data:', { first_name: firstName, last_name: lastName, phone })

      // Call our server-side API endpoint instead of Supabase directly
      // This bypasses CORS issues
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          phone
        })
      })

      const result = await response.json()

      console.log('📦 Server signup response:', result)

      if (!response.ok || result.error) {
        console.error('❌ Server Signup Error Details:', {
          status: response.status,
          statusText: response.statusText,
          error: result.error,
          details: result.details
        })
        const error = new Error(result.error || 'Registration failed')
        
        // Handle specific error cases with user-friendly messages
        if (error.message.includes('User already registered')) {
          toast({
            title: "Email Already Registered",
            description: "This email is already registered. Please try logging in instead.",
            variant: "destructive",
          })
        } else if (error.message.includes('Invalid email') || error.message.includes('email_address_invalid')) {
          toast({
            title: "Invalid Email Address",
            description: "Please use a real email address (Gmail, Outlook, Yahoo, etc.). Test emails like @example.com are not allowed.",
            variant: "destructive",
          })
        } else if (error.message.includes('Password')) {
          toast({
            title: "Weak Password",
            description: "Password must be at least 6 characters long.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Registration Failed",
            description: error.message || "Unable to create account. Please try again.",
            variant: "destructive",
          })
        }
        throw error
      }

      // Success! User created and auto-confirmed
      console.log('✅ Registration successful!')
      
      toast({
        title: "Account Created! 🎉",
        description: result.message || "Welcome to AeroHive! Logging you in...",
        className: "border-green-200 bg-green-50 text-green-900",
      })
      
      // Now log them in
      await login(email, password)
    } catch (error: any) {
      console.error('Registration error:', error)
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      router.push('/')
      toast({
        title: "Logged Out",
        description: "You've been successfully logged out.",
        className: "border-blue-200 bg-blue-50 text-blue-900",
      })
    } catch (error: any) {
      console.error('Logout error:', error)
      toast({
        title: "Logout Failed",
        description: error.message || "Failed to logout",
        variant: "destructive",
      })
    }
  }

  // Google Sign-In
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error
    } catch (error: any) {
      console.error('Google sign-in error:', error)
      toast({
        title: "Sign-in Failed",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      })
      throw error
    }
  }

  // Email sign-in (alias for login)
  const signInWithEmail = async (email: string, password: string) => {
    try {
      await login(email, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  // Email sign-up (wrapper for register)
  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      const [firstName, ...lastNameParts] = fullName.split(' ')
      const lastName = lastNameParts.join(' ') || firstName
      await register(email, password, firstName, lastName)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  // Sign out (alias for logout)
  const signOut = async () => {
    await logout()
  }

  const refreshUser = async () => {
    await fetchUserProfile()
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    signInWithEmail,
    signInWithGoogle,
    signUpWithEmail,
    register,
    logout,
    signOut,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}