const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ohnnwazrfvgccokgkhjj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obm53YXpyZnZnY2Nva2draGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI4ODcsImV4cCI6MjA3MzEzODg4N30.NS4FTQ-0ja4VA8eSM9QI5QOpOQ25evomGPeRddIfpiM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  try {
    console.log('🔍 Testing database structure...')
    
    // Check users table structure
    console.log('📋 Checking users table...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5)
    
    if (usersError) {
      console.error('❌ Error accessing users table:', usersError)
    } else {
      console.log(`✅ Users table accessible. Found ${users.length} users:`)
      users.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id}) - Admin: ${user.is_admin}`)
      })
    }
    
    // Check products table
    console.log('\n📋 Checking products table...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('name, is_featured')
      .limit(5)
    
    if (productsError) {
      console.error('❌ Error accessing products table:', productsError)
    } else {
      console.log(`✅ Products table accessible. Found ${products.length} products:`)
      products.forEach(product => {
        console.log(`   - ${product.name} (Featured: ${product.is_featured})`)
      })
    }
    
    // Test authentication users table
    console.log('\n🔐 Checking auth users...')
    const { data: authData, error: authError } = await supabase.auth.getUser()
    console.log('Current auth state:', authData?.user ? 'User logged in' : 'No user logged in')
    
    // Check if there are any auth users
    const { data: { users: authUsers }, error: authUsersError } = await supabase.auth.admin.listUsers()
    if (authUsersError) {
      console.log('📝 Cannot access auth users (requires service role key)')
    } else {
      console.log(`✅ Found ${authUsers?.length || 0} auth users`)
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testDatabase()