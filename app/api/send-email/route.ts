import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD

// Mediator Email Address
export const MEDIATOR_EMAIL = 'aerohive.help@gmail.com'

export interface BookingEmailDetails {
    bookingId: string
    orderUUID: string
    otp: string
    pilotName?: string
    pilotPhone?: string
    pilotEmail?: string
    clientName?: string
    clientPhone?: string
    clientEmail?: string
    serviceType: string
    location: string
    scheduledAt: string
    durationHours?: number
    chargesNote?: string
    requirements?: string
    trackingLink?: string
    acceptJobLink?: string
    googleMapsLink?: string
    estimatedAmount?: string
}

interface EmailRequest {
    to: string
    subject: string
    type: 'client' | 'pilot'
    bookingDetails: BookingEmailDetails
}

// Create Gmail transporter using Nodemailer
export function createGmailTransporter() {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Use SSL
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_APP_PASSWORD?.replace(/\s+/g, '') // Remove spaces from App Password
        },
        tls: {
            rejectUnauthorized: false
        }
    })
}

// Elite HTML Template Generator
export function generateEmailHtml(type: 'client' | 'pilot', d: BookingEmailDetails) {
    if (!d) return ''

    const isPilot = type === 'pilot'
    const bgColor = isPilot ? '#0f172a' : '#f8fafc'
    const accentColor = isPilot ? '#3b82f6' : '#2563eb'
    const title = isPilot ? 'NEW MISSION ASSIGNED' : 'BOOKING CONFIRMED'
    const subtitle = isPilot ? 'A new drone mission is ready for your expertise.' : 'Your professional drone pilot is scheduled.'

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AeroHive - ${title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding-bottom: 40px; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; color: #1e293b; border-radius: 24px; overflow: hidden; margin-top: 40px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
        .header { background-color: ${bgColor}; padding: 48px 40px; text-align: center; }
        .badge { display: inline-block; padding: 6px 12px; background-color: rgba(255,255,255,0.1); border-radius: 100px; color: #94a3b8; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.15); }
        .header h1 { color: #ffffff; font-size: 32px; font-weight: 800; margin: 0; letter-spacing: -0.025em; line-height: 1.1; }
        .header p { color: #94a3b8; font-size: 16px; margin-top: 12px; margin-bottom: 0; }
        .content { padding: 48px 40px; }
        .grid-row { display: flex; flex-wrap: wrap; margin-bottom: 32px; gap: 24px; }
        .grid-item { flex: 1; min-width: 200px; }
        .label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
        .value { font-size: 16px; font-weight: 600; color: #1e293b; }
        .highlight-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px; margin-bottom: 32px; }
        .otp-display { text-align: center; background: linear-gradient(135deg, ${accentColor}, #1d4ed8); border-radius: 16px; padding: 24px; color: white; margin-bottom: 32px; }
        .otp-display span { font-size: 48px; font-weight: 800; letter-spacing: 0.1em; display: block; margin-bottom: 4px; }
        .otp-display p { font-size: 12px; font-weight: 600; opacity: 0.8; margin: 0; text-transform: uppercase; }
        .btn-container { text-align: center; padding-bottom: 48px; }
        .btn { display: inline-block; background-color: ${accentColor}; color: #ffffff !important; padding: 18px 36px; border-radius: 16px; text-decoration: none; font-weight: 700; font-size: 16px; transition: all 0.2s; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3); }
        .footer { padding: 40px; text-align: center; color: #64748b; font-size: 14px; }
        .footer b { color: #1e293b; }
    </style>
</head>
<body>
    <div class="wrapper">
        <table class="main">
            <tr>
                <td class="header">
                    <div class="badge">AEROHIVE MISSION CONTROL</div>
                    <h1>${title}</h1>
                    <p>${subtitle}</p>
                </td>
            </tr>
            <tr>
                <td class="content">
                    <div class="grid-row">
                        <div class="grid-item">
                            <div class="label">Booking ID</div>
                            <div class="value">${d.bookingId}</div>
                        </div>
                        <div class="grid-item">
                            <div class="label">Service Type</div>
                            <div class="value">${d.serviceType}</div>
                        </div>
                    </div>

                    <div class="grid-row">
                        <div class="grid-item">
                            <div class="label">Date & Time</div>
                            <div class="value">${d.scheduledAt}</div>
                        </div>
                        <div class="grid-item">
                            <div class="label">Location</div>
                            <div class="value">${d.location}</div>
                        </div>
                    </div>

                    <div class="highlight-box">
                        <div class="label">${isPilot ? 'Pilot Mission Notes' : 'Estimated Charges'}</div>
                        <div class="value" style="color: ${accentColor}; font-size: 20px;">
                            ${isPilot ? (d.requirements || 'No special requirements.') : (d.estimatedAmount || 'Contact for Quote')}
                        </div>
                        <p style="font-size: 12px; color: #64748b; margin-top: 8px; margin-bottom: 0;">${d.chargesNote}</p>
                    </div>

                    ${!isPilot ? `
                    <div class="otp-display">
                        <span>${d.otp}</span>
                        <p>SECURITY VERIFICATION OTP</p>
                    </div>
                    ` : `
                    <div class="label">Mission Access Pin (Requested on Arrival)</div>
                    <div class="value" style="font-size: 14px; margin-bottom: 24px;">Ask the client for the 4-digit code to start the service.</div>
                    `}

                    <div class="btn-container">
                        <a href="${isPilot ? d.acceptJobLink : d.trackingLink}" class="btn">
                            ${isPilot ? 'Accept & Confirm Job' : 'Track Booking Status'}
                        </a>
                    </div>
                </td>
            </tr>
            <tr>
                <td class="footer">
                    Sent via <b>AeroHive Network</b> &bull; Secure Drone Services<br>
                    Need help? Contact <a href="mailto:aerohive.help@gmail.com" style="color: ${accentColor};">AeroHive Support</a>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>`
}

export async function sendEmailDirect({ to, subject, type, bookingDetails }: EmailRequest) {
    try {
        const htmlContent = generateEmailHtml(type, bookingDetails)
        const fromAddress = `AeroHive Support <${GMAIL_USER}>`
        const replyTo = GMAIL_USER

        console.log(`📡 [Direct] Sending elite email to ${to} (${type})`)

        if (GMAIL_USER && GMAIL_APP_PASSWORD) {
            try {
                const transporter = createGmailTransporter()
                const result = await transporter.sendMail({
                    from: fromAddress,
                    replyTo: replyTo,
                    to,
                    subject,
                    html: htmlContent
                })
                console.log(`✅ [Gmail] Elite email sent: ${result.messageId}`)
                return { success: true, provider: 'gmail', messageId: result.messageId }
            } catch (err: any) {
                console.error('❌ Elite Gmail failed:', err.message)
            }
        }

        if (RESEND_API_KEY) {
            try {
                const { Resend } = await import('resend')
                const resend = new Resend(RESEND_API_KEY)
                const { data, error } = await resend.emails.send({
                    from: 'AeroHive Support <onboarding@resend.dev>',
                    replyTo,
                    to: [to],
                    subject,
                    html: htmlContent
                })
                if (error) throw error
                console.log(`✅ [Resend] Elite email sent: ${data?.id}`)
                return { success: true, provider: 'resend', id: data?.id }
            } catch (err: any) {
                console.error('❌ Elite Resend failed:', err.message)
            }
        }

        throw new Error('All email delivery providers failed')
    } catch (error: any) {
        console.error('sendEmailDirect Error:', error.message)
        return { success: false, error: error.message }
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
            return NextResponse.json(
                { success: false, error: 'Email provider not configured' },
                { status: 500 }
            )
        }

        const body: EmailRequest = await request.json()
        const result = await sendEmailDirect(body)

        if (result.success) {
            return NextResponse.json(result)
        } else {
            return NextResponse.json(result, { status: 500 })
        }
    } catch (error: any) {
        console.error('Email API Error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to send email' },
            { status: 500 }
        )
    }
}
