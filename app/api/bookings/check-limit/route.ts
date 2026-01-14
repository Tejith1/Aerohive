import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

const MAX_BOOKINGS = 2

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            )
        }

        if (!supabase) {
            // No database - allow booking (for dev/testing)
            return NextResponse.json({
                canBook: true,
                currentCount: 0,
                maxBookings: MAX_BOOKINGS,
                bookings: []
            })
        }

        // Get user's active bookings (not cancelled/completed)
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select(`
                id,
                booking_reference,
                status,
                created_at,
                service_type,
                pilot_id,
                otp_code,
                drone_pilots (
                    id,
                    full_name,
                    phone,
                    email,
                    rating
                )
            `)
            .eq('client_id', userId)
            .in('status', ['pending', 'confirmed', 'in_progress'])
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error checking booking limit:', error)
            // On error, allow booking to avoid blocking users
            return NextResponse.json({
                canBook: true,
                currentCount: 0,
                maxBookings: MAX_BOOKINGS,
                bookings: [],
                error: error.message
            })
        }

        const currentCount = bookings?.length || 0
        const canBook = currentCount < MAX_BOOKINGS

        return NextResponse.json({
            canBook,
            currentCount,
            maxBookings: MAX_BOOKINGS,
            remainingSlots: MAX_BOOKINGS - currentCount,
            bookings: bookings || []
        })

    } catch (error: any) {
        console.error('Check limit API error:', error)
        return NextResponse.json(
            { error: error.message, canBook: true, currentCount: 0, maxBookings: MAX_BOOKINGS },
            { status: 500 }
        )
    }
}
