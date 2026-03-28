
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminWithRetry, withRetry } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
    try {
        const supabaseAdmin = getSupabaseAdminWithRetry()
        if (!supabaseAdmin) {
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } }
            )
        }

        const body = await request.json()
        const { userId, email, firstName, lastName, phone } = body

        if (!userId || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        console.log('👤 Fetching profile for:', userId)

        // 1. Try to fetch existing profile (with retry for network issues)
        const { data: profile, error: fetchError } = await withRetry(
            () => supabaseAdmin
                .from('users')
                .select('*')
                .eq('id', userId)
                .single(),
            3,
            'profile fetch'
        ) as any

        if (profile) {
            console.log('✅ Profile found')
            return NextResponse.json({ profile })
        }

        // 2. If not found, create it (with retry)
        console.log('📝 Profile not found, creating new...', email)
        const { data: newProfile, error: createError } = await withRetry(
            () => (supabaseAdmin.from('users') as any)
                .insert({
                    id: userId,
                    email: email,
                    password_hash: 'managed_by_supabase_auth',
                    first_name: firstName || 'User',
                    last_name: lastName || '',
                    phone: phone || null,
                    is_admin: email === 'admin@aerohive.com' || email === 'admin1@gmail.com',
                    is_active: true
                })
                .select()
                .single(),
            3,
            'profile creation'
        ) as any

        if (createError) {
            console.error('❌ Profile creation failed:', createError)
            return NextResponse.json({ error: createError.message }, { status: 500 })
        }

        console.log('✅ Profile created successfully')
        return NextResponse.json({ profile: newProfile })

    } catch (error: any) {
        console.error('❌ API Error:', error?.message || error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const supabaseAdmin = getSupabaseAdminWithRetry()
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        const body = await request.json()
        const { userId, updates } = body

        if (!userId || !updates) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        console.log('👤 Updating profile for:', userId)

        const { data: updatedProfile, error: updateError } = await withRetry(
            () => (supabaseAdmin.from('users') as any)
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single(),
            3,
            'profile update'
        ) as any

        if (updateError) {
            console.error('❌ Profile update failed:', updateError)
            return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        console.log('✅ Profile updated successfully')
        return NextResponse.json({ profile: updatedProfile })

    } catch (error: any) {
        console.error('❌ API Error:', error?.message || error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
