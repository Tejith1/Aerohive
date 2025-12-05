// Script to delete a user from BOTH Supabase Auth and users table
// Usage: node scripts/delete-user.js <email>

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!')
  console.error('Make sure .env.local has:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function deleteUser(email) {
  try {
    console.log(`\n🔍 Looking for user: ${email}`)
    
    // 1. Find user in Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listing users:', listError)
      return
    }
    
    const user = users.find(u => u.email === email)
    
    if (!user) {
      console.log('⚠️ User not found in Supabase Auth')
    } else {
      console.log(`✅ Found user in Auth: ${user.id}`)
      
      // Delete from Auth
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id)
      
      if (authDeleteError) {
        console.error('❌ Error deleting from Auth:', authDeleteError)
      } else {
        console.log('✅ Deleted from Supabase Auth')
      }
      
      // Delete from users table
      const { error: dbDeleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)
      
      if (dbDeleteError) {
        console.error('❌ Error deleting from users table:', dbDeleteError)
      } else {
        console.log('✅ Deleted from users table')
      }
    }
    
    console.log(`\n✨ User ${email} has been completely removed!\n`)
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Get email from command line
const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.log('Usage: node scripts/delete-user.js <email>')
  process.exit(1)
}

deleteUser(email)
