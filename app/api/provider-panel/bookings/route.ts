import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminWithRetry } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const providerId = searchParams.get('providerId')

    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 })
    }

    const supabase = getSupabaseAdminWithRetry()
    if (!supabase) {
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 })
    }

    // Fetch bookings with joined users and services
    const { data: bookings, error } = await supabase
      .from('service_bookings')
      .select(`
        *,
        user:users(*),
        service:drone_services(*)
      `)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ success: true, bookings: bookings || [] })

  } catch (error: any) {
    console.error('Fetch provider bookings error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch bookings' }, { status: 500 })
  }
}
