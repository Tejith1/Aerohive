import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

// Valid status transitions — each status can only advance to the next in order
const STATUS_ORDER = ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ON_SITE', 'VERIFIED', 'IN_PROGRESS', 'COMPLETED']

const VALID_TRANSITIONS: Record<string, string[]> = {
    ACCEPTED: ['EN_ROUTE'],    // Pilot departs
    EN_ROUTE: ['ON_SITE'],     // Pilot arrives
    ON_SITE: ['VERIFIED'],     // Verify OTP on site
    VERIFIED: ['IN_PROGRESS'],  // Mission starts
    IN_PROGRESS: ['COMPLETED'] // Mission done
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { bookingId, newStatus, pilotId } = body

        if (!bookingId || !newStatus) {
            return NextResponse.json({ error: 'bookingId and newStatus are required' }, { status: 400 })
        }

        if (!supabase) {
            return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 })
        }

        // Validate newStatus is a known status
        if (!STATUS_ORDER.includes(newStatus)) {
            return NextResponse.json({ error: `Invalid status: ${newStatus}` }, { status: 400 })
        }

        // Fetch current booking with requirements
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('id, status, pilot_id, requirements')
            .eq('id', bookingId)
            .single()

        if (fetchError || !booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        // Validate pilot ownership
        if (pilotId && booking.pilot_id !== pilotId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Validate status transition: must transition to a status further in the progression sequence
        const currentStatus = ((booking.requirements as any)?.telemetryStatus || booking.status || 'PENDING').toUpperCase()
        const currentIdx = STATUS_ORDER.indexOf(currentStatus)
        const newIdx = STATUS_ORDER.indexOf(newStatus)

        if (newIdx <= currentIdx) {
            return NextResponse.json({
                error: `Cannot transition backward or to the same status. Current: ${currentStatus}, Attempted: ${newStatus}`
            }, { status: 400 })
        }

        // Map status to database-supported constraint value
        const dbStatus = newStatus === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS'

        // Update status
        const { error: updateError } = await supabase
            .from('bookings')
            .update({
                status: dbStatus,
                requirements: {
                    ...(typeof booking.requirements === 'object' ? booking.requirements : {}),
                    telemetryStatus: newStatus
                },
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId)

        if (updateError) {
            console.error('Status update error:', updateError)
            return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
        }

        console.log(`✅ Booking ${bookingId} status: ${currentStatus} → ${newStatus} (stored in DB as ${dbStatus})`)

        return NextResponse.json({
            success: true,
            previousStatus: currentStatus,
            newStatus,
            bookingId
        })

    } catch (error: any) {
        console.error('Update Status API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
