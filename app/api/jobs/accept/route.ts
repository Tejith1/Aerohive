import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminWithRetry } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { orderUUID, bookingId, pilotId } = body

        if (!orderUUID && !bookingId) {
            return NextResponse.json({ error: 'orderUUID or bookingId required' }, { status: 400 })
        }

        const supabase = getSupabaseAdminWithRetry()

        if (!supabase) {
            return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 })
        }

        // Fetch booking by either identifier
        let query = supabase.from('bookings').select('id, status, pilot_id, order_uuid')
        if (bookingId) {
            query = query.eq('id', bookingId)
        } else {
            query = query.eq('order_uuid', orderUUID)
        }

        const { data: booking, error: fetchError } = await query.single()

        if (fetchError || !booking) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }

        // Validate pilot ownership if pilotId provided
        if (pilotId && booking.pilot_id !== pilotId) {
            return NextResponse.json({ error: 'Unauthorized: This booking is not assigned to you' }, { status: 403 })
        }

        if (booking.status !== 'PENDING') {
            // Idempotent — if already accepted, return success
            if (booking.status === 'ACCEPTED') {
                return NextResponse.json({ success: true, status: 'ACCEPTED', message: 'Already accepted' })
            }
            return NextResponse.json({ error: `Job is already ${booking.status}` }, { status: 400 })
        }

        // Update status to ACCEPTED
        const { error: updateError } = await supabase
            .from('bookings')
            .update({
                status: 'ACCEPTED',
                updated_at: new Date().toISOString()
            })
            .eq('id', booking.id)

        if (updateError) {
            return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
        }

        return NextResponse.json({ success: true, status: 'ACCEPTED', bookingId: booking.id })

    } catch (error: any) {
        console.error('Job Accept API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
