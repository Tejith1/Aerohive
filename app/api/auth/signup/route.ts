import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminWithRetry, withRetry } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Signup API called')

    const supabaseAdmin = getSupabaseAdminWithRetry()

    if (!supabaseAdmin) {
      console.warn('⚠️ Demo Mode: Missing Supabase environment variables')

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

    const body = await request.json()
    const { email, password, firstName, lastName, phone } = body

    console.log('📧 Server-side signup request for:', email)

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use admin API to create user (with retry for network issues)
    console.log('Creating user with admin API...')
    const { data: authData, error: authError } = await withRetry(
      () => supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          phone: phone || null
        }
      }),
      3,
      'user auth creation'
    )

    if (authError) {
      console.error('❌ Auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    console.log('✅ User created in Auth:', authData.user?.id)

    // Create user profile in database (with retry)
    if (authData.user) {
      console.log('📝 Creating user profile in database...')
      const { error: profileError } = await withRetry(
        () => (supabaseAdmin.from('users') as any)
          .insert({
            id: authData.user.id,
            email: authData.user.email!,
            password_hash: 'managed_by_supabase_auth',
            first_name: firstName,
            last_name: lastName,
            phone: phone || null,
            is_admin: false,
            is_active: true
          }),
        3,
        'user profile insert'
      ) as any

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
    console.error('❌ Server error:', error?.message || error)
    return NextResponse.json(
      { error: error?.message || 'Registration failed' },
      { status: 500 }
    )
  }
}
