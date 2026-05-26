import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { orderUUID, otp } = body

        if (!orderUUID || !otp) {
            return NextResponse.json({ error: 'UUID and OTP required' }, { status: 400 })
        }

        if (!supabase) {
            return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 })
        }

        // Fetch booking to verify OTP
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('id, status, otp_code')
            .eq('order_uuid', orderUUID)
            .single()

        if (fetchError || !booking) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }

        if (booking.otp_code !== otp) {
            return NextResponse.json({ error: 'Invalid OTP. Please ask client to provide the correct code.' }, { status: 401 })
        }

        // Verify status transition
        if (booking.status !== 'ACCEPTED') {
            // Allow retry if already in progress (idempotent)
            if (booking.status === 'IN_PROGRESS') {
                return NextResponse.json({ success: true, status: 'IN_PROGRESS', message: 'Mission already started' })
            }
            return NextResponse.json({ error: `Cannot start mission. Current status: ${booking.status}` }, { status: 400 })
        }

        // Update status to IN_PROGRESS
        const { error: updateError } = await supabase
            .from('bookings')
            .update({
                status: 'IN_PROGRESS',
                updated_at: new Date().toISOString()
            })
            .eq('order_uuid', orderUUID)

        if (updateError) {
            return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
        }

        return NextResponse.json({ success: true, status: 'IN_PROGRESS' })

    } catch (error: any) {
        console.error('OTP Verification API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
