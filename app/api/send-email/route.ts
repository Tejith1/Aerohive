import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Check which email provider is configured
const RESEND_API_KEY = process.env.RESEND_API_KEY
const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD

interface EmailRequest {
    to: string
    subject: string
    message: string
    type: 'client' | 'pilot'
    bookingDetails?: {
        bookingId: string
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
function generateEmailHtml(type: 'client' | 'pilot', bookingDetails: EmailRequest['bookingDetails']) {
    if (!bookingDetails) return ''

    if (type === 'client') {
        return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .booking-card { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #3b82f6; }
        .otp-box { background: linear-gradient(135deg, #1e3a5f, #0f172a); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #60a5fa; }
        .info-row { padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
        .info-row:last-child { border-bottom: none; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
        .pilot-card { background: #ecfdf5; border-radius: 8px; padding: 15px; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚁 Booking Confirmed!</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">AeroHive Drone Services</p>
        </div>
        <div class="content">
            <p>Hello <strong>${bookingDetails.clientName || 'Valued Customer'}</strong>,</p>
            <p>Your drone service booking has been successfully confirmed!</p>
            
            <div class="booking-card">
                <div class="info-row"><strong>📋 Reference:</strong> ${bookingDetails.bookingId}</div>
                <div class="info-row"><strong>🛠 Service:</strong> ${bookingDetails.serviceType}</div>
                <div class="info-row"><strong>📍 Location:</strong> ${bookingDetails.location}</div>
                <div class="info-row"><strong>📅 Scheduled:</strong> ${bookingDetails.scheduledAt}</div>
            </div>

            <div class="pilot-card">
                <p style="margin:0 0 10px 0; color: #047857; font-weight: 600;">👨‍✈️ Assigned Pilot</p>
                <p style="margin: 5px 0;"><strong>${bookingDetails.pilotName}</strong> ⭐ 4.9</p>
                <p style="margin: 5px 0; color: #065f46;">📞 ${bookingDetails.pilotPhone}</p>
            </div>

            <div class="otp-box">
                <p style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Security OTP</p>
                <div class="otp-code">${bookingDetails.otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">Share this OTP with the pilot upon arrival</p>
            </div>

            <p style="color: #64748b; font-size: 14px;">Thank you for choosing AeroHive! 🙏</p>
        </div>
        <div class="footer">
            AeroHive Drone Services • Professional Aerial Solutions<br>
            This is an automated message.
        </div>
    </div>
</body>
</html>`
    } else {
        // Pilot email
        return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .booking-card { background: #fffbeb; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .otp-box { background: linear-gradient(135deg, #7c2d12, #450a0a); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #fbbf24; }
        .info-row { padding: 10px 0; border-bottom: 1px solid #fde68a; }
        .info-row:last-child { border-bottom: none; }
        .footer { background: #fffbeb; padding: 20px; text-align: center; color: #92400e; font-size: 12px; }
        .client-card { background: #fef3c7; border-radius: 8px; padding: 15px; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚁 New Job Assignment!</h1>
            <p style="color: rgba(255,255,255,0.9); margin-top: 8px;">AeroHive Pilot Portal</p>
        </div>
        <div class="content">
            <p>Hello Pilot,</p>
            <p>You have been assigned a new drone service job. <span style="background: #fbbf24; color: #78350f; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">⚠️ PENDING</span></p>
            
            <div class="booking-card">
                <div class="info-row"><strong>🆔 Job ID:</strong> ${bookingDetails.bookingId}</div>
                <div class="info-row"><strong>🛠 Service:</strong> ${bookingDetails.serviceType}</div>
                <div class="info-row"><strong>📍 Site Location:</strong> ${bookingDetails.location}</div>
                <div class="info-row"><strong>📅 Scheduled:</strong> ${bookingDetails.scheduledAt}</div>
            </div>

            <div class="client-card">
                <p style="margin:0 0 10px 0; color: #92400e; font-weight: 600;">👤 Client Details</p>
                <p style="margin: 5px 0; color: #78350f;"><strong>${bookingDetails.clientName || 'Client'}</strong></p>
                <p style="margin: 5px 0; color: #78350f;">📞 ${bookingDetails.clientPhone || 'Not provided'}</p>
            </div>

            <div class="otp-box">
                <p style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Verification OTP</p>
                <div class="otp-code">${bookingDetails.otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">⚠️ Verify this OTP from client before starting service</p>
            </div>

            <p style="color: #92400e; font-size: 14px;">Good luck with your mission! 🎯</p>
        </div>
        <div class="footer">
            AeroHive Pilot Portal • Professional Aerial Solutions<br>
            This is an automated message.
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

        // Try Resend first if configured
        if (RESEND_API_KEY) {
            try {
                const { Resend } = await import('resend')
                const resend = new Resend(RESEND_API_KEY)

                const { data, error } = await resend.emails.send({
                    from: 'support@aerohive.com',
                    to: [to],
                    subject: subject,
                    html: htmlContent
                })

                if (error) throw error

                console.log(`✅ [Resend] Email sent to ${to}:`, data?.id)
                return NextResponse.json({ success: true, provider: 'resend', emailId: data?.id })
            } catch (resendError) {
                console.error('❌ Resend failed:', resendError)
            }
        }

        // Try Gmail/Nodemailer if configured
        if (GMAIL_USER && GMAIL_APP_PASSWORD) {
            try {
                const transporter = createGmailTransporter()

                const result = await transporter.sendMail({
                    from: `AeroHive <${GMAIL_USER}>`,
                    to: to,
                    subject: subject,
                    html: htmlContent
                })

                console.log(`✅ [Gmail] Email sent to ${to}:`, result.messageId)
                return NextResponse.json({ success: true, provider: 'gmail', messageId: result.messageId })
            } catch (gmailError) {
                console.error('❌ Gmail failed:', gmailError)
            }
        }

        // No provider configured - simulate
        console.log(`📧 [Simulated] Email to ${to}:`, subject)
        console.log(`   Type: ${type}`)
        console.log(`   Booking: ${bookingDetails.bookingId}`)
        console.log(`   OTP: ${bookingDetails.otp}`)

        return NextResponse.json({
            success: true,
            simulated: true,
            message: 'Email simulated (configure RESEND_API_KEY or GMAIL_USER + GMAIL_APP_PASSWORD)',
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

