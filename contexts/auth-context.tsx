"use client"

import React, { createContext, useContext, useEffect, useState, useRef } from "react"
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
  provider?: string
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
  updatePassword: (password: string) => Promise<{ error: any } | void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isProfileFetchingRef = useRef(false) // Lock to prevent redundant fetches (useRef for correct async behavior)
  const currentUserIdRef = useRef<string | null>(null) // Track current user ID for account-switch detection
  const isManualLoginRef = useRef(false) // When true, onAuthStateChange skips fetchUserProfile (login() handles it)
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

    // Listen for auth changes (only if supabase is initialized)
    if (!supabase) {
      setIsLoading(false)
      return
    }

    const { data } = supabase.auth.onAuthStateChange(
      async (event: string, session: any) => {
        console.log('🔔 Auth state change:', event, session?.user?.email)

        // Handle both SIGNED_IN and INITIAL_SESSION (PKCE code exchange fires INITIAL_SESSION)
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
          const newUserId = session.user.id
          const previousUserId = currentUserIdRef.current

          // Detect account switch: if a different user signed in, clear old state first
          if (previousUserId && previousUserId !== newUserId) {
            console.log('🔄 Account switch detected:', previousUserId, '->', newUserId)
            setUser(null)
            isProfileFetchingRef.current = false
          }

          currentUserIdRef.current = newUserId

          // If login() or register() is handling the flow, skip duplicate fetch here
          if (isManualLoginRef.current) {
            console.log('📊', event, 'event (manual login in progress, skipping profile fetch here)')
          } else {
            // OAuth or auto-login — inline profile fetch (no lock, no race condition)
            console.log('📊 User signed in (OAuth/auto), syncing profile inline...')
            const authUser = session.user

            let profileSet = false
            try {
              const response = await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: authUser.id,
                  email: authUser.email,
                  firstName: authUser.user_metadata?.full_name?.split(' ')[0] || authUser.user_metadata?.first_name || 'User',
                  lastName: authUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || authUser.user_metadata?.last_name || '',
                  phone: authUser.phone || authUser.user_metadata?.phone || null
                }),
              })

              if (response.ok) {
                const { profile } = await response.json()
                console.log('✅ Profile synced (OAuth/auto):', profile?.email)
                setUser({
                  ...profile,
                  provider: authUser.app_metadata?.provider || 'email'
                })
                profileSet = true
              }
            } catch (profileError) {
              console.warn('⚠️ Profile API failed (OAuth/auto), using fallback:', profileError)
            }

            // Fallback: always set user data even if profile API fails
            if (!profileSet) {
              console.log('📋 Using basic auth user data as fallback (OAuth/auto)')
              setUser({
                id: authUser.id,
                email: authUser.email!,
                first_name: authUser.user_metadata?.full_name?.split(' ')[0] || authUser.user_metadata?.first_name || 'User',
                last_name: authUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || authUser.user_metadata?.last_name || '',
                is_admin: authUser.email === 'admin1@gmail.com' || authUser.email === 'admin@aerohive.com',
                provider: authUser.app_metadata?.provider || 'email'
              })
            }

            setIsLoading(false)

            // Clean up OAuth params from URL now that session is established
            if (typeof window !== 'undefined' && window.location.search) {
              const url = new URL(window.location.href)
              if (url.searchParams.has('code') || url.searchParams.has('error')) {
                console.log('🧹 Cleaning up OAuth params from URL')
                window.history.replaceState({}, '', url.pathname)
              }
            }

            // Check if this is an OAuth sign-in (Google, etc.)
            const provider = authUser.app_metadata?.provider
            if (provider === 'google' && event === 'SIGNED_IN') {
              toast({
                title: "✅ Welcome!",
                description: "You've successfully signed in with Google.",
                className: "border-green-200 bg-green-50 text-green-900",
                duration: 5000,
              })
            }
          }
        } else if (event === 'INITIAL_SESSION' && !session) {
          // No existing session on page load
          console.log('📊 No existing session (INITIAL_SESSION)')
          setUser(null)
          setIsLoading(false)
        } else if (event === 'SIGNED_OUT') {
          console.log('📊 User signed out')
          currentUserIdRef.current = null
          setUser(null)
          isProfileFetchingRef.current = false
          setIsLoading(false)
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('📊 Token refreshed successfully')
        }
      }
    )

    // Realtime subscription for user profile updates
    const channel = supabase.channel('realtime-profile')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
        },
        async (payload: any) => {
          // Only update if it matches current user
          const { data: { user } } = await supabase.auth.getUser()
          if (user && payload.new.id === user.id) {
            console.log('⚡ Realtime Update: User profile changed', payload.new)
            await fetchUserProfile()
          }
        }
      )
      .subscribe()

    return () => {
      data.subscription.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [])

  const initializeAuth = async () => {
    try {
      console.log('🔄 Initializing auth...')

      // Let Supabase handle session retrieval from its own storage — 
      // no manual localStorage reads, avoiding stale token issues
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('❌ Session error:', sessionError)

        // Try to refresh the session as a fallback
        console.log('🔄 Attempting session refresh...')
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
        if (!refreshError && refreshData.session) {
          console.log('✅ Session refreshed successfully')
          currentUserIdRef.current = refreshData.session.user.id
          await fetchUserProfile()
          return
        }

        setUser(null)
        setIsLoading(false)
        return
      }

      if (session?.user) {
        console.log('✅ Session found:', session.user.email)
        console.log('🔑 Session expires at:', new Date(session.expires_at! * 1000).toLocaleString())
        currentUserIdRef.current = session.user.id
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

  const fetchUserProfile = async (retryCount = 0) => {
    // Prevent multiple simultaneous profile fetches
    if (isProfileFetchingRef.current) {
      console.log('⚠️ Profile fetch already in progress, skipping...')
      return
    }

    try {
      isProfileFetchingRef.current = true
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

      if (authError || !authUser) {
        console.log('⚠️ fetchUserProfile: getUser failed', authError?.message || 'No user')
        // Only clear user if it's explicitly a session error (not network)
        if (authError?.message?.includes('network') || authError?.status === 500) {
          console.log('🌐 Network error during profile sync, ignoring logout')
          return
        }
        setUser(null)
        setIsLoading(false)
        return
      }

      console.log('🔍 Syncing user profile via API...', authUser.email)

      // Add a timeout to the profile fetch using AbortController
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        console.warn('⏱️ Profile sync request timed out after 8s')
      }, 8000)

      try {
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
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to sync profile')
        }

        const { profile } = await response.json()
        console.log('✅ User profile synced:', profile?.email)
        setUser({
          ...profile,
          provider: authUser.app_metadata?.provider || 'email'
        })
      } catch (e: any) {
        clearTimeout(timeoutId)
        if (e.name === 'AbortError') {
          console.error('❌ Profile sync aborted due to timeout')
        }
        throw e
      }
    } catch (error: any) {
      console.error('❌ Error syncing user profile:', error)
      console.log('⚠️ Falling back to basic auth user data')

      // Fallback: Use basic auth data so user isn't locked out
      // We need to re-fetch authUser here or pass it down, but simpler to use what we have if possible.
      // Since we can't easily access authUser from checking scope without refactor, 
      // let's do a quick check or just retry. 
      // Actually, better to just set it if we have it. 
      // For now, let's just ensure we don't leave it null if we are retrying.

      // Retry once on network/connection issues
      if (retryCount < 1) {
        console.log('🔄 Retrying profile sync in 2s...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        isProfileFetchingRef.current = false
        return fetchUserProfile(retryCount + 1)
      } else {
        // Final fallback after retries failed
        const { data: { user: fallbackUser } } = await supabase.auth.getUser()
        if (fallbackUser) {
          console.log('✅ Using fallback auth user data')
          setUser({
            id: fallbackUser.id,
            email: fallbackUser.email!,
            first_name: 'User',
            last_name: '',
            is_admin: false,
            provider: fallbackUser.app_metadata?.provider || 'email'
          })
        }
      }
    } finally {
      isProfileFetchingRef.current = false
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Login requested for:', email)
      setIsLoading(true)
      isManualLoginRef.current = true // Tell onAuthStateChange to NOT fetch profile

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ Supabase signIn failed:', error.message)
        throw error
      }

      console.log('✅ Supabase signIn successful:', data.user?.email)

      if (data.user) {
        const authUser = data.user
        currentUserIdRef.current = authUser.id

        // Inline profile fetch — bypasses fetchUserProfile() and lock entirely
        // This guarantees no race condition with onAuthStateChange
        let profileSet = false
        try {
          const response = await fetch('/api/user/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: authUser.id,
              email: authUser.email,
              firstName: authUser.user_metadata?.full_name?.split(' ')[0] || authUser.user_metadata?.first_name || 'User',
              lastName: authUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || authUser.user_metadata?.last_name || '',
              phone: authUser.phone || authUser.user_metadata?.phone || null
            }),
          })

          if (response.ok) {
            const { profile } = await response.json()
            console.log('✅ Profile synced during login:', profile?.email)
            setUser({
              ...profile,
              provider: authUser.app_metadata?.provider || 'email'
            })
            profileSet = true
          }
        } catch (profileError) {
          console.warn('⚠️ Profile API failed during login, using fallback:', profileError)
        }

        // Fallback: always set user data even if profile API fails
        if (!profileSet) {
          console.log('📋 Using basic auth user data as fallback')
          setUser({
            id: authUser.id,
            email: authUser.email!,
            first_name: authUser.user_metadata?.full_name?.split(' ')[0] || authUser.user_metadata?.first_name || 'User',
            last_name: authUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || authUser.user_metadata?.last_name || '',
            is_admin: authUser.email === 'admin1@gmail.com' || authUser.email === 'admin@aerohive.com',
            provider: authUser.app_metadata?.provider || 'email'
          })
        }

        const isAdminEmail = authUser.email === 'admin1@gmail.com' || authUser.email === 'admin@aerohive.com'

        toast({
          title: "Welcome back!",
          description: isAdminEmail ? "Signed in as Administrator" : "Successfully signed in",
          className: "border-green-200 bg-green-50 text-green-900",
          duration: 3000,
        })

        // Let React commit the setUser() state update before navigating
        // Without this, router.push fires before the DOM reflects the new user
        setIsLoading(false)
        await new Promise(resolve => setTimeout(resolve, 100))

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
      isManualLoginRef.current = false
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
        if (error.message.includes('User already registered') || error.message.includes('User already registered')) {
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
      console.log('🔓 Logging out — clearing all session data...')

      // 1. Sign out from Supabase (local scope clears this browser's session without interfering with new logins)
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) {
        console.error('⚠️ Supabase signOut error (continuing cleanup):', error)
      }

      // 2. Clear user state immediately
      setUser(null)
      currentUserIdRef.current = null
      isProfileFetchingRef.current = false

      // 3. Explicitly remove all Supabase-related localStorage keys
      if (typeof window !== 'undefined') {
        // Remove the custom storage key used by our Supabase client
        localStorage.removeItem('sb-aerohive-auth-token')
        // Remove any other Supabase keys that might persist
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.startsWith('sb-') || key === 'oauth_success')) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => {
          console.log('🧹 Removing localStorage key:', key)
          localStorage.removeItem(key)
        })

        // 4. Clear Supabase auth cookies
        document.cookie.split(';').forEach(cookie => {
          const name = cookie.split('=')[0].trim()
          if (name.startsWith('sb-') || name.includes('supabase')) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`
          }
        })
      }

      toast({
        title: "Logged Out",
        description: "You've been successfully logged out.",
        className: "border-blue-200 bg-blue-50 text-blue-900",
      })

      // 5. Hard navigation to destroy all in-memory React state
      console.log('🔄 Hard redirect to home...')
      window.location.href = '/'
    } catch (error: any) {
      console.error('Logout error:', error)
      // Even on error, force cleanup
      setUser(null)
      currentUserIdRef.current = null
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sb-aerohive-auth-token')
      }
      toast({
        title: "Logout Failed",
        description: error.message || "Failed to logout",
        variant: "destructive",
      })
      // Still force a hard redirect to clear state
      window.location.href = '/'
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

  const updatePassword = async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password
      })
      if (error) throw error

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
        className: "border-green-200 bg-green-50 text-green-900",
      })
      return { error: null }
    } catch (error: any) {
      console.error('Password update error:', error)
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      })
      return { error }
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
    refreshUser,
    updatePassword
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