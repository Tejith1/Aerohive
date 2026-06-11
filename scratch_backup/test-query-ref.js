const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
    const decoded = 'AH-7704';
    const cleanRef = decoded.replace(/^#/, '').toUpperCase();
    
    const { data, error } = await supabase
        .from('bookings')
        .select(`
            id,
            booking_reference,
            status,
            users (
                first_name,
                last_name,
                phone
            ),
            drone_pilots (
                full_name,
                phone,
                hourly_rate
            )
        `)
        .in('booking_reference', [cleanRef, `#${cleanRef}`])
        .single();
        
    console.log('Result data:', data);
    console.log('Result error:', error);
}

test();
