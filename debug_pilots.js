
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local manually if dotenv is missing
const env = fs.readFileSync('.env.local', 'utf8');
const envMap = {};
env.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        envMap[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
});

const supabaseUrl = envMap['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envMap['SUPABASE_SERVICE_ROLE_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPilots() {
    console.log('--- Checking Pilots (Full Detail) ---');
    const { data, error } = await supabase
        .from('drone_pilots')
        .select('id, full_name, email, is_verified, is_active');
    
    if (error) {
        console.error('Error fetching pilots:', error);
        return;
    }
    
    data.forEach(p => {
        console.log(`ID: ${p.id} | Name: ${p.full_name} | Email: "${p.email}" | Verified: ${p.is_verified}`);
    });
}

checkPilots();
