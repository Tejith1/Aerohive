const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ohnnwazrfvgccokgkhjj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obm53YXpyZnZnY2Nva2draGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI4ODcsImV4cCI6MjA3MzEzODg4N30.NS4FTQ-0ja4VA8eSM9QI5QOpOQ25evomGPeRddIfpiM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupAdminAuth() {
  try {
    console.log('🔧 Setting up admin authentication...')
    
    // Try to sign up the admin user in Supabase Auth
    console.log('📧 Creating admin auth account...')
    
    const { data, error } = await supabase.auth.signUp({
      email: 'admin1@gmail.com',
      password: '#Tejith13',
      options: {
        data: {
          first_name: 'Admin',
          last_name: 'User'
        }
      }
    })
    
    if (error) {
      if (error.message.includes('already registered')) {
        console.log('ℹ️  Admin auth account already exists')
      } else {
        console.error('❌ Auth signup failed:', error.message)
      }
    } else {
      console.log('✅ Admin auth account created')
      
      if (data.user) {
        // Update the users table to match the auth user ID
        const { error: updateError } = await supabase
          .from('users')
          .update({
            id: data.user.id,
            email: data.user.email
          })
          .eq('email', 'admin1@gmail.com')
        
        if (updateError) {
          console.error('❌ Failed to update user profile:', updateError)
        } else {
          console.log('✅ Admin profile linked to auth account')
        }
      }
    }
    
    // Check final status
    const { data: adminUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin1@gmail.com')
      .single()
    
    if (adminUser) {
      console.log('\n✅ Admin Setup Complete:')
      console.log(`   Email: ${adminUser.email}`)
      console.log(`   Password: #Tejith13`)
      console.log(`   Admin Status: ${adminUser.is_admin}`)
      console.log(`   Account Active: ${adminUser.is_active}`)
    }
    
    console.log('\n🎯 Next Steps:')
    console.log('1. Go to http://localhost:3000')
    console.log('2. Click "Login" or "Sign Up"')
    console.log('3. Use admin1@gmail.com / #Tejith13')
    console.log('4. You should see profile picture with admin badge')
    console.log('5. Admin users get redirected to /admin automatically')
    
  } catch (error) {
    console.error('💥 Setup failed:', error)
  }
}

setupAdminAuth()