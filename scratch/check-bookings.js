const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select('id, order_uuid, booking_reference, status, service_type, pilot_id');
    
    if (error) {
        console.error('Error fetching bookings:', error);
        return;
    }
    
    console.log('Bookings in database:');
    console.log(JSON.stringify(bookings, null, 2));
}

check();
