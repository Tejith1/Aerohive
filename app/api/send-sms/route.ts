import { NextRequest, NextResponse } from 'next/server'

/**
 * Aerohive SMS Notification API
 * This route handles sending SMS alerts to clients and pilots.
 * Currently implemented with simulation mode; can be easily 
 * integrated with Twilio, Msg91, or Fast2SMS.
 */

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER

interface SMSRequest {
    to: string
    message: string
}

export async function POST(request: NextRequest) {
    try {
        const body: SMSRequest = await request.json()
        const { to, message } = body

        if (!to || !message) {
            return NextResponse.json(
                { success: false, error: 'Recipient and message are required' },
                { status: 400 }
            )
        }

        // Clean phone number (remove spaces, dashes)
        const cleanTo = to.replace(/[\s\-\(\)]/g, '')

        // 1. If Twilio keys are present, use Twilio
        if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER) {
            try {
                const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')
                const res = await fetch(
                    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Basic ${auth}`,
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: new URLSearchParams({
                            To: cleanTo,
                            From: TWILIO_PHONE_NUMBER,
                            Body: message,
                        }).toString()
                    }
                )

                if (!res.ok) {
                    const errorData = await res.json()
                    throw new Error(errorData.message || 'Twilio send failure')
                }

                console.log(`✅ [Twilio] SMS sent to ${cleanTo}`)
                return NextResponse.json({ success: true, provider: 'twilio' })
            } catch (error: any) {
                console.error('❌ Twilio SMS failed, falling back to simulation:', error.message)
            }
        }

        // 2. Default: Simulation/Logging (for development)
        console.log('📱 [Simulation] Outgoing SMS:')
        console.log(`   To: ${cleanTo}`)
        console.log(`   Message: ${message}`)
        
        return NextResponse.json({
            success: true,
            simulated: true,
            message: 'SMS simulated (configure TWILIO_ACCOUNT_SID/AUTH_TOKEN in .env.local for real sending)',
            details: { to: cleanTo, length: message.length }
        })

    } catch (error: any) {
        console.error('SMS API Error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to process SMS request' },
            { status: 500 }
        )
    }
}
