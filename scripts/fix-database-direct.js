const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ohnnwazrfvgccokgkhjj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obm53YXpyZnZnY2Nva2draGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI4ODcsImV4cCI6MjA3MzEzODg4N30.NS4FTQ-0ja4VA8eSM9QI5QOpOQ25evomGPeRddIfpiM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixAndTestDatabase() {
  try {
    console.log('🔧 Attempting to fix database schema programmatically...')
    
    // Since we can't alter table schema with anon key, let's work around it
    // by using a different approach - check if we can work with existing schema
    
    console.log('📋 Testing current table structure...')
    
    // First, let's see what the actual schema looks like
    const { data: tableTest, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Cannot access users table:', tableError)
      return
    }
    
    console.log('✅ Users table accessible')
    
    // Try to insert a test user with ALL required fields
    const testUUID = 'a1b2c3d4-e5f6-7890-1234-567890abcdef'
    
    console.log('🧪 Testing insert with UUID and password_hash...')
    const { data: insertTest, error: insertError } = await supabase
      .from('users')
      .insert({
        id: testUUID,
        email: 'test@example.com',
        password_hash: 'dummy_hash_since_required', // Required by schema
        first_name: 'Test',
        last_name: 'User',
        is_admin: false,
        is_active: true
      })
      .select()
    
    if (insertError) {
      console.error('❌ Insert still failing:', insertError)
      console.log('\n🛠️  WORKAROUND: Let\'s modify the auth context to include password_hash')
      
      // Clean up if partial insert
      await supabase.from('users').delete().eq('id', testUUID)
      
      return 'need_password_hash_workaround'
    } else {
      console.log('✅ Insert successful! Cleaning up test data...')
      await supabase.from('users').delete().eq('id', testUUID)
      return 'schema_ok'
    }
    
  } catch (error) {
    console.error('💥 Fix attempt failed:', error)
    return 'failed'
  }
}

async function createAdminUser() {
  try {
    console.log('👤 Creating admin user...')
    
    const adminId = '550e8400-e29b-41d4-a716-446655440000' // Fixed UUID for admin
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: adminId,
        email: 'admin1@gmail.com',
        password_hash: '$2a$12$9vqmK8K5K5K5K5K5K5K5Keu7YzVfH8H8H8H8H8H8H8H8H8H8H8H8H8', // Dummy hash
        first_name: 'Admin',
        last_name: 'User',
        is_admin: true,
        is_active: true
      })
      .select()
    
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        console.log('ℹ️  Admin user already exists')
        
        // Update existing admin
        const { error: updateError } = await supabase
          .from('users')
          .update({ is_admin: true, is_active: true })
          .eq('email', 'admin1@gmail.com')
        
        if (updateError) {
          console.error('❌ Failed to update admin:', updateError)
        } else {
          console.log('✅ Admin user updated successfully')
        }
      } else {
        console.error('❌ Failed to create admin:', error)
      }
    } else {
      console.log('✅ Admin user created successfully')
    }
    
  } catch (error) {
    console.error('💥 Admin creation failed:', error)
  }
}

async function main() {
  const result = await fixAndTestDatabase()
  
  if (result === 'need_password_hash_workaround') {
    console.log('\n🔄 Applying workaround for password_hash requirement...')
    console.log('We need to modify the authentication context to handle this.')
  } else if (result === 'schema_ok') {
    console.log('\n✅ Schema is working!')
    await createAdminUser()
  }
  
  // Test current users
  console.log('\n📊 Current users in database:')
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
  
  if (usersError) {
    console.error('❌ Error fetching users:', usersError)
  } else {
    console.log(`Found ${users.length} users:`)
    users.forEach(user => {
      console.log(`   - ${user.email} (Admin: ${user.is_admin})`)
    })
  }
}

main()