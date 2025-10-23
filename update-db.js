// Quick database update to support data URLs
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Get Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateDatabase() {
  try {
    console.log('Updating database to support data URLs...')
    
    // This will be handled by the Supabase admin panel or direct SQL
    console.log('Please run this SQL in your Supabase SQL editor:')
    console.log(`
-- Update products table to support data URLs
ALTER TABLE products ALTER COLUMN image_url TYPE TEXT;

-- Update categories table to support data URLs  
ALTER TABLE categories ALTER COLUMN image_url TYPE TEXT;
    `)
    
    // Test the connection
    const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true })
    if (error) {
      console.error('Database connection error:', error)
    } else {
      console.log('Database connection successful!')
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

updateDatabase()