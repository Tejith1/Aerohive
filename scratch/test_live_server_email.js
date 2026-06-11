// Directly call the running Next.js send-email API to test pilot email delivery
// This tests the ACTUAL running server, not a simulation

async function testPilotEmail() {
  const baseUrl = 'http://localhost:3000'

  console.log('=== TESTING PILOT EMAIL VIA RUNNING NEXT.JS SERVER ===\n')

  const payload = {
    to: 'dtejithreddy@gmail.com',
    subject: '[DIAGNOSTIC] AeroHive Pilot Email Test - ' + new Date().toISOString(),
    type: 'pilot',
    bookingDetails: {
      bookingId: '#AH-TEST',
      orderUUID: 'test-' + Date.now(),
      otp: '0000',
      pilotName: 'Test Pilot',
      pilotPhone: '+91-0000000000',
      pilotEmail: 'dtejithreddy@gmail.com',
      clientName: 'Test Client',
      clientPhone: '0000000000',
      clientEmail: 'test@test.com',
      serviceType: 'Diagnostic Test',
      location: 'Test Location',
      scheduledAt: new Date().toLocaleString(),
      durationHours: 1,
      chargesNote: 'This is a diagnostic test email',
      trackingLink: baseUrl + '/track/test',
      acceptJobLink: baseUrl + '/pilot-panel/dashboard',
      googleMapsLink: 'https://maps.google.com',
      estimatedAmount: '₹0'
    }
  }

  console.log('Sending to:', payload.to)
  console.log('Type:', payload.type)

  try {
    const res = await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await res.json()
    console.log('\nHTTP Status:', res.status)
    console.log('Response:', JSON.stringify(data, null, 2))

    if (data.success) {
      console.log('\n✅ PILOT EMAIL SENT SUCCESSFULLY via Next.js server!')
      console.log('Provider:', data.provider)
      console.log('MessageId:', data.messageId)
    } else {
      console.log('\n❌ PILOT EMAIL FAILED!')
      console.log('Error:', data.error)
    }
  } catch (err) {
    console.error('\n❌ Could not reach the server:', err.message)
  }
}

testPilotEmail()
