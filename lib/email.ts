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


    // Theme values matching Aerohive pastel teal palette
    const headerBg = '#bfe3e7'
    const headerText = '#0f768a'
    const btnColor = '#0f768a'

    // Build the dynamic greeting and introductory paragraph
    let greeting = ''
    let introParagraph = ''
    if (isPilot) {
        greeting = `Dear ${d.pilotName || 'Professional Pilot'},`
        introParagraph = 'A new premium flight mission request has been routed to your queue in the Aerohive Network. Please review the flight requirements and coordinate with the client below.'
    } else if (isDeclined) {
        greeting = `Dear ${d.clientName || 'Valued Client'},`
        introParagraph = 'We apologize, but your assigned pilot has declined the requested flight mission slot. We are already routing your mission request to nearby drone operators.'
    } else {
        greeting = `Dear ${d.clientName || 'Valued Client'},`
        introParagraph = 'Welcome to Aerohive! We are thrilled to have you as part of our premium drone flight community. Your booking request has been securely placed and is waiting for pilot confirmation.'
    }

    // Build tabular metadata for the email card
    const detailsHtml = isPilot ? `
        <tr>
            <td style="width: 50%; padding: 12px 15px; border-bottom: 1px solid #eef2f3;">
                <div style="font-size: 11px; font-weight: 700; color: #8a8a8a; text-transform: uppercase; letter-spacing: 0.05em;">Pilot Name</div>
                <div style="font-size: 14px; font-weight: 600; color: #2d3748; margin-top: 3px;">${d.pilotName || 'N/A'}</div>
            </td>
            <td style="width: 50%; padding: 12px 15px; border-bottom: 1px solid #eef2f3;">
                <div style="font-size: 11px; font-weight: 700; color: #8a8a8a; text-transform: uppercase; letter-spacing: 0.05em;">Mission Category</div>
                <div style="font-size: 14px; font-weight: 600; color: #2d3748; margin-top: 3px;">${d.serviceType || 'General'}</div>
            </td>
        </tr>
        <tr>
            <td style="width: 50%; padding: 12px 15px; border-bottom: 1px solid #eef2f3;">
                <div style="font-size: 11px; font-weight: 700; color: #8a8a8a; text-transform: uppercase; letter-spacing: 0.05em;">Client Name</div>
                <div style="font-size: 14px; font-weight: 600; color: #2d3748; margin-top: 3px;">${d.clientName || 'N/A'}</div>
            </td>
            <td style="width: 50%; padding: 12px 15px; border-bottom: 1px solid #eef2f3;">
                <div style="font-size: 11px; font-weight: 700; color: #8a8a8a; text-transform: uppercase; letter-spacing: 0.05em;">Client Contact</div>
                <div style="font-size: 14px; font-weight: 600; color: #2d3748; margin-top: 3px;">${d.clientPhone || 'N/A'}</div>
            </td>
        </tr>
        <tr>
            <td colspan="2" style="padding: 12px 15px; border-bottom: 1px solid #eef2f3;">
                <div style="font-size: 11px; font-weight: 700; color: #8a8a8a; text-transform: uppercase; letter-spacing: 0.05em;">Flight Location</div>
                <div style="font-size: 13px; font-weight: 600; color: #2d3748; margin-top: 3px; line-height: 1.4;">${d.location || 'N/A'}</div>
            </td>
        </tr>
        <tr>
            <td style="width: 50%; padding: 12px 15px;">
                <div style="font-size: 11px; font-weight: 700; color: #8a8a8a; text-transform: uppercase; letter-spacing: 0.05em;">Duration</div>
                <div style="font-size: 14px; font-weight: 600; color: #2d3748; margin-top: 3px;">${d.durationHours || 1} Hour(s)</div>
            </td>
            <td style="width: 50%; padding: 12px 15px;">
                <div style="font-size: 11px; font-weight: 700; color: #8a8a8a; text-transform: uppercase; letter-spacing: 0.05em;">Estimated Earnings</div>
                <div style="font-size: 15px; font-weight: 700; color: #0f768a; margin-top: 3px;">${d.estimatedAmount || 'Contact support'}</div>
            </td>
        </tr>
    ` : `
        <tr>
            <td style="width: 50%; padding: 12px 15px; border-bottom: 1px solid #eef2f3;">
                <div style="font-size: 11px; font-weight: 700; color: #8a8a8a; text-transform: uppercase; letter-spacing: 0.05em;">Name</div>
                <div style="font-size: 14px; font-weight: 600; color: #2d3748; margin-top: 3px;">${d.clientName || 'N/A'}</div>
            </td>
            <td style="width: 50%; padding: 12px 15px; border-bottom: 1px solid #eef2f3;">
                <div style="font-size: 11px; font-weight: 700; color: #8a8a8a; text-transform: uppercase; letter-spacing: 0.05em;">Address / Location</div>
                <div style="font-size: 13px; font-weight: 600; color: #2d3748; margin-top: 3px; line-height: 1.4;">${d.location || 'N/A'}</div>
            </td>
        </tr>
        <tr>
            <td style="width: 50%; padding: 12px 15px; border-bottom: 1px solid #eef2f3;">
                <div style="font-size: 11px; font-weight: 700; color: #8a8a8a; text-transform: uppercase; letter-spacing: 0.05em;">Email Address</div>
                <div style="font-size: 13px; font-weight: 600; color: #2d3748; margin-top: 3px;">${d.clientEmail || 'N/A'}</div>
            </td>
            <td style="width: 50%; padding: 12px 15px; border-bottom: 1px solid #eef2f3;">
                <div style="font-size: 11px; font-weight: 700; color: #8a8a8a; text-transform: uppercase; letter-spacing: 0.05em;">Contact</div>
                <div style="font-size: 14px; font-weight: 600; color: #2d3748; margin-top: 3px;">${d.clientPhone || 'N/A'}</div>
            </td>
        </tr>
        <tr>
            <td style="width: 50%; padding: 12px 15px;">
                <div style="font-size: 11px; font-weight: 700; color: #8a8a8a; text-transform: uppercase; letter-spacing: 0.05em;">Assigned Pilot</div>
                <div style="font-size: 14px; font-weight: 600; color: #2d3748; margin-top: 3px;">${d.pilotName || 'Searching...'}</div>
            </td>
            <td style="width: 50%; padding: 12px 15px;">
                <div style="font-size: 11px; font-weight: 700; color: #8a8a8a; text-transform: uppercase; letter-spacing: 0.05em;">Flight Date &amp; Time</div>
                <div style="font-size: 13px; font-weight: 600; color: #2d3748; margin-top: 3px;">${d.scheduledAt}</div>
            </td>
        </tr>
    `

    // Build the dynamic checklist
    let checklistHtml = ''
    if (isPilot) {
        checklistHtml = `
            <div style="background-color: #f4fbfc; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <div style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px;">
                    <span style="color: #4caf50; font-weight: bold; font-size: 16px;">☑</span>
                    <span style="font-size: 13.5px; color: #4a5568; line-height: 1.45;">Premium compensation &amp; travel allowance covered.</span>
                </div>
                <div style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px;">
                    <span style="color: #4caf50; font-weight: bold; font-size: 16px;">☑</span>
                    <span style="font-size: 13.5px; color: #4a5568; line-height: 1.45;">Encrypted flight security OTP must be verified at the site.</span>
                </div>
                <div style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px;">
                    <span style="color: #4caf50; font-weight: bold; font-size: 16px;">☑</span>
                    <span style="font-size: 13.5px; color: #4a5568; line-height: 1.45;">High-definition mapping overlays synced to your dashboard.</span>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 10px;">
                    <span style="color: #4caf50; font-weight: bold; font-size: 16px;">☑</span>
                    <span style="font-size: 13.5px; color: #4a5568; line-height: 1.45;">Direct digital payments triggered on client security release.</span>
                </div>
            </div>
        `
    } else if (isDeclined) {
        checklistHtml = `
            <div style="background-color: #fcf4f4; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <div style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px;">
                    <span style="color: #e53e3e; font-weight: bold; font-size: 16px;">⚠</span>
                    <span style="font-size: 13.5px; color: #4a5568; line-height: 1.45;">Automatic search routing for a closer replacement pilot is active.</span>
                </div>
                <div style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px;">
                    <span style="color: #e53e3e; font-weight: bold; font-size: 16px;">⚠</span>
                    <span style="font-size: 13.5px; color: #4a5568; line-height: 1.45;">Zero fee booking cancellation guarantees immediate rebooking.</span>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 10px;">
                    <span style="color: #e53e3e; font-weight: bold; font-size: 16px;">⚠</span>
                    <span style="font-size: 13.5px; color: #4a5568; line-height: 1.45;">Mission dispatch specialists are assisting you 24/7.</span>
                </div>
            </div>
        `
    } else {
        checklistHtml = `
            <div style="background-color: #f4fbfc; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                <div style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px;">
                    <span style="color: #4caf50; font-weight: bold; font-size: 16px;">☑</span>
                    <span style="font-size: 13.5px; color: #4a5568; line-height: 1.45;">Explore nearest certified drone pilots across custom radiuses.</span>
                </div>
                <div style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px;">
                    <span style="color: #4caf50; font-weight: bold; font-size: 16px;">☑</span>
                    <span style="font-size: 13.5px; color: #4a5568; line-height: 1.45;">Get real-time location telemetry &amp; live pilot arrival tracking.</span>
                </div>
                <div style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px;">
                    <span style="color: #4caf50; font-weight: bold; font-size: 16px;">☑</span>
                    <span style="font-size: 13.5px; color: #4a5568; line-height: 1.45;">Enjoy direct secure UPI payouts and detailed receipts.</span>
                </div>
                <div style="display: flex; align-items: flex-start; gap: 10px;">
                    <span style="color: #4caf50; font-weight: bold; font-size: 16px;">☑</span>
                    <span style="font-size: 13.5px; color: #4a5568; line-height: 1.45;">Easily track your current mission parameters on our hub.</span>
                </div>
            </div>
        `
    }

    // Build segmented custom digital boxes for OTP just like in Image 2
    let otpSegmentedHtml = ''
    if (!isPilot && !isDeclined && d.otp) {
        const otpStr = String(d.otp).trim()
        const otpChars = otpStr.split('')
        const boxes = otpChars.map(char => `
            <span style="display: inline-block; width: 44px; height: 44px; line-height: 44px; text-align: center; font-size: 22px; font-weight: 800; color: #0f768a; background-color: #e6f4f6; border: 1.5px solid #bfe3e7; border-radius: 8px; margin: 0 4px; font-family: 'Helvetica Neue', Arial, sans-serif;">${char}</span>
        `).join('')

        otpSegmentedHtml = `
            <div style="text-align: center; background-color: #f7fbfb; border: 1px dashed #bfe3e7; border-radius: 16px; padding: 25px; margin: 30px 0;">
                <div style="font-size: 12px; font-weight: 700; color: #8a8a8a; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px;">Your Booking Security Code</div>
                <div style="margin-bottom: 15px;">
                    ${boxes}
                </div>
                <div style="font-size: 12.5px; color: #64748b; line-height: 1.45;">
                    Provide this secure verification OTP to the pilot <strong>only when they arrive</strong> at your location.
                </div>
            </div>
        `
    }

    const ctaLink = isPilot ? d.acceptJobLink : d.trackingLink
    const ctaLabel = isPilot ? 'ACCEPT MISSION BLOCK' : 'TRACK MISSION HUB'

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aerohive booking notification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f4f5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f4f5; padding: 40px 0;">
        <tr>
            <td align="center">
                <!-- Outer Envelope Card -->
                <table width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #dcdfdc; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);" cellspacing="0" cellpadding="0">
                    
                    <!-- Soft Teal Banner Header -->
                    <tr>
                        <td align="center" style="background-color: ${headerBg}; padding: 28px 20px;">
                            <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: ${headerText}; letter-spacing: 0.02em; font-family: 'Helvetica Neue', Arial, sans-serif;">
                                ${isPilot ? 'AeroHive - New Mission Dispatched' : 'AeroHive - Flight Scheduled'}
                            </h2>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 40px 35px 30px 35px;">
                            <p style="font-size: 16px; font-weight: 700; color: #2d3748; margin-top: 0; margin-bottom: 12px;">
                                ${greeting}
                            </p>
                            
                            <p style="font-size: 14px; color: #4a5568; line-height: 1.6; margin-bottom: 30px;">
                                ${introParagraph}
                            </p>

                            <!-- Structured Grey Tabular Details Grid -->
                            <table width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #eef2f3; border-radius: 12px; background-color: #fbfcff; margin-bottom: 30px; borde                            ${checklistHtml}

                            <!-- Dynamic OTP Segmented Block -->
                            ${otpSegmentedHtml}

                            <p style="font-size: 14.5px; color: #2d3748; margin-bottom: 25px;">
                                Click below to instantly log in to your active portal:
                            </p>

                            <!-- Deep Teal CTA Button -->
                            <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 35px;">
                                <tr>
                                    <td align="center" style="border-radius: 8px;" bgcolor="${btnColor}">
                                        <a href="${ctaLink || '#'}" target="_blank" style="font-size: 14.5px; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 8px; padding: 14px 28px; border: 1px solid ${btnColor}; display: inline-block; font-weight: 700; letter-spacing: 0.05em;">
                                            ${ctaLabel}
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size: 14px; color: #4a5568; line-height: 1.6; margin-bottom: 0;">
                                If you have any questions, our flight support team is always here to assist. Happy flying!
                            </p>

                            <p style="font-size: 12px; font-style: italic; color: #9aa3a6; margin-top: 25px; margin-bottom: 30px; border-top: 1px solid #f0f3f4; pt-15px; padding-top: 15px;">
                                Note: This is a system generated message. Do not reply.
                            </p>

                            <p style="font-size: 14px; color: #4a5568; margin-bottom: 5px; line-height: 1.4;">
                                Best Regards,<br>
                                <strong style="color: #2d3748;">Team Aerohive</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer divider and logo tag -->
                    <tr>
                        <td align="center" style="padding: 20px 35px 35px 35px; background-color: #fafbfc; border-top: 1px solid #f0f3f4;">
                            <div style="font-size: 15px; font-weight: 700; color: #0f768a; margin-bottom: 8px;">
                                AeroHive Network
                            </div>
                            <div style="font-size: 11.5px; color: #9aa3a6; line-height: 1.45;">
                                &copy; 2026 aerohive.com.lk &bull; Secure Drone Operations<br>
                                Need help? Contact our <a href="mailto:aerohive.help@gmail.com" style="color: #0f768a; text-decoration: none; font-weight: 600;">Support Desk</a>
                            </div>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
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
