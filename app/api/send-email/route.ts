import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Check which email provider is configured
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
        service: 'gmail',
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_APP_PASSWORD?.replace(/\s+/g, '') // Remove spaces from App Password
        }
    })
}

// Generate HTML email content
export function generateEmailHtml(type: 'client' | 'pilot', d: BookingEmailDetails) {
    if (!d) return ''

    const styles = `
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: #1e293b; padding: 25px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 22px; font-weight: 600; }
        .content { padding: 30px; color: #334155; line-height: 1.6; }
        .section { margin-bottom: 25px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; }
        .section:last-child { border-bottom: none; }
        .label { font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
        .value { font-size: 16px; color: #1e293b; font-weight: 500; }
        .btn { display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; text-align: center; margin-top: 10px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px; }
        .note { background: #fffbeb; border: 1px solid #fcd34d; color: #92400e; padding: 12px; border-radius: 6px; font-size: 14px; margin-top: 15px; }
    `

    if (type === 'client') {
        return `
<!DOCTYPE html>
<html>
<head><style>${styles}</style></head>
<body>
    <div class="container">
        <div class="header">
            <h1>Booking Confirmation</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>Your drone pilot has been assigned for the requested service.</p>

            <div class="section">
                <div class="label">Pilot Assigned</div>
                <div class="value">${d.pilotName || 'Assignments Team'}</div>
                <div class="value">📞 ${d.pilotPhone || 'N/A'}</div>
            </div>

            <div class="section">
                <div class="label">Order ID</div>
                <div class="value" style="font-family: monospace;">${d.orderUUID}</div>
            </div>

            <div class="section">
                <div class="label">Service Details</div>
                <div class="value">📅 Date: ${d.scheduledAt.split(',')[0]}</div>
                <div class="value">⏰ Time: ${d.scheduledAt.split(',')[1] || ''}</div>
                <div class="value">⏳ Duration: ${d.durationHours} Hours</div>
            </div>

            <div class="section" style="text-align: center;">
                <a href="${d.trackingLink}" class="btn" style="background: #10b981;">Track Pilot Live</a>
                <p style="font-size: 13px; color: #64748b; margin-top: 8px;">Click to view live status map</p>
            </div>

            ${d.chargesNote ? `<div class="note"><strong>Note:</strong> ${d.chargesNote}</div>` : ''}
        </div>
        <div class="footer">
            AeroHive Drone Services<br>
            For support, reply to this email.
        </div>
    </div>
</body>
</html>`
    } else {
        // Pilot Email
        return `
<!DOCTYPE html>
<html>
<head><style>${styles}</style></head>
<body>
    <div class="container">
        <div class="header" style="background: #0f172a;">
            <h1>New Job Assignment</h1>
        </div>
        <div class="content">
            <p>Hello Pilot,</p>
            <p>You have a new job assignment. Action is required to accept this job.</p>

            <div class="section">
                <div class="label">Client Details</div>
                <div class="value">${d.clientName || 'Valued Client'}</div>
                <div class="value">📞 ${d.clientPhone || 'N/A'}</div>
            </div>

            <div class="section">
                <div class="label">Service Schedule</div>
                <div class="value">📅 ${d.scheduledAt}</div>
                <div class="value">⏳ Expected Hours: ${d.durationHours} hrs</div>
                <div class="value" style="color: #059669;">💰 Est. Earning: ${d.estimatedAmount}</div>
            </div>

            <div class="section">
                <div class="label">Location</div>
                <div class="value">${d.location}</div>
                <div style="margin-top: 8px;">
                    <a href="${d.googleMapsLink}" style="color: #2563eb; text-decoration: underline;">Open in Google Maps</a>
                </div>
            </div>

            <div class="section" style="text-align: center;">
                <a href="${d.acceptJobLink}" class="btn">Accept Job</a>
                <p style="font-size: 13px; color: #64748b; margin-top: 8px;">Secure Job Acceptance Link</p>
            </div>
        </div>
        <div class="footer">
            AeroHive Pilot Network<br>
            Please accept promptly.
        </div>
    </div>
</body>
</html>`
    }
}
/**
 * Direct call function to send email without making a network request to the API
 */
export async function sendEmailDirect({ to, subject, type, bookingDetails }: EmailRequest) {
    try {
        const htmlContent = generateEmailHtml(type, bookingDetails)
        const fromAddress = `AeroHive Support <${MEDIATOR_EMAIL}>`
        const replyTo = MEDIATOR_EMAIL

        console.log(`📡 [Internal] Sending email to ${to} (${type})`)

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
                return { success: true, provider: 'resend', id: data?.id }
            } catch (err) {
                console.error('❌ Internal Resend failed:', err)
            }
        }

        if (GMAIL_USER && GMAIL_APP_PASSWORD) {
            try {
                const transporter = createGmailTransporter()
                const result = await transporter.sendMail({
                    from: fromAddress,
                    replyTo: replyTo,
                    to: to,
                    subject: subject,
                    html: htmlContent
                })
                return { success: true, provider: 'gmail', id: result.messageId }
            } catch (err) {
                console.error('❌ Internal Gmail failed:', err)
                throw err
            }
        }

        console.log(`📧 [Internal Simulated] To: ${to} | Subject: ${subject}`)
        return { success: true, simulated: true }
    } catch (error: any) {
        console.error('❌ sendEmailDirect error:', error)
        return { success: false, error: error.message }
    }
}
export async function POST(request: NextRequest) {
    try {
        const body: EmailRequest = await request.json()
        const { to, subject, type, bookingDetails } = body

        if (!to || !subject || !bookingDetails) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const result = await sendEmailDirect({ to, subject, type, bookingDetails })
        
        if (result.success) {
            return NextResponse.json({ ...result })
        } else {
            return NextResponse.json(
                { success: false, error: result.error || 'Failed to send' },
                { status: 500 }
            )
        }
    } catch (error: any) {
        console.error('Email API Error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to send email' },
            { status: 500 }
        )
    }
}
