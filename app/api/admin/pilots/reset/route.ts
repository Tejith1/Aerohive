import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminWithRetry } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { pilotId } = body

        if (!pilotId) {
            return NextResponse.json({ error: 'pilotId is required' }, { status: 400 })
        }

        const supabase = getSupabaseAdminWithRetry()

        if (!supabase) {
            return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 })
        }

        console.log(`📡 Resetting rejection / reopening application for pilot ${pilotId} in database...`)
        const { error: updateError } = await supabase
            .from('drone_pilots')
            .update({
                is_verified: false,
                is_active: true,
                certifications: ''
            })
            .eq('id', pilotId)

        if (updateError) {
            console.error('❌ Database update error:', updateError)
            return NextResponse.json({ error: 'Failed to update pilot status' }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Pilot application successfully reopened for review.' })

    } catch (error: any) {
        console.error('❌ Reset Route Critical Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
