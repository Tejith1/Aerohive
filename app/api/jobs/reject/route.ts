import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmailDirect } from '@/lib/email'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { bookingId, pilotId } = body

        if (!bookingId) {
            return NextResponse.json({ error: 'bookingId is required' }, { status: 400 })
        }

        if (!supabase) {
            return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 })
        }

        // Fetch booking to validate (with pilot details nested)
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select(`
                *,
                pilot:drone_pilots(*)
            `)
            .eq('id', bookingId)
            .single()

        if (fetchError || !booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
        }

        // Validate pilot ownership
        if (pilotId && booking.pilot_id !== pilotId) {
            return NextResponse.json({ error: 'Unauthorized: This booking is not assigned to you' }, { status: 403 })
        }

        // Validate booking status case-insensitively (allowing rejection of PENDING, CONFIRMED, or ACCEPTED)
        const currentStatus = (booking.status || '').toUpperCase()
        if (currentStatus !== 'PENDING' && currentStatus !== 'CONFIRMED' && currentStatus !== 'ACCEPTED') {
            return NextResponse.json({ error: `Cannot reject. Current status: ${booking.status}` }, { status: 400 })
        }

        // Update status to 'cancelled' in database to comply with DB check constraints
        const { error: updateError } = await supabase
            .from('bookings')
            .update({
                status: 'cancelled',
                requirements: {
                    ...(typeof booking.requirements === 'object' ? booking.requirements : {}),
                    telemetryStatus: 'DECLINED'
                },
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId)

        if (updateError) {
            console.error('Reject update error:', updateError)
            return NextResponse.json({ error: 'Failed to reject booking' }, { status: 500 })
        }

        // Fetch Client User info for email dispatch
        let clientEmail = ''
        let clientName = 'Valued Customer'
        let clientPhone = ''
        
        if (booking.client_id) {
            try {
                const { data: user } = await supabase
                    .from('users')
                    .select('email, first_name, last_name, phone')
                    .eq('id', booking.client_id)
                    .single()
                
                if (user) {
                    clientEmail = user.email || ''
                    clientName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || clientName
                    clientPhone = user.phone || ''
                }
            } catch (userErr) {
                console.error('Failed to lookup client email during rejection:', userErr)
            }
        }

        // Send Email Notification to client about the rejection
        if (clientEmail) {
            try {
                const baseUrl = request.nextUrl.origin
                const cleanRef = (booking.order_uuid || booking.booking_reference || booking.id || '').replace(/^#/, '')
                const trackingLink = `${baseUrl}/track/${cleanRef}`

                const emailBookingDetails = {
                    bookingId: booking.booking_reference || `#AH-${booking.id.slice(0, 4)}`,
                    orderUUID: booking.order_uuid || booking.id,
                    otp: booking.otp_code || '****',
                    pilotName: booking.pilot?.full_name || 'Assigned Pilot',
                    pilotPhone: booking.pilot?.phone || '',
                    pilotEmail: booking.pilot?.email || '',
                    clientName: clientName,
                    clientPhone: clientPhone,
                    clientEmail: clientEmail,
                    serviceType: booking.service_type || 'General Service',
                    location: booking.client_location_lat && booking.client_location_lng
                        ? `Lat ${Number(booking.client_location_lat).toFixed(4)}, Lng ${Number(booking.client_location_lng).toFixed(4)}`
                        : 'Specified Area',
                    scheduledAt: booking.scheduled_at ? new Date(booking.scheduled_at).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                    }) : 'Scheduled Date',
                    durationHours: booking.duration_hours,
                    trackingLink: trackingLink
                }

                console.log(`📧 Dispatching Job Decline notification email to client: ${clientEmail}`)
                await sendEmailDirect({
                    to: clientEmail,
                    subject: `AeroHive Mission Update | Booking Declined`,
                    type: 'client_declined',
                    bookingDetails: emailBookingDetails
                })
            } catch (mailErr: any) {
                console.error('Failed to dispatch job decline email:', mailErr.message)
            }
        }

        return NextResponse.json({ success: true, status: 'REJECTED' })

    } catch (error: any) {
        console.error('Job Reject API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
