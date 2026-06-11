// Simulate what the booking API does - fetch pilot and send email
require('dotenv').config({ path: '.env.local' })
const nodemailer = require('nodemailer')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function simulateBookingEmail() {
  // Use the latest booking's pilot
  const pilotId = '80c8f6ba-c9d7-44ae-a1c6-b17feba6cf94' // "Test" pilot

  console.log('=== SIMULATING BOOKING EMAIL FLOW ===\n')

  // Step 1: Fetch pilot (same as route.ts line 113-122)
  const { data: pilot, error } = await supabase
    .from('drone_pilots')
    .select('full_name, phone, email, hourly_rate')
    .eq('id', pilotId)
    .single()

  if (error) {
    console.error('❌ Error fetching pilot:', error)
    return
  }

  console.log('Pilot fetched from DB:', JSON.stringify(pilot, null, 2))
  
  const pilotEmail = pilot.email || ''
  console.log(`\nPilot email check: '${pilotEmail}'`)
  console.log(`pilotEmail && pilotEmail.trim() !== '' => ${pilotEmail && pilotEmail.trim() !== ''}`)

  if (pilotEmail && pilotEmail.trim() !== '') {
    console.log(`\n✅ Would send email to pilot: ${pilotEmail}`)
    
    // Actually send
    const user = process.env.GMAIL_USER
    const pass = process.env.GMAIL_APP_PASSWORD
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass: pass.replace(/\s+/g, '') },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 8000
    })

    const result = await transporter.sendMail({
      from: `AeroHive Support <${user}>`,
      replyTo: user,
      to: pilotEmail,
      subject: 'Test Booking Notification - AeroHive Pilot Email',
      html: '<h2>Booking Notification Test</h2><p>This simulates the actual booking email that would be sent to the pilot.</p>'
    })

    console.log(`✅ Email sent to pilot! MessageId: ${result.messageId}`)
  } else {
    console.log(`\n❌ WOULD SKIP pilot email - empty email field!`)
  }
}

simulateBookingEmail().catch(console.error)
