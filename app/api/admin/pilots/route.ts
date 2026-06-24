import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminWithRetry } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
    try {
        const supabase = getSupabaseAdminWithRetry()

        if (!supabase) {
            return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 })
        }

        console.log('📡 Fetching all pilots for admin portal...')
        const { data, error } = await supabase
            .from('drone_pilots')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('❌ Database fetch error:', error)
            return NextResponse.json({ error: 'Failed to retrieve pilots' }, { status: 500 })
        }

        return NextResponse.json(data || [])

    } catch (error: any) {
        console.error('❌ Fetch Pilots Route Critical Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
