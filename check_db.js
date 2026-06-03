require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data } = await supabase.from('drone_pilots').select('*').limit(1);
  if (data && data.length > 0) {
    console.log('RAW PILOT RECORD:', JSON.stringify(data[0], null, 2));
  } else {
    console.log('No pilots found.');
  }
}
check();
