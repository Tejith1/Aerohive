const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...rest] = trimmed.split('=');
    if (key && rest.length > 0) envVars[key.trim()] = rest.join('=').trim();
  }
}

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'] || '';
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('--- SUPABASE USERS & PILOTS EMAIL CHECK ---');
  
  // 1. Fetch pilots
  const { data: pilots, error: pilotErr } = await supabase
    .from('drone_pilots')
    .select('id, full_name, phone, email');
  
  if (pilotErr) {
    console.error('❌ Error fetching pilots:', pilotErr.message);
  } else {
    console.log(`\n👨‍✈️ Registered Drone Pilots (${pilots.length}):`);
    pilots.forEach(p => {
      console.log(` - ID: ${p.id} | Name: ${p.full_name} | Phone: ${p.phone} | Email: "${p.email}" | Certificate: ${p.dgca_certificate}`);
    });
  }

  // 2. Fetch users
  const { data: users, error: userErr } = await supabase
    .from('users')
    .select('id, email, phone');
  
  if (userErr) {
    console.error('❌ Error fetching users:', userErr.message);
  } else {
    console.log(`\n👤 Registered Clients (${users.length}):`);
    users.forEach(u => {
      console.log(` - ID: ${u.id} | Phone: ${u.phone} | Email: "${u.email}"`);
    });
  }
  
  // 3. Fetch latest bookings to see what email is stored or targeted
  const { data: bookings, error: bookingErr } = await supabase
    .from('bookings')
    .select('id, booking_reference, client_id, pilot_id, created_at')
    .order('created_at', { ascending: false })
    .limit(3);

  if (bookingErr) {
    console.error('❌ Error fetching bookings:', bookingErr.message);
  } else {
    console.log(`\n📅 Latest 3 Bookings:`);
    bookings.forEach(b => {
      console.log(` - Ref: ${b.booking_reference} | Client ID: ${b.client_id} | Pilot ID: ${b.pilot_id} | Created: ${b.created_at}`);
    });
  }
}

run();
