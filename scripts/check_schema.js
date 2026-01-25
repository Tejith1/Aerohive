
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data, error } = await supabase.rpc('get_column_info', {
        table_name: 'bookings'
    });

    if (error) {
        // If RPC doesn't exist, try a simple select
        console.log('RPC failed, trying select * limit 0');
        const { data: selectData, error: selectError } = await supabase
            .from('bookings')
            .select('*')
            .limit(1);

        if (selectError) {
            console.error('Error fetching columns:', selectError);
        } else {
            // Try to get columns from rpc if select limit 1 is insufficient or empty
            console.log('Fetching columns via introspection...');
            const { data: columns, error: colError } = await supabase
                .rpc('get_column_info_internal', { t_name: 'bookings' }); // Usually not available unless defined

            if (colError) {
                // Fallback: Check if we can at least see one row
                if (selectData && selectData.length > 0) {
                    console.log('Columns in bookings table:', Object.keys(selectData[0]));
                } else {
                    console.log('Table is empty or columns hidden. Trying to insert a test row to see columns (rollback or ignore).');
                    // Alternative: Use a query that specifically targets the column
                    const { error: uuidError } = await supabase.from('bookings').select('order_uuid').limit(1);
                    if (uuidError) {
                        console.log('❌ Column "order_uuid" NOT found:', uuidError.message);
                    } else {
                        console.log('✅ Column "order_uuid" FOUND!');
                    }
                }
            }
        }
    } else {
        console.log('Column info:', data);
    }
}

checkSchema();
