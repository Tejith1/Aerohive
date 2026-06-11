const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://ohnnwazrfvgccokgkhjj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obm53YXpyZnZnY2Nva2draGpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzU2Mjg4NywiZXhwIjoyMDczMTM4ODg3fQ.JcRBddG30JXVdgeLJuuIYTzSFOpArTblldzuhtr0xjo'
)

async function main() {
  // Check all pilots
  const { data: pilots, error } = await supabase
    .from('drone_pilots')
    .select('id, full_name, email, is_verified, is_active')

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('=== ALL DRONE PILOTS ===')
  pilots.forEach(p => {
    const emailStatus = p.email && p.email.trim() !== '' ? '✅' : '❌ MISSING'
    console.log(`  ID: ${p.id} | Name: ${p.full_name} | Email: '${p.email}' ${emailStatus} | Verified: ${p.is_verified} | Active: ${p.is_active}`)
  })

  // Check recent bookings to see email results
  console.log('\n=== RECENT BOOKINGS (last 5) ===')
  const { data: bookings, error: bErr } = await supabase
    .from('bookings')
    .select('id, booking_reference, pilot_id, client_id, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  if (bErr) {
    console.error('Bookings Error:', bErr)
    return
  }

  for (const b of bookings) {
    // Look up pilot email for this booking
    const pilot = pilots.find(p => p.id === b.pilot_id)
    console.log(`  Booking: ${b.booking_reference} | Pilot ID: ${b.pilot_id} | Pilot Email: '${pilot?.email || 'NOT FOUND'}' | Status: ${b.status} | Created: ${b.created_at}`)
  }
}

main().catch(console.error)
