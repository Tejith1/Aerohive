import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminWithRetry } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdminWithRetry() as any
    if (!supabase) {
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 })
    }

    const body = await request.json()
    const {
      userId,
      name,
      phone,
      email,
      location,
      address,
      pincode,
      droneType,
      timeSlots,
      categories,
      isAdmin,
      providerType,
      targetEmail
    } = body

    if (!userId || !name || !phone || !email || !location || !address || !pincode || !droneType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Determine verification status
    let isVerified = false
    if (isAdmin && providerType === 'public') {
      isVerified = true
    }

    let targetUserId = userId
    let targetUserEmail = email

    if (isAdmin && providerType === 'public' && targetEmail) {
      const cleanTargetEmail = targetEmail.trim().toLowerCase()
      // Check if user exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', cleanTargetEmail)
        .single()

      if (existingUser) {
        targetUserId = existingUser.id
        targetUserEmail = existingUser.email
      } else {
        // Create user in Auth + Users table as a placeholder
        try {
          const { data: newAuthData, error: newAuthErr } = await supabase.auth.admin.createUser({
            email: cleanTargetEmail,
            email_confirm: true,
            user_metadata: {
              first_name: name.split(' ')[0] || 'Provider',
              last_name: name.split(' ').slice(1).join(' ') || '',
              phone: phone || null
            }
          })

          if (newAuthErr) {
            // Find existing user from Auth list if they exist in auth but not in users table
            const { data: authUsers } = await supabase.auth.admin.listUsers()
            const matchedAuthUser = authUsers?.users?.find((u: any) => u.email?.toLowerCase() === cleanTargetEmail)
            if (matchedAuthUser) {
              targetUserId = matchedAuthUser.id
              targetUserEmail = matchedAuthUser.email || cleanTargetEmail
            } else {
              throw new Error(newAuthErr.message)
            }
          } else if (newAuthData?.user) {
            targetUserId = newAuthData.user.id
            targetUserEmail = newAuthData.user.email || cleanTargetEmail
          }

          // Insert user profile into users table
          await supabase
            .from('users')
            .insert({
              id: targetUserId,
              email: targetUserEmail,
              password_hash: 'managed_by_supabase_auth',
              first_name: name.split(' ')[0] || 'Provider',
              last_name: name.split(' ').slice(1).join(' ') || '',
              phone: phone || null,
              is_admin: false,
              is_active: true
            })
        } catch (err: any) {
          console.error('Placeholder user creation failed:', err)
          return NextResponse.json({ error: 'Failed to create user account for ' + cleanTargetEmail + ': ' + err.message }, { status: 400 })
        }
      }
    }

    // Prepare provider data
    const providerData = {
      id: targetUserId,
      name,
      phone,
      email: targetUserEmail,
      description: `Registered service provider using ${droneType}`,
      address: {
        street: address,
        city: location,
        pincode,
        location,
        drone_type: droneType,
        time_slots: timeSlots || []
      },
      service_areas: [location],
      services_offered: categories || [],
      hourly_rate: 1500, // default rate
      rating: 5.0,
      total_jobs: 0,
      is_verified: isVerified,
      is_active: true
    }

    // Check if provider already exists
    const { data: existingProvider } = await supabase
      .from('service_providers')
      .select('id')
      .eq('id', targetUserId)
      .single()

    let result
    if (existingProvider) {
      // Update
      const { data, error } = await supabase
        .from('service_providers')
        .update(providerData)
        .eq('id', targetUserId)
        .select()
        .single()
      
      if (error) throw error
      result = data
    } else {
      // Insert
      const { data, error } = await supabase
        .from('service_providers')
        .insert(providerData)
        .select()
        .single()
      
      if (error) throw error
      result = data
    }

    // Create default services offered in drone_services table
    if (categories && categories.length > 0) {
      // Delete existing services for this provider to rebuild them
      await supabase
        .from('drone_services')
        .delete()
        .eq('provider_id', targetUserId)

      // Bulk insert new services
      const servicesToInsert = categories.map((cat: string) => ({
        provider_id: targetUserId,
        title: `${name} - ${cat.charAt(0).toUpperCase() + cat.slice(1)} Service`,
        description: `Professional drone ${cat} services provided by ${name}. Equipped with ${droneType}.`,
        category: cat,
        price_type: cat === 'spraying' ? 'per_acre' : 'hourly',
        base_price: cat === 'spraying' ? 850 : 1500,
        equipment_provided: [droneType],
        requirements: 'Requires open flight area and clear weather conditions.',
        is_active: true
      }))

      const { error: servicesErr } = await supabase
        .from('drone_services')
        .insert(servicesToInsert)

      if (servicesErr) {
        console.error('Error seeding drone services:', servicesErr)
      }
    }

    return NextResponse.json({ success: true, provider: result })

  } catch (error: any) {
    console.error('Provider registration error:', error)
    return NextResponse.json({ error: error.message || 'Failed to register provider' }, { status: 500 })
  }
}
