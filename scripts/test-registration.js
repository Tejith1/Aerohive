const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ohnnwazrfvgccokgkhjj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obm53YXpyZnZnY2Nva2draGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI4ODcsImV4cCI6MjA3MzEzODg4N30.NS4FTQ-0ja4VA8eSM9QI5QOpOQ25evomGPeRddIfpiM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRegistration() {
  try {
    console.log('🧪 Testing user registration...')
    
    // Test email that's not admin
    const testEmail = 'test@example.com'
    const testPassword = 'testpass123'
    
    console.log(`📧 Attempting to register: ${testEmail}`)
    
    // Try to register
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          phone: null,
          is_admin: false
        }
      }
    })
    
    if (error) {
      console.error('❌ Registration failed:', error.message)
      return
    }
    
    console.log('✅ Auth registration successful')
    console.log('User ID:', data.user?.id)
    console.log('Email:', data.user?.email)
    
    // Now try to insert into users table
    if (data.user) {
      console.log('💾 Attempting to create user profile...')
      
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          first_name: 'Test',
          last_name: 'User',
          phone: null,
          is_admin: false,
          is_active: true
        })
        .select()
      
      if (profileError) {
        console.error('❌ Profile creation failed:', profileError)
        console.error('Error details:', profileError.details)
        console.error('Error hint:', profileError.hint)
        console.error('Error code:', profileError.code)
      } else {
        console.log('✅ Profile created successfully:', profileData)
      }
    }
    
    // Check if user appears in users table
    console.log('🔍 Checking users table...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
    
    if (usersError) {
      console.error('❌ Error checking users table:', usersError)
    } else {
      console.log(`📊 Users table now has ${users.length} users:`)
      users.forEach(user => {
        console.log(`   - ${user.email} (ID: ${user.id})`)
      })
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testRegistration()