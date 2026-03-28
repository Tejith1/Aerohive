import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminWithRetry, withRetry } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Drone Pilot Registration API called (server-side)')

    const supabaseAdmin = getSupabaseAdminWithRetry()
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase credentials' },
        { status: 500 }
      )
    }

    // Parse the multipart form data
    const formData = await request.formData()

    const fullName = formData.get('full_name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const location = formData.get('location') as string
    const area = formData.get('area') as string
    const experience = formData.get('experience') as string
    const certifications = formData.get('certifications') as string
    const specializations = formData.get('specializations') as string
    const hourlyRate = formData.get('hourly_rate') as string
    const about = formData.get('about') as string
    const droneAcademy = formData.get('drone_academy') as string | null
    const dgcaNumber = formData.get('dgca_number') as string
    const userId = formData.get('user_id') as string | null
    const isPhoneVerified = formData.get('is_phone_verified') === 'true'

    const profileImage = formData.get('profile_image') as File | null
    const certificateImage = formData.get('certificate_image') as File | null

    console.log('📝 Registration data:', { fullName, email, phone, location, area, dgcaNumber })

    // Validate required fields
    if (!fullName || !email || !phone || !location || !area || !experience || !certifications || !specializations || !hourlyRate || !about || !dgcaNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Upload profile image if provided (with retry)
    let profileImageUrl: string | null = null
    if (profileImage && profileImage.size > 0) {
      try {
        const fileExt = profileImage.name.split('.').pop()
        const fileName = `profile_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
        const arrayBuffer = await profileImage.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        console.log('📤 Uploading profile image:', fileName)

        // Ensure bucket exists (with retry)
        await withRetry(async () => {
          try {
            await supabaseAdmin.storage.createBucket('pilot-documents', {
              public: true,
              allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'],
              fileSizeLimit: 5242880,
            })
          } catch (e: any) {
            if (!e.message?.includes('already exists')) throw e
          }
        }, 2, 'bucket creation')

        const { data: uploadData, error: uploadError } = await withRetry(
          () => supabaseAdmin.storage
            .from('pilot-documents')
            .upload(fileName, buffer, {
              contentType: profileImage.type,
              cacheControl: '3600',
              upsert: false,
            }),
          3,
          'profile image upload'
        )

        if (uploadError) {
          console.error('❌ Profile image upload error:', uploadError)
        } else {
          const { data: urlData } = supabaseAdmin.storage
            .from('pilot-documents')
            .getPublicUrl(fileName)
          profileImageUrl = urlData.publicUrl
          console.log('✅ Profile image uploaded:', profileImageUrl)
        }
      } catch (imgError) {
        console.error('❌ Profile image processing error (continuing without image):', imgError)
      }
    }

    // Upload certificate image if provided (with retry)
    let certificateImageUrl: string | null = null
    if (certificateImage && certificateImage.size > 0) {
      try {
        const fileExt = certificateImage.name.split('.').pop()
        const fileName = `cert_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
        const arrayBuffer = await certificateImage.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        console.log('📤 Uploading certificate image:', fileName)

        const { data: uploadData, error: uploadError } = await withRetry(
          () => supabaseAdmin.storage
            .from('pilot-documents')
            .upload(fileName, buffer, {
              contentType: certificateImage.type,
              cacheControl: '3600',
              upsert: false,
            }),
          3,
          'certificate image upload'
        )

        if (uploadError) {
          console.error('❌ Certificate image upload error:', uploadError)
        } else {
          const { data: urlData } = supabaseAdmin.storage
            .from('pilot-documents')
            .getPublicUrl(fileName)
          certificateImageUrl = urlData.publicUrl
          console.log('✅ Certificate image uploaded:', certificateImageUrl)
        }
      } catch (imgError) {
        console.error('❌ Certificate image processing error (continuing without image):', imgError)
      }
    }

    // Insert into drone_pilots table using service role (bypasses RLS) - with retry
    const pilotData = {
      full_name: fullName,
      email: email,
      phone: phone,
      location: location,
      area: area,
      experience: experience,
      certifications: certifications,
      specializations: specializations,
      hourly_rate: parseInt(hourlyRate),
      about: about,
      drone_academy: droneAcademy || null,
      dgca_number: dgcaNumber,
      profile_image_url: profileImageUrl,
      certificate_image_url: certificateImageUrl,
      // is_phone_verified: isPhoneVerified, // Column might not exist in schema
      user_id: userId || null,
    }

    console.log('📤 Inserting pilot data into database...')

    const { data: pilotResult, error: insertError } = await withRetry(
      () => (supabaseAdmin.from('drone_pilots') as any)
        .insert(pilotData)
        .select()
        .single(),
      3,
      'drone pilot database insert'
    ) as any

    if (insertError) {
      console.error('❌ Database insert error:', insertError)
      return NextResponse.json(
        { error: insertError.message, code: insertError.code, details: insertError.details },
        { status: 400 }
      )
    }

    console.log('✅ Drone pilot registered successfully:', pilotResult.id)

    return NextResponse.json({
      success: true,
      data: pilotResult,
      message: 'Drone pilot registered successfully!',
    })
  } catch (error: any) {
    console.error('❌ Server error in drone pilot registration:', error)
    return NextResponse.json(
      { error: error?.message || 'Registration failed' },
      { status: 500 }
    )
  }
}
