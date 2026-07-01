import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminWithRetry } from '@/lib/supabase-admin'
import { sendEmailDirect } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdminWithRetry()
    if (!supabase) {
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 })
    }

    const body = await request.json()
    const { bookingId, status } = body

    if (!bookingId || !status) {
      return NextResponse.json({ error: 'Booking ID and status are required' }, { status: 400 })
    }

    // Fetch the booking
    const { data: booking, error: fetchError } = await (supabase
      .from('service_bookings') as any)
      .select(`
        *,
        user:users(*),
        provider:service_providers(*)
      `)
      .eq('id', bookingId)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    let updatedAddress = typeof booking.location_address === 'string'
      ? JSON.parse(booking.location_address)
      : (typeof booking.location_address === 'object' && booking.location_address ? { ...booking.location_address } : {})
    let otp = null

    // If transitioning to ON_SITE, generate OTP and dispatch SMS
    if (status.toUpperCase() === 'ON_SITE') {
      otp = Math.floor(1000 + Math.random() * 9000).toString()
      updatedAddress.otp_code = otp
      console.log(`🔑 [OTP DISPATCH] Generated provider service OTP for booking ${bookingId}: ${otp}`)

      // Get customer phone & email
      const phone = booking.user?.phone || updatedAddress.phone || booking.notes
      const email = booking.user?.email || updatedAddress.email || booking.client_email
      const clientName = booking.user ? `${booking.user.first_name || ''} ${booking.user.last_name || ''}`.trim() : 'Valued Client'
      const baseUrl = request.nextUrl.origin

      if (email) {
        try {
          await sendEmailDirect({
            to: email,
            subject: 'AeroHive - Service Security OTP Code',
            type: 'client_otp',
            bookingDetails: {
              bookingId: bookingId,
              orderUUID: bookingId,
              otp: otp,
              pilotName: booking.provider?.name || 'Service Provider',
              pilotPhone: booking.provider?.phone || 'Provided',
              pilotEmail: booking.provider?.email || '',
              clientName: clientName,
              clientPhone: phone || 'Provided',
              clientEmail: email,
              serviceType: booking.service_name || 'Drone Service',
              location: updatedAddress.street || 'Site Location',
              scheduledAt: new Date(booking.scheduled_date || Date.now()).toLocaleString(),
              chargesNote: `Use OTP code ${otp} to verify and start your drone service operation.`,
              trackingLink: `${baseUrl}/orders`,
              acceptJobLink: `${baseUrl}/orders`
            }
          })
          console.log(`📧 Dispatched security OTP email to client email ${email}`)
        } catch (emailErr) {
          console.error('Failed to send client OTP email:', emailErr)
        }
      }
    }

    if (status.toUpperCase() === 'REJECTED' || status.toUpperCase() === 'DECLINED') {
      const email = booking.user?.email || updatedAddress.email || booking.client_email
      if (email) {
        try {
          const clientName = booking.user ? `${booking.user.first_name || ''} ${booking.user.last_name || ''}`.trim() : 'Valued Client'
          const baseUrl = request.nextUrl.origin
          await sendEmailDirect({
            to: email,
            subject: 'AeroHive - Service Booking Update | Booking Declined',
            type: 'client_declined',
            bookingDetails: {
              bookingId: bookingId,
              orderUUID: bookingId,
              otp: '****',
              pilotName: booking.provider?.name || 'Service Provider',
              pilotPhone: booking.provider?.phone || 'Provided',
              pilotEmail: booking.provider?.email || '',
              clientName: clientName,
              clientPhone: booking.user?.phone || updatedAddress.phone || 'Provided',
              clientEmail: email,
              serviceType: booking.service_name || 'Drone Service',
              location: updatedAddress.street || 'Site Location',
              scheduledAt: new Date(booking.scheduled_date || Date.now()).toLocaleString(),
              chargesNote: 'The service provider has declined or rejected the active booking. We apologize for the inconvenience.',
              trackingLink: `${baseUrl}/orders`,
              acceptJobLink: `${baseUrl}/orders`
            }
          })
          console.log(`📧 Dispatched rejection notification email to client email ${email}`)
        } catch (emailErr) {
          console.error('Failed to send rejection email:', emailErr)
        }
      }
    }

    // Update status
    const { data, error: updateError } = await (supabase
      .from('service_bookings') as any)
      .update({
        status: status.toUpperCase(),
        location_address: typeof booking.location_address === 'string' ? JSON.stringify(updatedAddress) : updatedAddress,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ success: true, booking: data })

  } catch (error: any) {
    console.error('Update service booking status error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update status' }, { status: 500 })
  }
}
