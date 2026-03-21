import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmailDirect, MEDIATOR_EMAIL } from '../../send-email/route'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Aerohive Phone Verification API
 * Generates and sends an OTP via SMS and Email.
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

        // 1. Save to database
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

        // 2. Fetch user's email for the backup notification
        const { data: userData } = await supabase
            .from('users')
            .select('email, first_name')
            .eq('phone', phone)
            .single()

        // 3. Send SMS (async)
        const smsMsg = `AeroHive: Your verification code is ${otp}. Valid for 10 minutes.`
        let smsResult = { success: false, provider: 'none' }
        try {
            const smsRes = await fetch(`${baseUrl}/api/send-sms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: phone, message: smsMsg })
            })
            smsResult = await smsRes.json()
            console.log(`📱 SMS request result for ${phone}:`, JSON.stringify(smsResult))
        } catch (err: any) {
            console.error('❌ SMS Call Failed:', err.message)
            smsResult = { success: false, provider: 'none', error: err.message } as any
        }

        // 4. Send Email Backup (async)
        let emailResult = { success: false, provider: 'none' }
        if (userData?.email) {
            try {
                const res = await sendEmailDirect({
                    to: userData.email,
                    subject: 'AeroHive - Your Verification Code',
                    type: 'client',
                    bookingDetails: {
                        bookingId: 'AUTH-VERIFY',
                        orderUUID: otp,
                        otp: otp,
                        serviceType: 'Mobile Verification',
                        location: 'AeroHive Secure Platform',
                        scheduledAt: new Date().toLocaleString(),
                        chargesNote: `IMPORTANT: Your verification code is ${otp}. Do not share this with anyone.`,
                        trackingLink: `${baseUrl}/account`,
                        acceptJobLink: `${baseUrl}/account`
                    }
                })
                emailResult = res as any
                console.log(`📧 Email backup result for ${userData.email}:`, JSON.stringify(emailResult))
            } catch (emailErr: any) {
                console.error('❌ Backup Email Failed:', emailErr.message)
                emailResult = { success: false, provider: 'gmail', error: emailErr.message } as any
            }
        }

        return NextResponse.json({
            success: true,
            message: emailResult.success ? 'OTP sent to mobile and email!' : 'OTP initiated...',
            sms_status: smsResult,
            email_status: emailResult,
            otp: process.env.NODE_ENV === 'development' ? otp : 'SENT'
        })

    } catch (error: any) {
        console.error('Send OTP API Error:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
