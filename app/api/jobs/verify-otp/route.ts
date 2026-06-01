import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { orderUUID, bookingId, otp } = body

        if ((!orderUUID && !bookingId) || !otp) {
            return NextResponse.json({ error: 'Booking identifier and OTP are required' }, { status: 400 })
        }

        if (!supabase) {
            return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 })
        }

        // Fetch booking by either identifier
        let query = supabase.from('bookings').select('id, status, otp_code, order_uuid, requirements')
        if (bookingId) {
            query = query.eq('id', bookingId)
        } else {
            query = query.eq('order_uuid', orderUUID)
        }

        const { data: booking, error: fetchError } = await query.single()

        if (fetchError || !booking) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }

        if (booking.otp_code !== otp) {
            return NextResponse.json({ error: 'Invalid OTP. Please ask client to provide the correct code.' }, { status: 401 })
        }

        // Verify status transition — must be ON_SITE to verify
        const currentSubStatus = ((booking.requirements as any)?.telemetryStatus || booking.status || 'PENDING').toUpperCase()
        if (currentSubStatus !== 'ON_SITE') {
            // Allow idempotent call if already verified or beyond
            if (['VERIFIED', 'IN_PROGRESS', 'COMPLETED', 'DONE'].includes(currentSubStatus)) {
                return NextResponse.json({ success: true, status: 'VERIFIED', message: 'Already verified' })
            }
            return NextResponse.json({ error: `Cannot verify. Current status: ${currentSubStatus}. Must be ON_SITE first.` }, { status: 400 })
        }

        // Update status to IN_PROGRESS and store telemetryStatus: VERIFIED
        const { error: updateError } = await supabase
            .from('bookings')
            .update({
                status: 'IN_PROGRESS',
                requirements: {
                    ...(typeof booking.requirements === 'object' ? booking.requirements : {}),
                    telemetryStatus: 'VERIFIED'
                },
                updated_at: new Date().toISOString()
            })
            .eq('id', booking.id)

        if (updateError) {
            console.error('OTP verify status update error:', updateError)
            return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
        }

        return NextResponse.json({ success: true, status: 'VERIFIED', bookingId: booking.id })

    } catch (error: any) {
        console.error('OTP Verification API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
