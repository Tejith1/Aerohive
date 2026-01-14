import { Booking, DronePilot, User } from './supabase'

export const sendBookingNotification = async (booking: Booking, pilot: DronePilot, clientDetails: { name: string, phone: string }) => {
  // In a real application, this would call an API like Twilio or a server-side route
  // For now, we simulate this by logging to the console (which would appear in server logs if this were server-side)

  const formattedDate = new Date(booking.scheduled_at).toLocaleString()

  const clientMessage = `
  🚁 DRONE SERVICE BOOKING CONFIRMED!
  
  Hello ${clientDetails.name},
  Your booking with pilot ${pilot.full_name} has been confirmed.
  
  📅 Date: ${formattedDate}
  ⏱ Duration: ${booking.duration_hours} hours
  💰 Total: $${booking.total_amount}
  
  Pilot Contact: hidden (privacy protected)
  You will meet at your requested location.
  `

  const pilotMessage = `
  🚁 NEW JOB ALERT!
  
  Hello ${pilot.full_name},
  You have a new booking!
  
  👤 Client: ${clientDetails.name}
  📅 Date: ${formattedDate}
  ⏱ Duration: ${booking.duration_hours} hours
  📍 Location: ${booking.client_location_lat}, ${booking.client_location_lng}
  💰 Earning: $${booking.total_amount}
  
  Please accept via your dashboard.
  `

  console.log('--- MOCK WHATSAPP/SMS NOTIFICATION SERVICE ---')
  console.log(`TO CLIENT (${clientDetails.phone}):\n${clientMessage}`)
  console.log(`TO PILOT (${pilot.phone}):\n${pilotMessage}`)
  console.log('----------------------------------------------')

  return { success: true, timestamp: new Date().toISOString() }
}
