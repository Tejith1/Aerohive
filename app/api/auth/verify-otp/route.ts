import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { phone, otp } = body

        if (!phone || !otp) {
            return NextResponse.json({ success: false, error: 'Phone and OTP are required' }, { status: 400 })
        }

        console.log(`📱 [Verify] OTP verification request for ${phone}`)

        // Development bypass
        if (process.env.NODE_ENV === 'development' && otp.toString().startsWith('000')) {
            return NextResponse.json({ success: true, verified: true, message: 'Verified (Dev Mode)' })
        }

        // 1. Find the latest valid OTP in the DB
        const { data: records, error: fetchError } = await supabase
            .from('phone_verifications')
            .select('*')
            .eq('phone', phone)
            .eq('code', otp)
            .eq('is_verified', false)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)

        if (fetchError || !records || records.length === 0) {
            console.error('❌ Verification failed - Code not found or expired')
            return NextResponse.json({ success: false, error: 'Invalid or expired OTP code' }, { status: 401 })
        }

        const verificationRecord = records[0]

        // 2. Mark code as used
        const { error: updateVerifyError } = await supabase
            .from('phone_verifications')
            .update({ is_verified: true })
            .eq('id', verificationRecord.id)

        if (updateVerifyError) {
            console.error('❌ Faled to mark code as used:', updateVerifyError)
        }

        // 3. Update the users table to mark phone as verified
        // Note: This updates all users with this phone number.
        const { error: userUpdateError } = await supabase
            .from('users')
            .update({ is_phone_verified: true })
            .eq('phone', phone)

        if (userUpdateError) {
            console.warn('⚠️ OTP verified but failed to update users table:', userUpdateError)
        }

        return NextResponse.json({
            success: true,
            verified: true,
            message: 'Phone number verified successfully!'
        })

    } catch (error: any) {
        console.error('Verify OTP API Error:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
