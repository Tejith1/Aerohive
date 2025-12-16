import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations (bypasses RLS and has full access)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ CRITICAL: Missing environment variables in signup route!')
}

// Initialize lazily or with a check to prevent top-level crash
const getSupabaseAdmin = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    return null
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Signup API called')

    // Validate environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables')
      console.warn('⚠️ Demo Mode: Missing Supabase environment variables')
      console.log('⚠️ Simulating successful signup for demo...')

      // MOCK RESPONSE FOR DEMO
      return NextResponse.json({
        success: true,
        user: {
          id: 'demo-user-id-' + Math.random().toString(36).substring(7),
          email: 'demo@example.com'
        },
        message: 'Demo Account created successfully! (No database connection)'
      })
    }

    const supabaseAdmin = getSupabaseAdmin()
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error: Failed to initialize Supabase admin' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { email, password, firstName, lastName, phone } = body

    console.log('📧 Server-side signup request for:', email)
    console.log('📦 Request body:', { email, firstName, lastName, phone: phone || 'not provided' })

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use admin API to create user (this bypasses CORS and email confirmation for testing)
    console.log('Creating user with admin API...')
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for now to test
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone: phone || null
      }
    })

    if (authError) {
      console.error('❌ Auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    console.log('✅ User created in Auth:', authData.user?.id)

    // Create user profile in database
    if (authData.user) {
      console.log('📝 Creating user profile in database...')
      const { error: profileError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          password_hash: 'managed_by_supabase_auth',
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          is_admin: false,
          is_active: true
        })

      if (profileError) {
        if (profileError.message.includes('duplicate key')) {
          console.log('⚠️ User profile already exists')
        } else {
          console.error('❌ Profile creation error:', profileError)
          return NextResponse.json(
            { error: 'User created but profile setup failed: ' + profileError.message },
            { status: 500 }
          )
        }
      } else {
        console.log('✅ User profile created successfully')
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email
      },
      message: 'Account created successfully!'
    })
  } catch (error: any) {
    console.error('❌ Server error:', error)
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    })
    return NextResponse.json(
      { error: error?.message || 'Registration failed' },
      { status: 500 }
    )
  }
}
