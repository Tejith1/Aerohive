// Quick database update to support data URLs
const { createClient } = require('@supabase/supabase-js')

// Get Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pkznmqoztkwbbvlcrsmi.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrem5tcW96dGt3YmJ2bGNyc21pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzNDE1NTEsImV4cCI6MjA0NjkxNzU1MX0.QOO0f5bEJfMT7VpPtKtJMLl_LV6O4V5m4XOB3wOsNhs'

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