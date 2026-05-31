import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Use Service Role to bypass RLS for secure UUID lookup
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

const STATUS_ORDER = ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ON_SITE', 'VERIFIED', 'IN_PROGRESS', 'COMPLETED']

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

        // Fetch booking details without joining the user relation (which lacks a foreign key constraint).
        let dbQuery = supabase
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
                requirements,
                created_at,
                updated_at,
                client_id,
                drone_pilots (
                    full_name,
                    phone,
                    hourly_rate,
                    location
                )
            `)

        const decoded = decodeURIComponent(uuid)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decoded)
        if (isUUID) {
            dbQuery = dbQuery.or(`order_uuid.eq.${decoded},id.eq.${decoded}`)
        } else {
            const cleanRef = decoded.replace(/^#/, '').toUpperCase()
            dbQuery = dbQuery.in('booking_reference', [cleanRef, `#${cleanRef}`])
        }

        const { data: booking, error } = await dbQuery.single()

        if (error || !booking) {
            console.error('Supabase booking query error:', error, 'for UUID:', uuid);
            return NextResponse.json({ error: 'Invalid Job ID' }, { status: 404 })
        }

        // Helper to handle potential array response from joins
        const getRelation = (data: any) => Array.isArray(data) ? data[0] : data
        const pilot = getRelation(booking.drone_pilots)

        // Fetch client details manually using the client_id to prevent PostgREST cache schema relationship errors
        let client = null
        if (booking.client_id) {
            const { data: userData } = await supabase
                .from('users')
                .select('first_name, last_name, phone')
                .eq('id', booking.client_id)
                .single()
            client = userData
        }

        const currentStatus = ((booking.requirements as any)?.telemetryStatus || booking.status || 'PENDING').toUpperCase()
        const statusIndex = STATUS_ORDER.indexOf(currentStatus)
        const isTrackingActive = ['EN_ROUTE', 'ON_SITE', 'IN_PROGRESS'].includes(currentStatus)

        // Parse pilot location if available and tracking is active
        let pilotLocation = null
        if (isTrackingActive && pilot) {
            if (pilot.location) {
                const parts = String(pilot.location).split(',')
                if (parts.length === 2) {
                    const lat = parseFloat(parts[0])
                    const lng = parseFloat(parts[1])
                    if (!isNaN(lat) && !isNaN(lng)) {
                        pilotLocation = { coordinates: [lng, lat] }
                    }
                }
            }
            if (!pilotLocation) {
                pilotLocation = { coordinates: [booking.client_location_lng || 77.5946, booking.client_location_lat || 12.9716] }
            }
        }

        // Build status steps for the tracker
        const statusSteps = STATUS_ORDER.map((status, index) => ({
            key: status,
            label: getStatusLabel(status),
            description: getStatusDescription(status),
            completed: index <= statusIndex,
            current: index === statusIndex,
            index
        }))

        const responseHelper = {
            id: booking.booking_reference,
            orderUUID: booking.order_uuid,
            status: currentStatus,
            statusIndex,
            statusSteps,
            serviceType: booking.service_type,
            scheduledAt: booking.scheduled_at,
            durationHours: booking.duration_hours,
            clientName: client
                ? `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'AeroHive Client'
                : 'AeroHive Client',
            clientPhone: client?.phone || 'Provided',
            lat: booking.client_location_lat,
            lng: booking.client_location_lng,
            // Only show OTP before verification is complete
            otp: statusIndex < 2 ? booking.otp_code : null,
            pilotLocation,
            pilotName: pilot?.full_name,
            pilotPhone: pilot?.phone,
            createdAt: booking.created_at,
            updatedAt: booking.updated_at,
            isTrackingActive,
            estimatedAmount: pilot?.hourly_rate
                ? (pilot.hourly_rate * (booking.duration_hours || 0))
                : 0,
            totalAmount: (booking as any).total_amount || (pilot?.hourly_rate
                ? (pilot.hourly_rate * (booking.duration_hours || 2))
                : 3000)
        }

        return NextResponse.json(responseHelper)

    } catch (error: any) {
        console.error('Job Details API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        PENDING: 'Booking Placed',
        ACCEPTED: 'Pilot Accepted',
        VERIFIED: 'Identity Verified',
        EN_ROUTE: 'Started',
        ON_SITE: 'Reached Location',
        IN_PROGRESS: 'In Work Shoot',
        COMPLETED: 'Completed'
    }
    return labels[status] || status
}

function getStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
        PENDING: 'Your booking has been placed. Waiting for pilot confirmation.',
        ACCEPTED: 'Pilot has accepted your booking! Preparing for departure.',
        EN_ROUTE: 'Pilot has started their journey to your location! Telemetry active.',
        ON_SITE: 'Pilot has reached your location. Please share your OTP code.',
        VERIFIED: 'Identity verified successfully. Preparing drone flight.',
        IN_PROGRESS: 'Drone work shoot is in progress...',
        COMPLETED: 'Mission completed successfully! Thank you for choosing AeroHive.'
    }
    return descriptions[status] || ''
}
