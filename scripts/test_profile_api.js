
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testProfileAPI() {
    console.log('🔍 Testing Profile API Configuration...');

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SERVICE_KEY) {
        console.error('❌ Missing environment variables!');
        console.log('URL:', SUPABASE_URL ? 'Set' : 'Missing');
        console.log('KEY:', SERVICE_KEY ? 'Set' : 'Missing');
        return;
    }

    console.log('✅ Environment variables present.');

    // Initialize Supabase Admin
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    console.log('✅ Supabase Admin initialized.');

    // Test connection by fetching a random user or just count
    try {
        const { count, error } = await supabaseAdmin
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('❌ Database connection failed:', error.message);
        } else {
            console.log(`✅ Database connection successful! User count: ${count}`);
        }
    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

testProfileAPI();
