import nodemailer from 'nodemailer'

// Process env variables will be read dynamically inside the functions at runtime to avoid static bundling caching in Next.js.

// ─── Types ───────────────────────────────────────────────────────────────────

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

export interface EmailRequest {
    to: string
    subject: string
    type: 'client' | 'pilot' | 'client_declined'
    bookingDetails: BookingEmailDetails
}

// ─── Gmail Transporter ───────────────────────────────────────────────────────

export function createGmailTransporter() {
    const user = process.env.GMAIL_USER
    const pass = process.env.GMAIL_APP_PASSWORD
    console.log(`🔌 Initializing Nodemailer SMTP with USER: '${user}' | PASS: ${pass ? '✅ CONFIGURED' : '❌ MISSING'}`)
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: user,
            pass: pass?.replace(/\s+/g, '')
        },
        tls: {
            rejectUnauthorized: false
        }
    })
}

// ─── HTML Template ───────────────────────────────────────────────────────────

export function generateEmailHtml(type: 'client' | 'pilot' | 'client_declined', d: BookingEmailDetails) {
    if (!d) return ''

    const isPilot = type === 'pilot'
    const isDeclined = type === 'client_declined'
    const bgColor = isPilot ? '#0f172a' : isDeclined ? '#fff1f2' : '#f8fafc'
    const accentColor = isPilot ? '#3b82f6' : isDeclined ? '#e11d48' : '#2563eb'
    const title = isPilot ? 'NEW BOOKING REQUEST' : isDeclined ? 'MISSION DECLINED BY PILOT' : 'BOOKING CONFIRMED'
    const subtitle = isPilot
        ? 'A new drone booking request needs your confirmation.'
        : isDeclined
        ? 'We apologize, but your assigned pilot has declined this mission slot.'
        : 'Your booking is placed! Waiting for pilot confirmation.'
    const headerTextColor = isPilot ? '#ffffff' : isDeclined ? '#9f1239' : '#0f172a'
    const subtitleTextColor = isPilot ? '#94a3b8' : isDeclined ? '#b91c1c' : '#475569'
    const badgeBg = isPilot ? 'rgba(255,255,255,0.1)' : isDeclined ? 'rgba(225,29,72,0.1)' : 'rgba(15,23,42,0.05)'
    const badgeText = isPilot ? '#94a3b8' : isDeclined ? '#e11d48' : '#475569'
    const badgeBorder = isPilot ? 'rgba(255,255,255,0.15)' : isDeclined ? 'rgba(225,29,72,0.2)' : 'rgba(15,23,42,0.1)'

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
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; color: #1e293b; border-radius: 24px; overflow: hidden; margin-top: 40px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
        .header { background-color: ${bgColor}; padding: 48px 40px; text-align: center; }
        .badge { display: inline-block; padding: 6px 12px; background-color: ${badgeBg}; border-radius: 100px; color: ${badgeText}; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; margin-bottom: 16px; border: 1px solid ${badgeBorder}; }
        .header h1 { color: ${headerTextColor}; font-size: 32px; font-weight: 800; margin: 0; letter-spacing: -0.025em; line-height: 1.1; }
        .header p { color: ${subtitleTextColor}; font-size: 16px; margin-top: 12px; margin-bottom: 0; }
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
        .btn { display: inline-block; background-color: ${accentColor}; color: #ffffff !important; padding: 18px 36px; border-radius: 16px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(37,99,235,0.3); }
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
                            <div class="label">Date &amp; Time</div>
                            <div class="value">${d.scheduledAt}</div>
                        </div>
                        <div class="grid-item">
                            <div class="label">Location</div>
                            <div class="value">${d.location}</div>
                        </div>
                    </div>

                    ${isPilot ? `
                    <div class="grid-row">
                        <div class="grid-item">
                            <div class="label">Client Name</div>
                            <div class="value">${d.clientName || 'N/A'}</div>
                        </div>
                        <div class="grid-item">
                            <div class="label">Client Phone</div>
                            <div class="value">${d.clientPhone || 'N/A'}</div>
                        </div>
                    </div>
                    ` : `
                    <div class="grid-row">
                        <div class="grid-item">
                            <div class="label">Pilot Name</div>
                            <div class="value">${d.pilotName || 'N/A'}</div>
                        </div>
                        <div class="grid-item">
                            <div class="label">Pilot Phone</div>
                            <div class="value">${d.pilotPhone || 'N/A'}</div>
                        </div>
                    </div>
                    `}

                    <div class="highlight-box">
                        <div class="label">${isPilot ? 'Mission Notes' : 'Estimated Charges'}</div>
                        <div class="value" style="color: ${accentColor}; font-size: 20px;">
                            ${isPilot ? (d.requirements || 'No special requirements.') : (d.estimatedAmount || 'Contact for Quote')}
                        </div>
                        <p style="font-size: 12px; color: #64748b; margin-top: 8px; margin-bottom: 0;">${d.chargesNote || ''}</p>
                    </div>

                    ${(!isPilot && !isDeclined) ? `
                    <div class="otp-display">
                        <span>${d.otp}</span>
                        <p>SECURITY VERIFICATION OTP</p>
                    </div>
                    <div style="text-align: center; font-size: 13px; color: #64748b; margin-bottom: 24px;">
                        Share this OTP with the pilot <strong>only upon arrival</strong> to verify identity.
                    </div>
                    ` : isDeclined ? `
                    <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: center;">
                        <div style="font-size: 14px; font-weight: 700; color: #9f1239; margin-bottom: 6px;">BOOKING DECLINED</div>
                        <div style="font-size: 13px; color: #b91c1c;">This booking request has been declined. You can view the cancellation details in your tracking console.</div>
                    </div>
                    ` : `
                    <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: center;">
                        <div style="font-size: 14px; font-weight: 700; color: #92400e; margin-bottom: 6px;">ACTION REQUIRED</div>
                        <div style="font-size: 13px; color: #78350f;">Log in to your <strong>Pilot Panel</strong> to Accept or Reject this booking.<br/>After accepting, you will need to collect the client's 4-digit OTP to verify and start the service.</div>
                    </div>
                    `}

                    <div class="btn-container">
                        <a href="${isPilot ? d.acceptJobLink : d.trackingLink}" class="btn" style="background-color: ${accentColor}; box-shadow: 0 10px 15px -3px ${isDeclined ? 'rgba(225,29,72,0.3)' : 'rgba(37,99,235,0.3)'};">
                            ${isPilot ? 'Open Pilot Panel' : isDeclined ? 'View Tracking Status' : 'Track Booking Status'}
                        </a>
                    </div>
                </td>
            </tr>
            <tr>
                <td class="footer">
                    Sent via <b>AeroHive Network</b> &bull; Secure Drone Services<br>
                    Need help? Contact <a href="mailto:${process.env.GMAIL_USER || 'aerohive.help@gmail.com'}" style="color: ${accentColor};">AeroHive Support</a>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>`
}

// ─── Send Email (direct / multi-provider) ────────────────────────────────────

export async function sendEmailDirect({ to, subject, type, bookingDetails }: EmailRequest) {
    try {
        const user = process.env.GMAIL_USER
        const pass = process.env.GMAIL_APP_PASSWORD
        const resendApiKey = process.env.RESEND_API_KEY

        const htmlContent = generateEmailHtml(type, bookingDetails)
        const fromAddress = `AeroHive Drones <${user || 'aerohive.help@gmail.com'}>`
        const replyTo = user || 'aerohive.help@gmail.com'

        // Plain-text fallback (improves spam score significantly)
        const plainText = [
            `AeroHive - ${type === 'pilot' ? 'New Booking Request' : type === 'client_declined' ? 'Booking Declined' : 'Booking Confirmation'}`,
            `Booking ID: ${bookingDetails?.bookingId || 'N/A'}`,
            `Service: ${bookingDetails?.serviceType || 'N/A'}`,
            `Location: ${bookingDetails?.location || 'N/A'}`,
            `Scheduled: ${bookingDetails?.scheduledAt || 'N/A'}`,
            type === 'pilot' ? `Client: ${bookingDetails?.clientName || 'N/A'} | Phone: ${bookingDetails?.clientPhone || 'N/A'}` : `Pilot: ${bookingDetails?.pilotName || 'N/A'}`,
            '',
            'This is an automated notification from AeroHive Drone Services.',
            'Visit https://aerohive.co.in for more information.'
        ].join('\n')

        // Anti-spam headers to improve deliverability for new sender accounts
        const antiSpamHeaders = {
            'X-Mailer': 'AeroHive-Notifications/2.0',
            'X-Priority': '3',
            'Precedence': 'bulk',
            'List-Unsubscribe': `<mailto:${user || 'aerohive.help@gmail.com'}?subject=unsubscribe>`,
            'MIME-Version': '1.0',
            'X-Entity-Ref-ID': bookingDetails?.orderUUID || crypto.randomUUID()
        }

        console.log(`📡 [Direct] Dispatching email to: ${to} (${type})`)
        console.log(`📡 SMTP Details: USER='${user}' | PASS_EXISTS=${!!pass} | RESEND_EXISTS=${!!resendApiKey}`)

        // Provider 1 – Gmail / Nodemailer (with secure dual-port fallback)
        if (user && pass) {
            try {
                console.log("🔌 Attempting Gmail SMTP via Port 465 (Secure SSL)...")
                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    port: 465,
                    secure: true,
                    auth: {
                        user: user,
                        pass: pass.replace(/\s+/g, '')
                    },
                    tls: {
                        rejectUnauthorized: false
                    },
                    connectionTimeout: 8000 // 8 second timeout to fail fast on port block
                })
                const result = await transporter.sendMail({
                    from: fromAddress,
                    sender: user,
                    replyTo,
                    to,
                    subject,
                    text: plainText,
                    html: htmlContent,
                    headers: antiSpamHeaders
                })
                console.log(`✅ [Gmail Port 465] Email successfully sent: ${result.messageId}`)
                return { success: true, provider: 'gmail_port_465', messageId: result.messageId }
            } catch (err: any) {
                console.error('❌ Gmail SMTP Port 465 direct send failed:', err.message)
                
                // Fallback to Port 587 (STARTTLS)
                try {
                    console.log("🔌 Attempting Gmail SMTP Fallback via Port 587 (STARTTLS)...")
                    const transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 587,
                        secure: false, // false for 587 STARTTLS
                        auth: {
                            user: user,
                            pass: pass.replace(/\s+/g, '')
                        },
                        tls: {
                            rejectUnauthorized: false
                        },
                        connectionTimeout: 8000
                    })
                    const result = await transporter.sendMail({
                        from: fromAddress,
                        sender: user,
                        replyTo,
                        to,
                        subject,
                        text: plainText,
                        html: htmlContent,
                        headers: antiSpamHeaders
                    })
                    console.log(`✅ [Gmail Port 587] Email successfully sent: ${result.messageId}`)
                    return { success: true, provider: 'gmail_port_587', messageId: result.messageId }
                } catch (fallbackErr: any) {
                    console.error('❌ Gmail SMTP Port 587 fallback send failed:', fallbackErr.message)
                }
            }
        } else {
            console.warn('⚠️ Gmail SMTP is not configured or missing environment variables.')
        }

        // Provider 2 – Resend (fallback)
        if (resendApiKey) {
            try {
                const { Resend } = await import('resend')
                const resend = new Resend(resendApiKey)
                const { data, error } = await resend.emails.send({
                    from: 'AeroHive Support <onboarding@resend.dev>',
                    replyTo,
                    to: [to],
                    subject,
                    html: htmlContent
                })
                if (error) throw error
                console.log(`✅ [Resend] Email successfully sent: ${data?.id}`)
                return { success: true, provider: 'resend', id: data?.id }
            } catch (err: any) {
                console.error('❌ Resend fallback failed:', err.message)
            }
        }

        throw new Error('All configured email delivery providers failed. Please ensure GMAIL_USER + GMAIL_APP_PASSWORD are correctly declared in .env.local')
    } catch (error: any) {
        console.error('❌ sendEmailDirect critical exception:', error.message)
        return { success: false, error: error.message }
    }
}
