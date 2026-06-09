require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: products } = await supabase.from('products').select('*').limit(1);
  console.log('PRODUCT:', JSON.stringify(products[0], null, 2));
}

check();
