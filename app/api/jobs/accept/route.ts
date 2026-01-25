import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { orderUUID } = body

        if (!orderUUID) {
            return NextResponse.json({ error: 'UUID required' }, { status: 400 })
        }

        if (!supabase) {
            return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 })
        }

        // Check current status
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('id, status')
            .eq('order_uuid', orderUUID)
            .single()

        if (fetchError || !booking) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }

        if (booking.status !== 'PENDING') {
            return NextResponse.json({ error: `Job is already ${booking.status}` }, { status: 400 })
        }

        // Update status to ACCEPTED
        const { error: updateError } = await supabase
            .from('bookings')
            .update({ status: 'ACCEPTED' })
            .eq('order_uuid', orderUUID)

        if (updateError) {
            return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
        }

        return NextResponse.json({ success: true, status: 'ACCEPTED' })

    } catch (error: any) {
        console.error('Job Accept API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
