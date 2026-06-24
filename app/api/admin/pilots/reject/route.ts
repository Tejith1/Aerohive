import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminWithRetry } from '@/lib/supabase-admin'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { pilotId, feedback } = body

        if (!pilotId || !feedback) {
            return NextResponse.json({ error: 'pilotId and feedback are required' }, { status: 400 })
        }

        const supabase = getSupabaseAdminWithRetry()

        if (!supabase) {
            return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 })
        }

        // 1. Fetch pilot details first
        const { data: pilot, error: fetchError } = await supabase
            .from('drone_pilots')
            .select('*')
            .eq('id', pilotId)
            .single()

        if (fetchError || !pilot) {
            return NextResponse.json({ error: 'Pilot application not found' }, { status: 404 })
        }

        const pilotEmail = pilot.email
        const pilotName = pilot.full_name || 'Drone Pilot'
        const isRevocation = pilot.is_verified === true
        const introText = isRevocation
            ? 'We are writing to inform you that following a recent audit of active profiles by our operations board, your AeroChat pilot verification has been suspended or revoked.'
            : 'Thank you for submitting your application to join the AeroChat professional drone operator network. Following a detailed review of your credentials by our operations board, we regret to inform you that your application has been declined at this time.'
        const feedbackLabel = isRevocation ? 'Revocation Reason' : 'Rejection Feedback'

        console.log(`📡 Preparing rejection/revocation email for ${pilotName} (${pilotEmail})`)

        // 2. Setup Nodemailer Transporter
        const gmailUser = process.env.GMAIL_USER
        const gmailPass = process.env.GMAIL_APP_PASSWORD

        if (!gmailUser || !gmailPass) {
            console.error('❌ GMAIL credentials missing in environment variables')
        } else {
            // Build modern premium HTML email template with AeroChat styling (no italics!)
            const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AeroChat Status Update</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f5f0; font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f5f0; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e5dfd3; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);" cellspacing="0" cellpadding="0">
                    
                    <!-- Soft Crimson Header -->
                    <tr>
                        <td align="center" style="background-color: #fcf1f1; padding: 28px 20px; border-bottom: 1px solid #f5d3d3;">
                            <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #c24444; letter-spacing: 0.02em;">
                                AeroChat &bull; Status Update
                            </h2>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 40px 35px 30px 35px;">
                            <p style="font-size: 16px; font-weight: 700; color: #191919; margin-top: 0; margin-bottom: 12px;">
                                Hello ${pilotName},
                            </p>
                            
                            <p style="font-size: 14px; color: #5a503a; line-height: 1.6; margin-bottom: 25px;">
                                ${introText}
                            </p>

                            <!-- Feedback Box -->
                            <div style="background-color: #faf9f6; border-left: 4px solid #c24444; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                                <div style="font-size: 11px; font-weight: 800; color: #8a806a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">${feedbackLabel}</div>
                                <div style="font-size: 14px; font-weight: 500; color: #191919; line-height: 1.5; white-space: pre-wrap;">${feedback}</div>
                            </div>

                            <p style="font-size: 13.5px; color: #8a806a; line-height: 1.6; margin-bottom: 0;">
                                If you are able to rectify the issues listed above, you are welcome to submit updated and verified documentation.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer divider and logo tag -->
                    <tr>
                        <td align="center" style="padding: 20px 35px 35px 35px; background-color: #faf9f6; border-top: 1px solid #e5dfd3;">
                            <div style="font-size: 15px; font-weight: 700; color: #191919; margin-bottom: 6px;">
                                AeroChat Network
                            </div>
                            <div style="font-size: 11.5px; color: #8a806a; line-height: 1.45;">
                                &copy; 2026 aerohive.com.lk &bull; Premium Drone Operations
                            </div>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`

            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: gmailUser,
                    pass: gmailPass.replace(/\s+/g, '')
                },
                tls: {
                    rejectUnauthorized: false
                }
            })

            console.log(`🔌 Transporter initialized. Dispatching rejection mail to ${pilotEmail}...`)
            await transporter.sendMail({
                from: `AeroChat Operations <${gmailUser}>`,
                to: pilotEmail,
                subject: isRevocation ? `AeroChat | Verification Status Updated` : `AeroChat | Profile Application Status`,
                html: htmlContent
            })
            console.log(`✅ Rejection email successfully sent to ${pilotEmail}`)
        }

        // 3. Mark pilot as rejected in database instead of deleting
        console.log(`🗑️ Marking pilot application ${pilotId} as rejected in database...`)
        const { error: updateError } = await supabase
            .from('drone_pilots')
            .update({
                is_verified: false,
                is_active: false,
                certifications: `REJECTED: ${feedback}`
            })
            .eq('id', pilotId)

        if (updateError) {
            console.error('❌ Database update error:', updateError)
            return NextResponse.json({ error: 'Failed to update pilot status' }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Pilot application successfully marked as rejected and email sent.' })

    } catch (error: any) {
        console.error('❌ Rejection Route Critical Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
