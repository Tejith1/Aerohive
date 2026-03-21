import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Aerohive Phone Verification API
 * Generates and sends an OTP to a phone number.
 */

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { phone } = body

        if (!phone) {
            return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 })
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const baseUrl = request.nextUrl.origin

        console.log(`🔑 Generating OTP for ${phone}: ${otp}`)

        // Save to database
        const { error: dbError } = await supabase
            .from('phone_verifications')
            .insert({
                phone,
                code: otp,
                expires_at: new Date(Date.now() + 10 * 60000).toISOString()
            })

        if (dbError) {
            console.error('❌ Database error saving OTP:', dbError)
            return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
        }

        // Send SMS via our internal SMS API
        try {
            const smsRes = await fetch(`${baseUrl}/api/send-sms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: phone,
                    message: `AeroHive: Your verification code is ${otp}. Valid for 10 minutes.`
                })
            })
            const smsData = await smsRes.json()
            if (!smsData.success) {
                console.error('❌ SMS failed:', smsData.error)
            }
        } catch (smsErr) {
            console.error('❌ Failed to call SMS API:', smsErr)
        }
        
        return NextResponse.json({
            success: true,
            message: 'OTP sent successfully!',
            // WARNING: Remove 'otp' from response in production!
            otp: process.env.NODE_ENV === 'development' ? otp : 'SENT'
        })

    } catch (error: any) {
        console.error('Send OTP API Error:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
