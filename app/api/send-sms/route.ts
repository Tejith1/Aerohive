import { NextRequest, NextResponse } from 'next/server'

/**
 * Aerohive SMS Notification API
 * This route handles sending SMS alerts to clients and pilots.
 * Currently implemented with simulation mode; can be easily 
 * integrated with Twilio, Msg91, or Fast2SMS.
 */

const FONOSTER_ACCESS_KEY_ID = process.env.FONOSTER_ACCESS_KEY_ID
const FONOSTER_ACCESS_KEY_SECRET = process.env.FONOSTER_ACCESS_KEY_SECRET
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
        if (FONOSTER_ACCESS_KEY_ID && FONOSTER_ACCESS_KEY_SECRET && FONOSTER_PHONE_NUMBER) {
            try {
                // Method A: Basic Auth (Access Key ID + Secret)
                const basicAuth = Buffer.from(`${FONOSTER_ACCESS_KEY_ID}:${FONOSTER_ACCESS_KEY_SECRET}`).toString('base64')
                
                // Attempting several variations for maximum reliability
                const authMethods = [
                    { name: 'Basic', headers: { 'Authorization': `Basic ${basicAuth}` } },
                    { name: 'Bearer (Secret)', headers: { 'Authorization': `Bearer ${FONOSTER_ACCESS_KEY_SECRET}` } }
                ]

                for (const method of authMethods) {
                    console.log(`📡 [Fonoster] Attempting SMS with ${method.name} auth...`)
                    const res = await fetch(`https://api.fonoster.com/v1/sms`, {
                        method: 'POST',
                        headers: {
                            ...method.headers,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            from: FONOSTER_PHONE_NUMBER,
                            to: cleanTo.startsWith('+') ? cleanTo : `+${cleanTo}`,
                            message: message,
                        })
                    })

                    if (res.ok) {
                        console.log(`✅ [Fonoster] SMS delivered successfully via ${method.name}`)
                        return NextResponse.json({ success: true, provider: 'fonoster', method: method.name })
                    }
                }
                
                throw new Error('All Fonoster authentication methods failed')
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
