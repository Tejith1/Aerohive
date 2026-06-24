import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminWithRetry } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { dgca_number } = body

        if (!dgca_number || typeof dgca_number !== 'string' || !dgca_number.trim()) {
            return NextResponse.json(
                { error: 'DGCA certificate number is required.' },
                { status: 400 }
            )
        }

        const supabase = getSupabaseAdminWithRetry()

        if (!supabase) {
            return NextResponse.json(
                { error: 'Database not configured. Please check environment variables.' },
                { status: 500 }
            )
        }

        const { data: pilot, error } = await supabase
            .from('drone_pilots')
            .select(`
                id,
                full_name,
                email,
                phone,
                location,
                area,
                experience,
                certifications,
                specializations,
                hourly_rate,
                about,
                dgca_number,
                drone_academy,
                profile_image_url,
                rating,
                completed_jobs,
                is_verified,
                is_active,
                created_at
            `)
            .eq('dgca_number', dgca_number.trim())
            .single()

        if (error && error.code === 'PGRST116') {
            // No rows returned = pilot not found
            return NextResponse.json(
                { error: 'No pilot found with this DGCA certificate number. Please check the number and try again.' },
                { status: 404 }
            )
        }

        if (error) {
            console.error('Pilot lookup error:', error)
            return NextResponse.json(
                { error: 'Database error while looking up pilot.' },
                { status: 500 }
            )
        }

        if (!pilot) {
            return NextResponse.json(
                { error: 'No pilot found with this DGCA certificate number.' },
                { status: 404 }
            )
        }

        if (!pilot.is_active) {
            return NextResponse.json(
                { error: 'This pilot account has been deactivated. Please contact support.' },
                { status: 403 }
            )
        }

        // Return pilot data (we intentionally include all safe fields for the dashboard session)
        return NextResponse.json({
            success: true,
            pilot: {
                id: pilot.id,
                full_name: pilot.full_name,
                email: pilot.email,
                phone: pilot.phone,
                location: pilot.location,
                area: pilot.area,
                experience: pilot.experience,
                certifications: pilot.certifications,
                specializations: pilot.specializations,
                hourly_rate: pilot.hourly_rate,
                about: pilot.about,
                dgca_number: pilot.dgca_number,
                drone_academy: pilot.drone_academy,
                profile_image_url: pilot.profile_image_url,
                rating: pilot.rating,
                completed_jobs: pilot.completed_jobs,
                is_verified: pilot.is_verified,
                created_at: pilot.created_at
            }
        })

    } catch (error: any) {
        console.error('Pilot auth login error:', error)
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again.' },
            { status: 500 }
        )
    }
}
