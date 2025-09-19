const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ohnnwazrfvgccokgkhjj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obm53YXpyZnZnY2Nva2draGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI4ODcsImV4cCI6MjA3MzEzODg4N30.NS4FTQ-0ja4VA8eSM9QI5QOpOQ25evomGPeRddIfpiM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTableStructure() {
  try {
    console.log('🔍 Checking table structures...')
    
    // Try to see what columns exist in users table
    console.log('📋 Testing users table insert with minimal data...')
    
    const testUserId = '12345678-1234-1234-1234-123456789abc' // Test UUID
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: 'test@test.com',
        first_name: 'Test',
        last_name: 'User'
      })
      .select()
    
    if (error) {
      console.error('❌ Insert error:', error)
      console.error('Error details:', error.details)
      console.error('Error hint:', error.hint)
      console.error('Error message:', error.message)
      
      // The error will tell us what's wrong with the schema
      if (error.message.includes('column') || error.message.includes('does not exist')) {
        console.log('💡 Schema mismatch detected!')
      }
    } else {
      console.log('✅ Insert successful:', data)
      
      // Clean up test data
      await supabase.from('users').delete().eq('id', testUserId)
      console.log('🧹 Cleaned up test data')
    }
    
    // Let's also try to see the current users
    console.log('\n👥 Current users in database:')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
    } else {
      console.log(`Found ${users.length} users:`)
      users.forEach(user => {
        console.log(`   - ${user.email} (${typeof user.id}) - Admin: ${user.is_admin}`)
      })
    }
    
    // Check products to make sure basic connectivity works
    console.log('\n🚁 Sample products:')
    const { data: products } = await supabase
      .from('products')
      .select('name, id')
      .limit(3)
    
    products?.forEach(product => {
      console.log(`   - ${product.name} (ID type: ${typeof product.id})`)
    })
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

checkTableStructure()