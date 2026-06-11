import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

export async function GET(request: NextRequest) {
    try {
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
