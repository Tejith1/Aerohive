import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Check which email provider is configured
const RESEND_API_KEY = process.env.RESEND_API_KEY
const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD

// Mediator Email Address
const MEDIATOR_EMAIL = 'aerohive.help@gmail.com'

interface EmailRequest {
    to: string
    subject: string
    type: 'client' | 'pilot'
    bookingDetails: {
        bookingId: string
        orderUUID: string
        otp: string // Keeping OTP for record, though maybe not checking immediately
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
}

// Create Gmail transporter using Nodemailer
function createGmailTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_APP_PASSWORD // Use App Password, not regular password
        }
    })
}

// Generate HTML email content
function generateEmailHtml(type: 'client' | 'pilot', d: EmailRequest['bookingDetails']) {
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

        const htmlContent = generateEmailHtml(type, bookingDetails)
        const fromAddress = `AeroHive Support <${MEDIATOR_EMAIL}>` // Force mediator email
        const replyTo = MEDIATOR_EMAIL

        // Try Resend first
        if (RESEND_API_KEY) {
            try {
                const { Resend } = await import('resend')
                const resend = new Resend(RESEND_API_KEY)

                const { data, error } = await resend.emails.send({
                    from: 'AeroHive Support <onboarding@resend.dev>', // Resend demands verified domain or test domain
                    // NOTE: If using Resend, we might not be able to "spoof" gmail. 
                    // But we can set Reply-To.
                    // If user insists on FROM: aerohive.help@gmail.com, sending via Resend won't work unless verified domain.
                    // So we prefer Gmail/Nodemailer if configured for this specific address.
                    replyTo: replyTo,
                    to: [to],
                    subject: subject,
                    html: htmlContent
                })

                if (error) throw error

                console.log(`✅ [Resend] Email sent to ${to}:`, data?.id)
                return NextResponse.json({ success: true, provider: 'resend', emailId: data?.id })
            } catch (resendError) {
                console.error('❌ Resend failed, trying fallback:', resendError)
            }
        }

        // Try Gmail/Nodemailer
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

                console.log(`✅ [Gmail] Email sent to ${to}:`, result.messageId)
                return NextResponse.json({ success: true, provider: 'gmail', messageId: result.messageId })
            } catch (gmailError) {
                console.error('❌ Gmail failed:', gmailError)
                return NextResponse.json(
                    { success: false, error: 'Failed to send via Gmail' },
                    { status: 500 }
                )
            }
        }

        // No provider configured - simulate
        console.log(`📧 [Simulated] Email to ${to}:`, subject)
        console.log(`   Type: ${type}`)
        console.log(`   Order UUID: ${bookingDetails.orderUUID}`)
        console.log(`   Link: ${type === 'client' ? bookingDetails.trackingLink : bookingDetails.acceptJobLink}`)

        return NextResponse.json({
            success: true,
            simulated: true,
            message: 'Email simulated (configure GMAIL_USER/APP_PASSWORD)',
            details: { to, subject, type, bookingId: bookingDetails.bookingId }
        })

    } catch (error: any) {
        console.error('Email API Error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to send email' },
            { status: 500 }
        )
    }
}
