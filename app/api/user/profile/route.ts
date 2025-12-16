
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const supabaseAdmin = getSupabaseAdmin()
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        const body = await request.json()
        const { userId, email, firstName, lastName, phone } = body

        if (!userId || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        console.log('👤 Fetching profile for:', userId)

        // 1. Try to fetch existing profile
        const { data: profile, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (profile) {
            console.log('✅ Profile found')
            return NextResponse.json({ profile })
        }

        // 2. If not found, create it
        console.log('📝 Profile not found, creating new...', email)
        const { data: newProfile, error: createError } = await supabaseAdmin
            .from('users')
            .insert({
                id: userId,
                email: email,
                password_hash: 'managed_by_supabase_auth',
                first_name: firstName || 'User',
                last_name: lastName || '',
                phone: phone || null,
                is_admin: email === 'admin@aerohive.com' || email.includes('admin'),
                is_active: true
            })
            .select()
            .single()

        if (createError) {
            console.error('❌ Profile creation failed:', createError)
            return NextResponse.json({ error: createError.message }, { status: 500 })
        }

        console.log('✅ Profile created successfully')
        return NextResponse.json({ profile: newProfile })

    } catch (error: any) {
        console.error('❌ API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
