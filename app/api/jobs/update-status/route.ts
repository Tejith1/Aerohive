import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminWithRetry } from '@/lib/supabase-admin'

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

        const supabase = getSupabaseAdminWithRetry()

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

        // Sync pilot's completed_jobs count in the drone_pilots table
        if (booking.pilot_id) {
            try {
                const { count, error: countError } = await supabase
                    .from('bookings')
                    .select('*', { count: 'exact', head: true })
                    .eq('pilot_id', booking.pilot_id)
                    .eq('status', 'COMPLETED')

                if (!countError && count !== null) {
                    const { error: pilotUpdateError } = await supabase
                        .from('drone_pilots')
                        .update({ completed_jobs: count })
                        .eq('id', booking.pilot_id)
                    
                    if (pilotUpdateError) {
                        console.error('Failed to sync pilot completed_jobs:', pilotUpdateError)
                    } else {
                        console.log(`Synced completed_jobs for pilot ${booking.pilot_id} to ${count}`)
                    }
                }
            } catch (syncErr) {
                console.error('Error syncing pilot completed_jobs count:', syncErr)
            }
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
