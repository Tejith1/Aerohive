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
    
    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select(`
            id,
            booking_reference,
            status,
            client_id,
            drone_pilots (
                full_name,
                phone,
                hourly_rate
            )
        `)
        .in('booking_reference', [cleanRef, `#${cleanRef}`])
        .single();
        
    if (bookingError) {
        console.error('Booking query error:', bookingError);
        return;
    }
    
    console.log('Found booking:', booking);
    
    if (booking.client_id) {
        const { data: client, error: clientError } = await supabase
            .from('users')
            .select('first_name, last_name, phone')
            .eq('id', booking.client_id)
            .single();
            
        console.log('Found client:', client);
        console.log('Client query error:', clientError);
    }
}

test();
