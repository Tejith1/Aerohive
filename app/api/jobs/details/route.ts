import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Use Service Role to bypass RLS for secure UUID lookup
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const uuid = searchParams.get('uuid')

        if (!uuid) {
            return NextResponse.json({ error: 'UUID required' }, { status: 400 })
        }

        if (!supabase) {
            return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 })
        }

        // Fetch booking details
        const { data: booking, error } = await supabase
            .from('bookings')
            .select(`
                id,
                order_uuid,
                booking_reference,
                status,
                service_type,
                scheduled_at,
                duration_hours,
                client_location_lat,
                client_location_lng,
                otp_code,
                users (
                    full_name,
                    phone
                ),
                drone_pilots (
                    full_name,
                    phone,
                    hourly_rate,
                    current_location
                )
            `)
            .eq('order_uuid', uuid)
            .single()

        if (error || !booking) {
            return NextResponse.json({ error: 'Invalid Job ID' }, { status: 404 })
        }

        // Helper to handle potential array response from joins
        const getRelation = (data: any) => Array.isArray(data) ? data[0] : data
        const pilot = getRelation(booking.drone_pilots)
        const client = getRelation(booking.users)

        // Map to safe response object
        const isTrackingActive = booking.status === 'IN_PROGRESS'

        // Parse pilot location if available and tracking is active
        let pilotLocation = null
        if (isTrackingActive && pilot?.current_location) {
            // Supabase might return GeoJSON or string. Handle accordingly.
            pilotLocation = pilot.current_location
        }

        const responseHelper = {
            id: booking.booking_reference,
            orderUUID: booking.order_uuid,
            status: booking.status,
            serviceType: booking.service_type,
            scheduledAt: booking.scheduled_at,
            durationHours: booking.duration_hours,
            clientName: client?.full_name || 'Client',
            clientPhone: client?.phone || 'Provided',
            lat: booking.client_location_lat,
            lng: booking.client_location_lng,
            otp: booking.otp_code,
            pilotLocation, // Return pilot location if active
            pilotName: pilot?.full_name, // Added pilot name for UI
            pilotPhone: pilot?.phone,
            // Calculate estimate (if hourly rate exists)
            estimatedAmount: pilot?.hourly_rate
                ? (pilot.hourly_rate * (booking.duration_hours || 0))
                : 0
        }

        return NextResponse.json(responseHelper)

    } catch (error: any) {
        console.error('Job Details API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
