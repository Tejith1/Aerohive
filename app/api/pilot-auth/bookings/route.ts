import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const pilotId = searchParams.get('pilotId')

        if (!pilotId) {
            return NextResponse.json(
                { error: 'pilotId query parameter is required.' },
                { status: 400 }
            )
        }

        if (!supabase) {
            return NextResponse.json(
                { error: 'Database not configured.' },
                { status: 500 }
            )
        }

        // Step 1: Fetch pilot's hourly rate
        const { data: pilotData, error: pilotError } = await supabase
            .from('drone_pilots')
            .select('hourly_rate, full_name')
            .eq('id', pilotId)
            .single()

        if (pilotError || !pilotData) {
            return NextResponse.json(
                { error: 'Pilot not found.' },
                { status: 404 }
            )
        }

        const hourlyRate = pilotData.hourly_rate || 0

        // Step 2: Fetch ALL fields from bookings for this pilot
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
                id,
                booking_reference,
                service_type,
                status,
                scheduled_at,
                duration_hours,
                client_id,
                otp_code,
                created_at,
                updated_at,
                order_uuid,
                payment_method,
                requirements,
                client_location_lat,
                client_location_lng
            `)
            .eq('pilot_id', pilotId)
            .order('created_at', { ascending: false })

        if (bookingsError) {
            console.error('Error fetching pilot bookings:', bookingsError)
            return NextResponse.json(
                { error: 'Failed to fetch bookings.' },
                { status: 500 }
            )
        }

        if (!bookings || bookings.length === 0) {
            return NextResponse.json({
                success: true,
                bookings: [],
                summary: {
                    total_bookings: 0,
                    total_earnings_estimated: 0,
                    total_earnings_completed: 0,
                    pending_count: 0,
                    in_progress_count: 0,
                    completed_count: 0,
                    cancelled_count: 0,
                    confirmed_count: 0
                }
            })
        }

        // Step 3: Collect unique client IDs — try public users table first
        const clientIds = [...new Set(bookings.map((b: any) => b.client_id).filter(Boolean))]
        let clientMap: Record<string, { name: string; email: string; phone?: string }> = {}

        if (clientIds.length > 0) {
            // Primary: query the public `users` table (has first_name, last_name, email, phone)
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('id, first_name, last_name, email, phone')
                .in('id', clientIds)

            if (!usersError && usersData) {
                usersData.forEach((u: any) => {
                    const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || 'Unknown'
                    clientMap[u.id] = { name, email: u.email || '', phone: u.phone || '' }
                })
            }

            // Fallback: for IDs not in public users, default to a structured client record
            // instead of calling the heavy, blocking Supabase Auth admin API in a slow loop.
            const missingIds = clientIds.filter(id => !clientMap[id])
            if (missingIds.length > 0) {
                missingIds.forEach((uid) => {
                    clientMap[uid] = {
                        name: 'AeroHive Client',
                        email: 'client@aerohive.com',
                        phone: '+91 99999 99999'
                    }
                })
            }
        }

        // Step 4: Enrich bookings with client info + calculated earnings
        const statusNorm = (s: string) => (s || '').toUpperCase()

        const enrichedBookings = bookings.map((booking: any) => {
            const client = clientMap[booking.client_id] || { name: 'Unknown Client', email: '', phone: '' }
            const durationHours = Number(booking.duration_hours) || 0
            const earningsEstimated = Math.round(durationHours * hourlyRate)
            // Determine active mapped sub-status
            const mappedStatus = booking.requirements?.telemetryStatus || booking.status || 'PENDING'
            // Completed jobs earn the full amount; others are estimated
            const isCompleted = ['COMPLETED', 'DONE'].includes(statusNorm(mappedStatus))
            const earningsConfirmed = isCompleted ? earningsEstimated : 0

            return {
                id: booking.id,
                booking_reference: booking.booking_reference,
                service_type: booking.service_type || 'General',
                status: mappedStatus,
                scheduled_at: booking.scheduled_at,
                duration_hours: durationHours,
                payment_method: booking.payment_method || 'UPI',
                client_name: client.name,
                client_email: client.email,
                client_phone: client.phone || '',
                otp_code: booking.otp_code,
                created_at: booking.created_at,
                updated_at: booking.updated_at,
                order_uuid: booking.order_uuid,
                earnings_estimated: earningsEstimated,
                earnings_confirmed: earningsConfirmed,
                hourly_rate: hourlyRate,
                location_name: booking.requirements?.location_name || '',
                requirements: booking.requirements || {},
                client_location_lat: booking.client_location_lat,
                client_location_lng: booking.client_location_lng
            }
        })

        // Step 5: Summary stats
        const summary = {
            total_bookings: enrichedBookings.length,
            total_earnings_estimated: enrichedBookings.reduce((sum: number, b: any) => sum + b.earnings_estimated, 0),
            total_earnings_completed: enrichedBookings.reduce((sum: number, b: any) => sum + b.earnings_confirmed, 0),
            pending_count: enrichedBookings.filter((b: any) => statusNorm(b.status) === 'PENDING').length,
            confirmed_count: enrichedBookings.filter((b: any) => statusNorm(b.status) === 'CONFIRMED').length,
            in_progress_count: enrichedBookings.filter((b: any) => ['ACCEPTED', 'VERIFIED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS'].includes(statusNorm(b.status))).length,
            completed_count: enrichedBookings.filter((b: any) => ['COMPLETED', 'DONE'].includes(statusNorm(b.status))).length,
            cancelled_count: enrichedBookings.filter((b: any) => ['CANCELLED', 'DECLINED'].includes(statusNorm(b.status))).length,
        }

        return NextResponse.json({
            success: true,
            bookings: enrichedBookings,
            summary
        })

    } catch (error: any) {
        console.error('Pilot bookings API error:', error)
        return NextResponse.json(
            { error: 'An unexpected error occurred.' },
            { status: 500 }
        )
    }
}
