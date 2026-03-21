import { NextRequest, NextResponse } from 'next/server'

/**
 * Aerohive SMS Notification API
 * This route handles sending SMS alerts to clients and pilots.
 * Currently implemented with simulation mode; can be easily 
 * integrated with Twilio, Msg91, or Fast2SMS.
 */

const FONOSTER_PROJECT_ID = process.env.FONOSTER_PROJECT_ID
const FONOSTER_TOKEN = process.env.FONOSTER_TOKEN
const FONOSTER_PHONE_NUMBER = process.env.FONOSTER_PHONE_NUMBER

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

        // 1. If Fonoster keys are present, use Fonoster
        if (FONOSTER_TOKEN && FONOSTER_PHONE_NUMBER) {
            try {
                // Using Fonoster REST API
                const res = await fetch(`https://api.fonoster.com/v1/sms`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${FONOSTER_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        from: FONOSTER_PHONE_NUMBER,
                        to: cleanTo,
                        message: message,
                    })
                })

                if (!res.ok) {
                    const errorData = await res.json()
                    throw new Error(errorData.message || 'Fonoster delivery failure')
                }

                console.log(`✅ [Fonoster] SMS sent to ${cleanTo}`)
                return NextResponse.json({ success: true, provider: 'fonoster' })
            } catch (error: any) {
                console.error('❌ Fonoster SMS failed, falling back to simulation:', error.message)
            }
        }

        // 2. Default: Simulation/Logging (for development)
        console.log('📱 [Simulation] Outgoing SMS:')
        console.log(`   To: ${cleanTo}`)
        console.log(`   Message: ${message}`)
        
        return NextResponse.json({
            success: true,
            simulated: true,
            message: 'SMS simulated (configure FONOSTER_TOKEN/PHONE_NUMBER in .env.local for real sending)',
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
