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
        const smsPromise = fetch(`${baseUrl}/api/send-sms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: phone, message: smsMsg })
        }).catch(err => console.error('❌ SMS Call Failed:', err))

        // 4. Send Email Backup (async)
        let emailSent = false
        if (userData?.email) {
            try {
                await sendEmailDirect({
                    to: userData.email,
                    subject: 'AeroHive - Your Verification Code',
                    type: 'client', // Uses client template for code delivery
                    bookingDetails: {
                        bookingId: 'AUTH-VERIFY',
                        orderUUID: otp, // Overloading this for the code display in template if needed
                        otp: otp,
                        serviceType: 'Mobile Verification',
                        location: 'AeroHive Secure Platform',
                        scheduledAt: new Date().toLocaleString(),
                        chargesNote: `IMPORTANT: Your verification code is ${otp}. Do not share this with anyone.`,
                        trackingLink: `${baseUrl}/account`,
                        acceptJobLink: `${baseUrl}/account`
                    }
                })
                emailSent = true
                console.log(`📧 SMS Backup OTP sent to ${userData.email}`)
            } catch (emailErr) {
                console.error('❌ Backup Email Failed:', emailErr)
            }
        }

        return NextResponse.json({
            success: true,
            message: emailSent ? 'OTP sent to mobile and email!' : 'OTP sent to mobile successfully!',
            otp: process.env.NODE_ENV === 'development' ? otp : 'SENT'
        })

    } catch (error: any) {
        console.error('Send OTP API Error:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
