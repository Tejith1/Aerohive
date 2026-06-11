require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: categories } = await supabase.from('categories').select('*');
  console.log('CATEGORIES:', JSON.stringify(categories, null, 2));
}

check();
