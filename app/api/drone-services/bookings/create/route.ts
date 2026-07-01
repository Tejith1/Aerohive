import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminWithRetry } from '@/lib/supabase-admin'
import { sendEmailDirect } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdminWithRetry() as any
    if (!supabase) {
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 })
    }

    const body = await request.json()
    const {
      clientId,
      providerId,
      serviceId,
      name,
      address,
      phone,
      landscapeSize,
      date,
      timeSlot,
      notes,
      estimatedCost
    } = body

    if (!clientId || !providerId || !serviceId || !name || !address || !phone || !landscapeSize || !date || !timeSlot) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Fetch provider details to validate location matching
    const { data: provider, error: providerErr } = await supabase
      .from('service_providers')
      .select('name, address, service_areas, email, phone')
      .eq('id', providerId)
      .single()

    if (providerErr || !provider) {
      return NextResponse.json({ error: 'Selected service provider not found' }, { status: 404 })
    }

    const providerCity = provider.address?.location || provider.service_areas?.[0] || ""
    const providerPincode = provider.address?.pincode || ""

    // Tokenize locations to support local areas, suburbs, and pincodes
    const providerTokens = `${providerCity} ${providerPincode}`
      .toLowerCase()
      .split(/[\s,]+/)
      .filter((t: string) => t.trim().length > 0)

    const clientTokens = address
      .toLowerCase()
      .split(/[\s,]+/)
      .filter((t: string) => t.trim().length > 0)

    // Check if there is any overlap in the tokens or substring matches
    const matched = clientTokens.some((ct: string) => 
      providerTokens.some((pt: string) => pt.includes(ct) || ct.includes(pt))
    )

    if (!matched) {
      return NextResponse.json({ 
        error: `Delivery location must match the provider's registered location/pincode (${providerCity} - ${providerPincode})` 
      }, { status: 400 })
    }

    // Generate random 4-digit OTP code
    const otp = Math.floor(1000 + Math.random() * 9000).toString()

    // Create the booking payload
    const bookingPayload = {
      user_id: clientId,
      service_id: serviceId,
      provider_id: providerId,
      booking_date: date,
      duration_hours: 2.0, // default booking duration
      location_address: {
        name,
        street: address,
        pincode: provider.address?.pincode || "",
        phone,
        landscape_size: landscapeSize,
        time_slot: timeSlot,
        otp_code: otp
      },
      special_requirements: notes || "",
      estimated_cost: estimatedCost || 1500,
      actual_cost: estimatedCost || 1500,
      status: 'PENDING',
      payment_status: 'PENDING',
      notes: phone // store phone as fallback inside notes
    }

    const { data: booking, error: insertErr } = await supabase
      .from('service_bookings')
      .insert(bookingPayload)
      .select()
      .single()

    if (insertErr) {
      console.error('Error inserting booking:', insertErr)
      throw insertErr
    }

    // Fetch service title
    let serviceTitle = 'Drone Service'
    if (serviceId) {
      try {
        const { data: service } = await supabase
          .from('drone_services')
          .select('title')
          .eq('id', serviceId)
          .single()
        if (service?.title) {
          serviceTitle = service.title
        }
      } catch (err) {
        console.error('Error fetching service title:', err)
      }
    }

    // Fetch client email
    let clientEmail = ''
    if (clientId) {
      try {
        const { data: user, error } = await supabase
          .from('users')
          .select('email')
          .eq('id', clientId)
          .single()
        if (user && !error) {
          clientEmail = user.email || ''
        }
      } catch (err) {
        console.error('Error fetching client email:', err)
      }
    }

    const baseUrl = request.nextUrl.origin

    // Prepare email booking details
    const emailBookingDetails = {
      bookingId: booking.id,
      orderUUID: booking.id,
      otp: '', // Omit OTP at booking creation time
      pilotName: provider.name,
      pilotPhone: provider.phone || phone,
      pilotEmail: provider.email || '',
      clientName: name,
      clientPhone: phone,
      clientEmail,
      serviceType: serviceTitle,
      location: address,
      scheduledAt: `${date} ${timeSlot}`,
      durationHours: 2.0,
      chargesNote: "Final charges will be calculated based on actual working hours and collected after service completion.",
      requirements: notes || "",
      trackingLink: `${baseUrl}/orders`,
      acceptJobLink: `${baseUrl}/provider-panel/dashboard`,
      estimatedAmount: estimatedCost ? `₹${estimatedCost}` : 'TBD'
    }

    // Send email notifications sequentially
    if (clientEmail) {
      try {
        const clientResult = await sendEmailDirect({
          to: clientEmail,
          subject: `Your Drone Service Is Assigned | AeroHive Booking Confirmation`,
          type: 'client',
          bookingDetails: emailBookingDetails
        })
        console.log(`📧 Client service email result:`, JSON.stringify(clientResult))
      } catch (err) {
        console.error(`❌ Failed to send service booking email to client:`, err)
      }
    }

    if (provider.email) {
      try {
        const providerResult = await sendEmailDirect({
          to: provider.email,
          subject: `New Drone Service Booking Request | Action Required - AeroHive`,
          type: 'pilot',
          bookingDetails: emailBookingDetails
        })
        console.log(`📧 Provider service email result:`, JSON.stringify(providerResult))
      } catch (err) {
        console.error(`❌ Failed to send service booking email to provider:`, err)
      }
    }

    // Send a confirmation SMS (simulated)
    const smsMsg = `AeroHive: Your booking request with ${provider.name} has been placed. Status: PENDING. Time Slot: ${timeSlot}.`
    try {
      await fetch(`${baseUrl}/api/send-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phone, message: smsMsg })
      })
    } catch (smsErr) {
      console.error('Failed to send booking placement SMS:', smsErr)
    }

    return NextResponse.json({ success: true, booking })

  } catch (error: any) {
    console.error('Create service booking error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create booking' }, { status: 500 })
  }
}
