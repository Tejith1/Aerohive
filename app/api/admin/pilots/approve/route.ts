import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { pilotId } = body

        if (!pilotId) {
            return NextResponse.json({ error: 'pilotId is required' }, { status: 400 })
        }

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

        console.log(`📡 Preparing approval email for ${pilotName} (${pilotEmail})`)

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
    <title>AeroChat Profile Verified</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f5f0; font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f5f0; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e5dfd3; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);" cellspacing="0" cellpadding="0">
                    
                    <!-- Soft Green Header -->
                    <tr>
                        <td align="center" style="background-color: #eef7f2; padding: 28px 20px; border-bottom: 1px solid #d4ebd9;">
                            <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #2e7d32; letter-spacing: 0.02em;">
                                AeroChat &bull; Application Approved
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
                                Congratulations! Following a detailed verification of your remote pilot credentials, your application to join the AeroChat professional drone operator network has been officially approved.
                            </p>

                            <p style="font-size: 14px; color: #5a503a; line-height: 1.6; margin-bottom: 25px;">
                                Your profile is now active, fully verified, and ready to be matched with commercial mission dispatches in your area. You can log in at any time to manage your active listings and update details.
                            </p>

                            <div style="background-color: #faf9f6; border-left: 4px solid #2e7d32; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                                <div style="font-size: 11px; font-weight: 800; color: #8a806a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Pilot Benefits</div>
                                <ul style="margin: 0; padding-left: 15px; font-size: 13.5px; color: #191919; line-height: 1.6;">
                                    <li>Direct dispatches for local drone missions</li>
                                    <li>Verifiable badge badge on search listings</li>
                                    <li>Seamless invoice generation & secure payouts</li>
                                </ul>
                            </div>

                            <!-- CTA Button -->
                            <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 15px;">
                                <tr>
                                    <td align="center" style="border-radius: 8px;" bgcolor="#2e7d32">
                                        <a href="${request.nextUrl.origin}/login" target="_blank" style="font-size: 14px; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 8px; padding: 12px 24px; border: 1px solid #2e7d32; display: inline-block; font-weight: 700; letter-spacing: 0.03em;">
                                            GO TO AERO HUB DASHBOARD
                                        </a>
                                    </td>
                                </tr>
                            </table>
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

            console.log(`🔌 Transporter initialized. Dispatching approval mail to ${pilotEmail}...`)
            await transporter.sendMail({
                from: `AeroChat Operations <${gmailUser}>`,
                to: pilotEmail,
                subject: `AeroChat | Profile Verified & Active!`,
                html: htmlContent
            })
            console.log(`✅ Approval email successfully sent to ${pilotEmail}`)
        }

        // 3. Mark pilot as verified and active in database, clearing any rejection annotations
        let updatedCertifications = pilot.certifications
        if (pilot.certifications && pilot.certifications.startsWith('REJECTED:')) {
            updatedCertifications = ''
        }

        console.log(`🗑️ Marking pilot application ${pilotId} as approved in database...`)
        const { error: updateError } = await supabase
            .from('drone_pilots')
            .update({
                is_verified: true,
                is_active: true,
                certifications: updatedCertifications
            })
            .eq('id', pilotId)

        if (updateError) {
            console.error('❌ Database update error:', updateError)
            return NextResponse.json({ error: 'Failed to update pilot status' }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Pilot application successfully verified and approved email sent.' })

    } catch (error: any) {
        console.error('❌ Approval Route Critical Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
