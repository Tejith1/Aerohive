import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { pilotId } = body

        if (!pilotId) {
            return NextResponse.json({ error: 'pilotId is required' }, { status: 400 })
        }

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
