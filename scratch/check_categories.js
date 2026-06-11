require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: categories, error: catError } = await supabase.from('categories').select('*');
  console.log('--- CATEGORIES ---');
  if (catError) console.error(catError);
  else console.log(JSON.stringify(categories, null, 2));

  const { data: products, error: prodError } = await supabase.from('products').select('id, name, slug, price, compare_price, image_url, category_id').limit(5);
  console.log('--- PRODUCTS ---');
  if (prodError) console.error(prodError);
  else console.log(JSON.stringify(products, null, 2));
}
check();
