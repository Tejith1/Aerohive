const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ohnnwazrfvgccokgkhjj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obm53YXpyZnZnY2Nva2draGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI4ODcsImV4cCI6MjA3MzEzODg4N30.NS4FTQ-0ja4VA8eSM9QI5QOpOQ25evomGPeRddIfpiM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnosticAuth() {
  try {
    console.log('🔍 Diagnosing authentication issues...\n')
    
    // Check admin user in database
    console.log('1. Checking admin user in users table...')
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin1@gmail.com')
      .single()
    
    if (adminError) {
      console.error('❌ Admin user not found in users table:', adminError)
    } else {
      console.log('✅ Admin user found in users table:')
      console.log(`   ID: ${adminUser.id}`)
      console.log(`   Email: ${adminUser.email}`)
      console.log(`   Admin: ${adminUser.is_admin}`)
      console.log(`   Active: ${adminUser.is_active}`)
    }
    
    // Try to login as admin
    console.log('\n2. Testing admin login...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin1@gmail.com',
      password: '#Tejith13'
    })
    
    if (loginError) {
      console.error('❌ Admin login failed:', loginError.message)
      
      if (loginError.message.includes('email_not_confirmed')) {
        console.log('🚨 EMAIL NOT CONFIRMED ISSUE DETECTED!')
        console.log('   This means the admin email needs to be confirmed in Supabase auth.')
      }
    } else {
      console.log('✅ Admin login successful')
      console.log(`   User ID: ${loginData.user.id}`)
      console.log(`   Email: ${loginData.user.email}`)
      console.log(`   Email confirmed: ${loginData.user.email_confirmed_at ? 'YES' : 'NO'}`)
      
      // Sign out for testing
      await supabase.auth.signOut()
    }
    
    // Test user creation
    console.log('\n3. Testing user creation...')
    const testEmail = `testuser-${Date.now()}@example.com`
    
    const { data: newUser, error: createError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpass123',
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User'
        }
      }
    })
    
    if (createError) {
      console.error('❌ User creation failed:', createError.message)
    } else {
      console.log('✅ Auth user creation successful')
      
      // Try to create profile
      if (newUser.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .insert({
            id: newUser.user.id,
            email: newUser.user.email,
            password_hash: 'managed_by_supabase_auth',
            first_name: 'Test',
            last_name: 'User',
            is_admin: false,
            is_active: true
          })
          .select()
        
        if (profileError) {
          console.error('❌ Profile creation failed:', profileError)
        } else {
          console.log('✅ Profile created successfully')
          
          // Clean up test user
          await supabase.from('users').delete().eq('id', newUser.user.id)
          console.log('🧹 Test user cleaned up')
        }
      }
    }
    
    console.log('\n📊 Summary:')
    console.log('If you see "EMAIL NOT CONFIRMED" - we need to fix this in Supabase settings')
    console.log('If profile creation failed - we need to check the database schema')
    
  } catch (error) {
    console.error('💥 Diagnostic failed:', error)
  }
}

diagnosticAuth()