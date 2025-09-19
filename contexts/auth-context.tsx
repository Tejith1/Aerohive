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
  register: (email: string, password: string, firstName: string, lastName: string, phone?: string) => Promise<void>
  logout: () => Promise<void>
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
        if (event === 'SIGNED_IN' && session) {
          await fetchUserProfile()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const initializeAuth = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (currentUser) {
        await fetchUserProfile()
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        // Get user profile from users table
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (error) {
          console.error('Error fetching user profile:', error)
          return
        }

        setUser(userProfile)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
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
          
          // Redirect based on user role
          if (userProfile.is_admin) {
            router.push('/admin')
            toast({
              title: "Welcome back, Admin!",
              description: "You've been redirected to the admin dashboard.",
              className: "border-green-200 bg-green-50 text-green-900",
            })
          } else {
            router.push('/')
            toast({
              title: "Welcome back!",
              description: "You've been successfully logged in.",
              className: "border-green-200 bg-green-50 text-green-900",
            })
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

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation redirect
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phone || null,
            is_admin: false
          }
        }
      })

      if (error) {
        console.error('Registration error:', error)
        
        // Handle specific error cases
        if (error.message.includes('email') && error.message.includes('confirm')) {
          toast({
            title: "Email Confirmation Required",
            description: "Please check your email and click the confirmation link to complete registration.",
            variant: "destructive",
          })
        }
        throw error
      }

      // Insert user profile into users table
      if (data.user) {
        console.log('Creating user profile for:', data.user.id, data.user.email)
        
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            password_hash: 'managed_by_supabase_auth', // Required by schema but not used
            first_name: firstName,
            last_name: lastName,
            phone: phone || null,
            is_admin: email === 'admin1@gmail.com', // Auto-set admin for admin email
            is_active: true
          })

        if (profileError) {
          console.error('Error creating user profile:', profileError)
          
          // Check if it's a duplicate key error (user already exists)
          if (profileError.message.includes('duplicate key') || profileError.code === '23505') {
            console.log('User profile already exists, fetching existing profile...')
            
            // Fetch existing profile
            const { data: existingProfile } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single()
            
            if (existingProfile) {
              setUser(existingProfile)
              toast({
                title: "Welcome back!",
                description: "Your account already exists. You're now logged in.",
                className: "border-green-200 bg-green-50 text-green-900",
              })
              router.push(existingProfile.is_admin ? '/admin' : '/')
              return
            }
          }
          
          toast({
            title: "Profile Creation Failed",
            description: `Account created but profile setup failed: ${profileError.message}. Please try logging in.`,
            variant: "destructive",
          })
        } else {
          console.log('✅ User profile created successfully')
          
          // Set user state and redirect
          const newUser = {
            id: data.user.id,
            email: data.user.email!,
            first_name: firstName,
            last_name: lastName,
            phone: phone || undefined,
            is_admin: email === 'admin1@gmail.com',
          }
          
          setUser(newUser)
          
          toast({
            title: "Account Created Successfully!",
            description: "Welcome to AeroHive! You're now logged in.",
            className: "border-green-200 bg-green-50 text-green-900",
          })
          
          router.push(newUser.is_admin ? '/admin' : '/')
          return
        }
      }

      // Only show this toast if profile creation failed and we're not redirecting
      if (data.user && !user) {
        router.push('/')
        toast({
          title: "Registration Completed!",
          description: "Please check your email for confirmation or try logging in.",
          className: "border-blue-200 bg-blue-50 text-blue-900",
        })
      }
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

  const refreshUser = async () => {
    await fetchUserProfile()
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
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