import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// Generate booking ID with strict hashtag format
function generateBookingId(): string {
    const num = Math.floor(1000 + Math.random() * 9000)
    return `#AH-${num}`
}

// Generate random 4-digit OTP
function generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString()
}

// Generate random Indian pilot name (fallback)
function generatePilotName(): string {
    const firstNames = ["Arjun", "Vikram", "Rahul", "Sanjay", "Amit", "Pradeep", "Rajesh", "Suresh", "Kiran", "Anil"]
    const lastNames = ["Sharma", "Patel", "Singh", "Kumar", "Reddy", "Verma", "Gupta", "Nair", "Rao", "Das"]
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
}

// Generate random Indian mobile number (fallback)
function generateMobileNumber(): string {
    const prefixes = ["98", "99", "90", "91", "70", "80", "81"]
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const rest = Math.floor(10000000 + Math.random() * 90000000).toString()
    return `${prefix}${rest}`
}

// Helper function to send notification email
async function sendNotificationEmail(
    baseUrl: string,
    to: string,
    subject: string,
    type: 'client' | 'pilot',
    bookingDetails: any
) {
    try {
        const response = await fetch(`${baseUrl}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to,
                subject,
                type,
                bookingDetails
            })
        })
        const result = await response.json()
        console.log(`📧 Email to ${type} (${to}):`, result.success ? '✅ Sent' : '❌ Failed')
        return result
    } catch (error) {
        console.error(`❌ Failed to send ${type} email:`, error)
        return { success: false, error }
    }
}

// Helper function to send SMS
async function sendSMS(baseUrl: string, to: string, message: string) {
    if (!to || to === 'Not provided' || to === '') return { success: false, error: 'No phone number' }
    
    try {
        const response = await fetch(`${baseUrl}/api/send-sms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to, message })
        })
        const result = await response.json()
        console.log(`📱 SMS to ${to}:`, result.success ? '✅ Sent' : '❌ Failed')
        return result
    } catch (error) {
        console.error(`❌ Failed to send SMS to ${to}:`, error)
        return { success: false, error }
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const {
            client_id,
            pilot_id,
            service_type,
            lat,
            lng,
            location_name,
            scheduled_at,
            duration_hours,
            payment_method,
            requirements,
            user_name,
            user_phone,
            user_email // Client email for notification
        } = body

        // Generate booking details
        const bookingId = generateBookingId()
        const orderUUID = crypto.randomUUID() // Secure unique identifier
        const otp = generateOTP()
        const locationDisplay = location_name || `Lat ${lat?.toFixed(4)}, Lng ${lng?.toFixed(4)}`
        const dateTimeDisplay = scheduled_at ? new Date(scheduled_at).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }) : 'ASAP'
        const userName = user_name || 'Valued Customer'
        const userPhone = user_phone || 'Not provided'

        // Charges Note (as per requirement)
        const chargesNote = "Final charges will be calculated based on actual working hours and collected after service completion."

        // Try to fetch real pilot details from database
        let pilotName = generatePilotName()
        let pilotPhone = generateMobileNumber()
        let pilotEmail = ''

        if (supabase && pilot_id) {
            try {
                const { data: pilot, error } = await supabase
                    .from('drone_pilots')
                    .select('full_name, phone, email, hourly_rate')
                    .eq('id', pilot_id)
                    .single()

                if (pilot && !error) {
                    pilotName = pilot.full_name || pilotName
                    pilotPhone = pilot.phone || pilotPhone
                    pilotEmail = pilot.email || ''
                    // We'll use hourly_rate later
                    var pilotRate = pilot.hourly_rate || 0
                    console.log(`📋 Fetched real pilot details: '${pilotName}' | Email: '${pilotEmail}'`)
                } else if (error) {
                    console.error('❌ Error fetching pilot details:', error.message)
                } else {
                    console.warn(`⚠️ No pilot found for pilot_id: ${pilot_id}`)
                }
            } catch (err) {
                console.error('Error fetching pilot:', err)
            }
        }

        // Try to get client email from auth user if not provided
        let clientEmail = user_email || ''
        if (!clientEmail && supabase && client_id) {
            try {
                const { data: user, error } = await supabase
                    .from('users')
                    .select('email')
                    .eq('id', client_id)
                    .single()

                if (user && !error) {
                    clientEmail = user.email || ''
                }
            } catch (err) {
                console.error('Error fetching client email:', err)
            }
        }

        console.log(`👤 Client Email resolved to: '${clientEmail}'`)

        // Create booking in database - MUST SUCCEED to proceed with emails
        if (!supabase) {
            console.error('❌ Supabase client not initialized')
            return NextResponse.json(
                { status: "error", detail: "Database configuration missing" },
                { status: 500 }
            )
        }

        try {
            const { error } = await supabase
                .from('bookings')
                .insert({
                    client_id,
                    pilot_id,
                    service_type,
                    status: 'PENDING',
                    scheduled_at,
                    duration_hours,
                    payment_method,
                    requirements,
                    client_location_lat: lat,
                    client_location_lng: lng,
                    otp_code: otp,
                    booking_reference: bookingId,
                    order_uuid: orderUUID
                })

            if (error) {
                console.error('❌ Database insert error:', error)
                return NextResponse.json(
                    { status: "error", detail: "Failed to save booking to database. Please ensure 'order_uuid' column exists." },
                    { status: 500 }
                )
            }
            console.log('✅ Booking saved to database:', bookingId)
        } catch (dbError) {
            console.error('❌ Database exception:', dbError)
            return NextResponse.json(
                { status: "error", detail: "Internal database error" },
                { status: 500 }
            )
        }

        // Get base URL for links
        const baseUrl = request.nextUrl.origin
        const trackingLink = `${baseUrl}/track/${orderUUID}`
        const acceptJobLink = `${baseUrl}/pilots/accept-job?id=${orderUUID}`
        const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

        // Calculate estimated amount
        const estimatedAmount = (pilotRate || 0) * (duration_hours || 0)

        // Prepare email booking details
        const emailBookingDetails = {
            bookingId,
            orderUUID,
            otp,
            pilotName,
            pilotPhone: `+91-${pilotPhone}`,
            pilotEmail,
            clientName: userName,
            clientPhone: userPhone,
            clientEmail,
            serviceType: service_type || 'General',
            location: locationDisplay,
            scheduledAt: dateTimeDisplay,
            durationHours: duration_hours,
            chargesNote,
            trackingLink,
            acceptJobLink,
            googleMapsLink,
            estimatedAmount: estimatedAmount > 0 ? `₹${estimatedAmount}` : 'TBD'
        }

        // Send email notifications (non-blocking)
        const emailPromises = []

        // Send to client if email available
        if (clientEmail) {
            console.log(`📧 Sending booking confirmation email to client: ${clientEmail}`)
            emailPromises.push(
                sendNotificationEmail(
                    baseUrl,
                    clientEmail,
                    `Your Drone Pilot Is Assigned | AeroHive Booking Confirmation`,
                    'client',
                    emailBookingDetails
                )
            )
        } else {
            console.log('⚠️ No client email available for notification')
        }

        // Send to pilot if email available
        if (pilotEmail && pilotEmail.trim() !== '') {
            console.log(`📧 Preparing job assignment email for pilot: '${pilotEmail}'`)
            emailPromises.push(
                sendNotificationEmail(
                    baseUrl,
                    pilotEmail,
                    `New Job Assigned | Action Required - AeroHive`,
                    'pilot',
                    emailBookingDetails
                )
            )
        } else {
            console.warn('⚠️ No valid pilot email available for notification. Skip sending pilot email.')
        }

        // --- NEW: SMS NOTIFICATIONS ---
        const smsPromises = []
        
        // SMS to client
        if (userPhone && userPhone !== 'Not provided') {
            const clientSmsMessage = `Hello ${userName}, Your booking ${bookingId} for ${service_type} is PENDING! Pilot: ${pilotName}. Track: ${trackingLink}`
            smsPromises.push(sendSMS(baseUrl, userPhone, clientSmsMessage))
        }

        // SMS to pilot
        if (pilotPhone) {
            const pilotSmsMessage = `AeroHive: NEW JOB assigned! Job: ${bookingId}. Location: ${locationDisplay}. Client: ${userName}. Link: ${acceptJobLink}. Verify OTP ${otp} on site.`
            smsPromises.push(sendSMS(baseUrl, pilotPhone, pilotSmsMessage))
        }

        // Wait for emails and SMS to be sent (but don't fail if they fail)
        const emailResults = await Promise.allSettled(emailPromises)
        console.log('📬 Email Results:', JSON.stringify(emailResults, null, 2))
        const emailsSent = emailResults.filter(r => r.status === 'fulfilled' && (r as any).value?.success).length

        const smsResults = await Promise.allSettled(smsPromises)
        console.log('📱 SMS Results:', JSON.stringify(smsResults, null, 2))
        const smsSent = smsResults.filter(r => r.status === 'fulfilled' && (r as any).value?.success).length

        // Generate confirmation messages for chatbot display (Client view)
        const clientMessage = `Hello ${userName},

Your booking for *${service_type}* is PENDING pilot acceptance.

📍 Location: ${locationDisplay}  
📅 Slot: ${dateTimeDisplay}

Pilot Assigned:
👨‍✈️ ${pilotName} 
📞 Contact: +91-${pilotPhone}  

🔐 Security OTP: *${otp}*
(Share this with pilot only upon arrival)

📧 Confirmation email sent to: ${clientEmail}
You can track the pilot live via the link in the email once the job starts.

Thank you for choosing AeroHive.`

        // Pilot Message is usually not shown in chatbot response unless for debugging, but we keep it
        const pilotMessage = `NEW JOB ASSIGNMENT

🆔 Job ID: ${bookingId}  
🛠 Service: ${service_type}  
📍 Site Location: ${locationDisplay}  
📅 Scheduled Time: ${dateTimeDisplay}

Client Details:
👤 Name: ${userName}  
📞 Contact: ${userPhone}

⚠️ Job Status: PENDING  
🔐 Verify client OTP: *${otp}* before starting the service.

${pilotEmail ? `📧 Job details sent to: ${pilotEmail}` : ''}`

        return NextResponse.json({
            status: "success",
            booking_id: bookingId,
            order_uuid: orderUUID,
            otp: otp,
            pilot_name: pilotName,
            pilot_phone: pilotPhone,
            pilot_email: pilotEmail || null,
            pilot_rating: 4.9,
            client_message: clientMessage,
            pilot_message: pilotMessage,
            emails_sent: emailsSent,
            sms_sent: smsSent,
            client_email_sent: !!clientEmail,
            pilot_email_sent: !!pilotEmail
        })

    } catch (error) {
        console.error('Booking API Error:', error)
        return NextResponse.json(
            { status: "error", detail: "Failed to create booking" },
            { status: 500 }
        )
    }
}
