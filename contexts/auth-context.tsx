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
  const [isProfileFetching, setIsProfileFetching] = useState(false) // Lock to prevent redundant fetches
  const router = useRouter()

  const isAuthenticated = !!user
  const isAdmin = user?.is_admin || false

  // Handle visibility change - refresh session when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Tab became visible, checking session...')
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session && !user) {
            console.log('🔄 Session exists but user not loaded, refreshing...')
            await initializeAuth()
          }
        } catch (error) {
          console.error('❌ Error checking session on visibility change:', error)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user])

  // Handle online/offline status for connection recovery
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = async () => {
      console.log('🌐 Network restored, refreshing connection...')
      try {
        // Refresh the session first
        const { data, error } = await supabase.auth.refreshSession()
        if (error) {
          console.error('❌ Session refresh failed:', error)
          // Try to reinitialize auth
          await initializeAuth()
        } else if (data.session) {
          console.log('✅ Session refreshed successfully')
          await fetchUserProfile()
        }
      } catch (error) {
        console.error('❌ Error recovering connection:', error)
      }
    }

    const handleOffline = () => {
      console.log('📴 Network lost - app will retry when connection is restored')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Initialize auth state
  useEffect(() => {
    initializeAuth()

    // Listen for auth changes
    const { data } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('🔔 Auth state change:', event, session?.user?.email)

        if (event === 'SIGNED_IN' && session) {
          console.log('📊 User signed in, syncing profile...')
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
          setIsLoading(false)
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('📊 Token refreshed successfully')
        }
      }
    )

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  const initializeAuth = async () => {
    try {
      console.log('🔄 Initializing auth...')
      console.log('🔍 Checking localStorage for session...')

      // Check if we have a stored session
      const storedSession = typeof window !== 'undefined'
        ? localStorage.getItem('sb-aerohive-auth-token')
        : null
      console.log('💾 Stored session:', storedSession ? 'Found' : 'Not found')

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('❌ Session error:', sessionError)
        console.error('❌ Error details:', JSON.stringify(sessionError, null, 2))

        // Try to refresh the session if we have a stored token
        if (storedSession) {
          console.log('🔄 Attempting session refresh...')
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
          if (!refreshError && refreshData.session) {
            console.log('✅ Session refreshed successfully')
            await fetchUserProfile()
            return
          }
        }

        setUser(null)
        setIsLoading(false)
        return
      }

      if (session?.user) {
        console.log('✅ Session found:', session.user.email)
        console.log('🔑 Session expires at:', new Date(session.expires_at! * 1000).toLocaleString())
        await fetchUserProfile()
      } else {
        console.log('ℹ️ No active session')
        setUser(null)
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error)
      console.error('❌ Full error:', JSON.stringify(error, null, 2))
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserProfile = async (retryCount = 0) => {
    // Prevent multiple simultaneous profile fetches
    if (isProfileFetching) {
      console.log('⚠️ Profile fetch already in progress, skipping...')
      return
    }

    try {
      setIsProfileFetching(true)
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        if (authError) console.error('❌ Auth user error:', authError)
        setUser(null)
        setIsLoading(false)
        return
      }

      console.log('🔍 Syncing user profile via API...', authUser.email)

      // Get user profile from our secure API (handles create-if-not-exists)
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: authUser.id,
          email: authUser.email,
          firstName: authUser.user_metadata?.full_name?.split(' ')[0] || authUser.user_metadata?.first_name || 'User',
          lastName: authUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || authUser.user_metadata?.last_name || '',
          phone: authUser.phone || authUser.user_metadata?.phone || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to sync profile')
      }

      const { profile } = await response.json()
      console.log('✅ User profile synced:', profile?.email)
      setUser(profile)
    } catch (error: any) {
      console.error('❌ Error syncing user profile:', error)

      // Retry once on network/connection issues
      if (retryCount < 1) {
        console.log('🔄 Retrying profile sync in 2s...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        setIsProfileFetching(false)
        return fetchUserProfile(retryCount + 1)
      }
    } finally {
      setIsProfileFetching(false)
      setIsLoading(false)
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
        throw error
      }

      if (data.user) {
        // fetchUserProfile will sync profile via API and set user state
        await fetchUserProfile()

        // Use the auth session user role for immediate redirect if needed, 
        // or wait for the synced user state. For robustness, we check the email.
        const isAdminEmail = data.user.email === 'admin1@gmail.com' || data.user.email === 'admin@aerohive.com'

        toast({
          title: "Welcome back!",
          description: isAdminEmail ? "Signed in as Administrator" : "Successfully signed in",
          className: "border-green-200 bg-green-50 text-green-900",
          duration: 3000,
        })

        if (isAdminEmail) {
          router.push('/admin')
        } else {
          router.push('/')
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      })
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