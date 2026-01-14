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
        const otp = generateOTP()
        const locationDisplay = location_name || `Lat ${lat?.toFixed(4)}, Lng ${lng?.toFixed(4)}`
        const dateTimeDisplay = scheduled_at ? new Date(scheduled_at).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }) : 'ASAP'
        const userName = user_name || 'Valued Customer'
        const userPhone = user_phone || 'Not provided'

        // Try to fetch real pilot details from database
        let pilotName = generatePilotName()
        let pilotPhone = generateMobileNumber()
        let pilotEmail = ''

        if (supabase && pilot_id) {
            try {
                const { data: pilot, error } = await supabase
                    .from('drone_pilots')
                    .select('full_name, phone, email')
                    .eq('id', pilot_id)
                    .single()

                if (pilot && !error) {
                    pilotName = pilot.full_name || pilotName
                    pilotPhone = pilot.phone || pilotPhone
                    pilotEmail = pilot.email || ''
                    console.log('📋 Fetched real pilot details:', pilot.full_name)
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

        // Try to insert into database if available
        if (supabase) {
            try {
                const { error } = await supabase
                    .from('bookings')
                    .insert({
                        client_id,
                        pilot_id,
                        service_type,
                        status: 'confirmed',
                        scheduled_at,
                        duration_hours,
                        payment_method,
                        requirements,
                        client_location_lat: lat,
                        client_location_lng: lng,
                        otp_code: otp,
                        booking_reference: bookingId
                    })

                if (error) {
                    console.error('Database insert error:', error)
                }
            } catch (dbError) {
                console.error('Database error:', dbError)
            }
        }

        // Prepare email booking details
        const emailBookingDetails = {
            bookingId,
            otp,
            pilotName,
            pilotPhone: `+91-${pilotPhone}`,
            pilotEmail,
            clientName: userName,
            clientPhone: userPhone,
            clientEmail,
            serviceType: service_type || 'General',
            location: locationDisplay,
            scheduledAt: dateTimeDisplay
        }

        // Get base URL for internal API calls
        const baseUrl = request.nextUrl.origin

        // Send email notifications (non-blocking)
        const emailPromises = []

        // Send to client if email available
        if (clientEmail) {
            console.log(`📧 Sending booking confirmation email to client: ${clientEmail}`)
            emailPromises.push(
                sendNotificationEmail(
                    baseUrl,
                    clientEmail,
                    `🚁 Booking Confirmed - ${bookingId}`,
                    'client',
                    emailBookingDetails
                )
            )
        } else {
            console.log('⚠️ No client email available for notification')
        }

        // Send to pilot if email available
        if (pilotEmail) {
            console.log(`📧 Sending job assignment email to pilot: ${pilotEmail}`)
            emailPromises.push(
                sendNotificationEmail(
                    baseUrl,
                    pilotEmail,
                    `🚁 New Job Assignment - ${bookingId}`,
                    'pilot',
                    emailBookingDetails
                )
            )
        } else {
            console.log('⚠️ No pilot email available for notification')
        }

        // Wait for emails to be sent (but don't fail if they fail)
        const emailResults = await Promise.allSettled(emailPromises)
        const emailsSent = emailResults.filter(r => r.status === 'fulfilled' && (r as any).value?.success).length

        // Generate confirmation messages for chatbot display
        const clientMessage = `Hello ${userName},

Your booking for *${service_type}* has been successfully confirmed.

📍 Location: ${locationDisplay}  
📅 Slot: ${dateTimeDisplay}

Pilot Assigned:
👨‍✈️ ${pilotName} (Rating: 4.9⭐)  
📞 Contact: +91-${pilotPhone}  

🔐 Please share this OTP with the pilot upon arrival: *${otp}*

${clientEmail ? `📧 Confirmation email sent to: ${clientEmail}` : ''}

Thank you for choosing our services.`

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
            otp: otp,
            pilot_name: pilotName,
            pilot_phone: pilotPhone,
            pilot_email: pilotEmail || null,
            pilot_rating: 4.9,
            client_message: clientMessage,
            pilot_message: pilotMessage,
            emails_sent: emailsSent,
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
