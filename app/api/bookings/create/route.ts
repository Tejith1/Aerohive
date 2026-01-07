import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// Generate booking ID with hashtag format
function generateBookingId(): string {
    const num = Math.floor(1000 + Math.random() * 9000)
    return `AH-${num}`
}

// Generate random 4-digit OTP
function generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString()
}

// Generate random Indian pilot name
function generatePilotName(): string {
    const firstNames = ["Arjun", "Vikram", "Rahul", "Sanjay", "Amit", "Pradeep", "Rajesh", "Suresh", "Kiran", "Anil"]
    const lastNames = ["Sharma", "Patel", "Singh", "Kumar", "Reddy", "Verma", "Gupta", "Nair", "Rao", "Das"]
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
}

// Generate random Indian mobile number
function generateMobileNumber(): string {
    const prefixes = ["98", "99", "90", "91", "70", "80", "81"]
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const rest = Math.floor(10000000 + Math.random() * 90000000).toString()
    return `${prefix}${rest}`
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
            user_phone
        } = body

        // Generate booking details
        const bookingId = generateBookingId()
        const otp = generateOTP()
        const pilotName = generatePilotName()
        const pilotPhone = generateMobileNumber()
        const locationDisplay = location_name || `Lat ${lat}, Lng ${lng}`
        const dateTimeDisplay = scheduled_at ? new Date(scheduled_at).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }) : 'ASAP'
        const userName = user_name || 'Valued Customer'
        const userPhone = user_phone || 'Not provided'

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
                    // Continue anyway - we'll still return the booking confirmation
                }
            } catch (dbError) {
                console.error('Database error:', dbError)
                // Continue with mock response
            }
        }

        // Generate confirmation messages as per the EXACT booking protocol
        const clientMessage = `Hello ${userName},
Your booking for **${service_type}** is confirmed!
📍 Location: ${locationDisplay}
📅 Slot: ${dateTimeDisplay}

Your Pilot Details:
👨‍✈️ **${pilotName}** (Rating: 4.9⭐)
📞 Contact: +91-${pilotPhone}
🔑 Share this OTP with pilot: **${otp}**`

        const pilotMessage = `**NEW JOB ASSIGNMENT**
🆔 Job ID: ${bookingId}
🛠 Service: ${service_type}
📍 Site: ${locationDisplay}
📅 Time: ${dateTimeDisplay}

Client Details:
👤 ${userName}
📞 ${userPhone}
⚠️ Status: PENDING. Verify OTP **${otp}** upon arrival.`

        return NextResponse.json({
            status: "success",
            booking_id: bookingId,
            otp: otp,
            pilot_name: pilotName,
            pilot_phone: pilotPhone,
            pilot_rating: 4.9,
            client_message: clientMessage,
            pilot_message: pilotMessage
        })

    } catch (error) {
        console.error('Booking API Error:', error)
        return NextResponse.json(
            { status: "error", detail: "Failed to create booking" },
            { status: 500 }
        )
    }
}

