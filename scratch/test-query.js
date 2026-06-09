const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
    const uuid = 'c170d714-9460-4f45-85d3-d022a97004d0'; // order_uuid of #AH-2110
    
    const { data, error } = await supabase
        .from('bookings')
        .select(`
            id,
            order_uuid,
            booking_reference,
            status,
            service_type,
            scheduled_at,
            duration_hours,
            client_location_lat,
            client_location_lng,
            otp_code,
            requirements,
            created_at,
            updated_at
        `)
        .or(`order_uuid.eq.${uuid},id.eq.${uuid}`)
        .single();
        
    console.log('Result data:', data);
    console.log('Result error:', error);
}

test();
