
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function getRecentBooking() {
    const { data, error } = await supabase
        .from('bookings')
        .select('order_uuid, booking_reference, status')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error fetching booking:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Recent Booking:');
        console.log(JSON.stringify(data[0], null, 2));
    } else {
        console.log('No bookings found');
    }
}

getRecentBooking();
