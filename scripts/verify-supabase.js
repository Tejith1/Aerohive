
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('--- Supabase Verification ---');
console.log('URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Anon Key:', supabaseAnonKey ? 'Set' : 'Missing');
console.log('Service Key:', supabaseServiceKey ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('CRITICAL: Missing Supabase credentials.');
    process.exit(1);
}

// Client 1: Anon Client (Simulates Frontend)
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

// Client 2: Service Role Client (Simulates Backend/Admin)
const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

async function verify() {
    try {
        // 1. Check Connection (Anon)
        console.log('\n1. Testing Public Access (Anon Key)...');
        const { data: publicData, error: publicError } = await supabaseAnon.from('drone_pilots').select('count', { count: 'exact', head: true });

        if (publicError) {
            console.error('   ❌ Public Access Failed:', publicError.message);
        } else {
            console.log('   ✅ Public Access OK. Drone Pilots count:', publicData);
        }

        // 2. Check Admin Access (Service Role)
        if (supabaseAdmin) {
            console.log('\n2. Testing Admin Access (Service Role)...');
            const { data: adminData, error: adminError } = await supabaseAdmin.auth.admin.listUsers();

            if (adminError) {
                console.error('   ❌ Admin Access Failed:', adminError.message);
            } else {
                console.log('   ✅ Admin Access OK. Total Users:', adminData.users.length);
            }

            // 3. Check 'users' table existence and RLS
            console.log('\n3. Checking Users Table (Service Role)...');
            // Try to read one user profile
            const { data: userData, error: userError } = await supabaseAdmin.from('users').select('*').limit(1);

            if (userError) {
                console.error('   ❌ Users Table Access Failed:', userError.message);
                if (userError.code === '42P01') {
                    console.error('   🚨 TABLE MISSING: The "users" table does not exist in the database.');
                }
            } else {
                console.log('   ✅ Users Table Access OK. Sample rows:', userData.length);
            }

        } else {
            console.warn('   ⚠️ Service Role Key missing. Cannot verify admin access.');
        }

    } catch (err) {
        console.error('Unexpected Error:', err);
    }
}

verify();
