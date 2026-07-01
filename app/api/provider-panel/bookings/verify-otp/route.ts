import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminWithRetry } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdminWithRetry()
    if (!supabase) {
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 })
    }

    const body = await request.json()
    const { bookingId, otp } = body

    if (!bookingId || !otp) {
      return NextResponse.json({ error: 'Booking ID and OTP are required' }, { status: 400 })
    }

    // Fetch the booking
    const { data: booking, error: fetchError } = await (supabase
      .from('service_bookings') as any)
      .select('id, location_address, status')
      .eq('id', bookingId)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const addressObj = typeof booking.location_address === 'string'
      ? JSON.parse(booking.location_address)
      : (typeof booking.location_address === 'object' && booking.location_address ? booking.location_address : {})
    const savedOtp = addressObj?.otp_code

    if (!savedOtp || savedOtp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP. Please ask the client for the code sent to their email.' }, { status: 400 })
    }

    // Transition status to COMPLETED
    const { data, error: updateError } = await (supabase
      .from('service_bookings') as any)
      .update({
        status: 'COMPLETED',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ success: true, booking: data })

  } catch (error: any) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: error.message || 'Failed to verify OTP' }, { status: 500 })
  }
}
