const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ohnnwazrfvgccokgkhjj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obm53YXpyZnZnY2Nva2draGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI4ODcsImV4cCI6MjA3MzEzODg4N30.NS4FTQ-0ja4VA8eSM9QI5QOpOQ25evomGPeRddIfpiM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixUsersTable() {
  try {
    console.log('🔧 Fixing users table schema...')
    
    console.log('⚠️  IMPORTANT: You need to run this SQL in your Supabase SQL Editor:')
    console.log('📋 Copy and paste the following SQL commands:')
    console.log('')
    console.log('-- Make password_hash optional since Supabase manages auth')
    console.log('ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;')
    console.log('')
    console.log('-- Or better yet, remove password_hash completely and use Supabase auth')
    console.log('ALTER TABLE users DROP COLUMN IF EXISTS password_hash;')
    console.log('')
    console.log('-- Add specifications column if not exists')
    console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS specifications JSONB;')
    console.log('')
    console.log('-- Ensure proper ID types')
    console.log('ALTER TABLE users ALTER COLUMN id TYPE UUID USING id::uuid;')
    console.log('ALTER TABLE products ALTER COLUMN id TYPE UUID USING id::uuid;')
    console.log('ALTER TABLE categories ALTER COLUMN id TYPE UUID USING id::uuid;')
    console.log('')
    
    // Test if we can insert without password_hash
    console.log('🧪 Testing insert without password_hash...')
    
    const testUserId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: 'testuser@example.com',
        first_name: 'Test',
        last_name: 'User',
        is_admin: false,
        is_active: true
      })
      .select()
    
    if (error) {
      console.error('❌ Still getting error:', error.message)
      console.log('')
      console.log('🚨 You MUST run the SQL commands above in Supabase SQL Editor first!')
      console.log('Then run this script again to test.')
    } else {
      console.log('✅ Insert successful! Schema is fixed.')
      
      // Clean up test data
      await supabase.from('users').delete().eq('id', testUserId)
      console.log('🧹 Cleaned up test data')
    }
    
  } catch (error) {
    console.error('💥 Script failed:', error)
  }
}

fixUsersTable()