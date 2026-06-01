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

        // 1. Fetch pilot details
        const { data: pilot, error: fetchError } = await supabase
            .from('drone_pilots')
            .select('*')
            .eq('id', pilotId)
            .single()

        if (fetchError || !pilot) {
            return NextResponse.json({ error: 'Pilot profile not found' }, { status: 404 })
        }

        const pilotEmail = pilot.email
        const pilotName = pilot.full_name || 'Drone Pilot'

        // 2. Identify missing fields
        const missingFields: string[] = []
        if (!pilot.dgca_number || pilot.dgca_number.trim() === '') {
            missingFields.push('DGCA Drone License Number')
        }
        if (!pilot.experience || pilot.experience.trim() === '' || pilot.experience.toLowerCase() === 'none') {
            missingFields.push('Years of Flight Experience')
        }
        if (!pilot.specializations || pilot.specializations.trim() === '' || pilot.specializations.toLowerCase() === 'none') {
            missingFields.push('Service Specializations (e.g. 3D Mapping, Spraying)')
        }
        if (!pilot.about || pilot.about.trim() === '') {
            missingFields.push('Profile Bio (About Section)')
        }
        if (!pilot.profile_image_url) {
            missingFields.push('Profile Photo')
        }
        if (!pilot.certificate_image_url) {
            missingFields.push('DGCA Remote Pilot Certificate Copy')
        }

        const missingItemsList = missingFields.length > 0 
            ? missingFields.map(field => `<li style="margin-bottom: 8px; font-size: 13.5px; color: #191919; font-weight: 600;">☑ ${field}</li>`).join('')
            : `<li style="margin-bottom: 8px; font-size: 13.5px; color: #191919; font-weight: 600;">☑ Comprehensive Profile Audit details</li>`

        console.log(`📡 Preparing profile completion reminder email for ${pilotName} (${pilotEmail})`)

        // 3. Setup Nodemailer Transporter
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
    <title>Complete your AeroChat Profile</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f5f0; font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7f5f0; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="100%" max-width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e5dfd3; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);" cellspacing="0" cellpadding="0">
                    
                    <!-- Soft Deep Teal Header -->
                    <tr>
                        <td align="center" style="background-color: #f0f4f5; padding: 28px 20px; border-bottom: 1px solid #dbe2e3;">
                            <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #0f768a; letter-spacing: 0.02em;">
                                AeroChat &bull; Action Required
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
                                Thank you for being a part of the AeroChat professional drone operator network.
                                We noticed that some essential details are currently missing from your profile. To ensure your profile is fully operational, visible to clients, and compliant for dispatching commercial missions, please log in and complete the following items:
                            </p>

                            <!-- Missing Items Box -->
                            <div style="background-color: #faf9f6; border-left: 4px solid #0f768a; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
                                <div style="font-size: 11px; font-weight: 800; color: #8a806a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">Missing Registration Fields</div>
                                <ul style="margin: 0; padding-left: 5px; list-style-type: none;">
                                    ${missingItemsList}
                                </ul>
                            </div>

                            <p style="font-size: 14px; color: #5a503a; line-height: 1.6; margin-bottom: 30px;">
                                Completing these fields helps clients find your profile easily and verifies your eligibility under DGCA rules.
                            </p>

                            <!-- CTA Button -->
                            <table border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 15px;">
                                <tr>
                                    <td align="center" style="border-radius: 8px;" bgcolor="#0f768a">
                                        <a href="${request.nextUrl.origin}/login" target="_blank" style="font-size: 14px; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 8px; padding: 12px 24px; border: 1px solid #0f768a; display: inline-block; font-weight: 700; letter-spacing: 0.03em;">
                                            COMPLETE PROFILE REGISTRATION
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

            console.log(`🔌 Transporter initialized. Dispatching reminder mail to ${pilotEmail}...`)
            await transporter.sendMail({
                from: `AeroChat Operations <${gmailUser}>`,
                to: pilotEmail,
                subject: `Action Required: Complete your AeroChat Pilot Profile`,
                html: htmlContent
            })
            console.log(`✅ Reminder email successfully sent to ${pilotEmail}`)
        }

        return NextResponse.json({ success: true, message: 'Profile completion reminder email sent.' })

    } catch (error: any) {
        console.error('❌ Reminder Route Critical Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
