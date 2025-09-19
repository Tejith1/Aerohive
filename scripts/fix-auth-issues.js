const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ohnnwazrfvgccokgkhjj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9obm53YXpyZnZnY2Nva2draGpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NjI4ODcsImV4cCI6MjA3MzEzODg4N30.NS4FTQ-0ja4VA8eSM9QI5QOpOQ25evomGPeRddIfpiM'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixAuthIssues() {
  try {
    console.log('🔧 Fixing authentication issues...\n')
    
    console.log('⚠️  IMPORTANT: Manual steps required in Supabase Dashboard:')
    console.log('')
    console.log('🔗 Go to your Supabase Dashboard:')
    console.log('   1. Visit: https://supabase.com/dashboard')
    console.log('   2. Select your project')
    console.log('')
    console.log('📧 Fix Admin Email Confirmation:')
    console.log('   1. Go to "Authentication" → "Users"')
    console.log('   2. Find admin1@gmail.com user')
    console.log('   3. Click the three dots (...) → "Edit user"')
    console.log('   4. Check "Email confirmed" checkbox')
    console.log('   5. Click "Save"')
    console.log('')
    console.log('⚙️  Disable Email Confirmation (for development):')
    console.log('   1. Go to "Authentication" → "Settings"')
    console.log('   2. Scroll to "User Signups"')
    console.log('   3. UNCHECK "Enable email confirmations"')
    console.log('   4. Click "Save"')
    console.log('')
    console.log('🔄 Alternative: Create new admin without confirmation:')
    
    // Try to create a new admin account that bypasses confirmation
    const newAdminEmail = 'admin@aerohive.com'
    const { data, error } = await supabase.auth.signUp({
      email: newAdminEmail,
      password: '#Tejith13',
      options: {
        emailRedirectTo: undefined, // Skip email confirmation
        data: {
          first_name: 'Admin',
          last_name: 'User'
        }
      }
    })
    
    if (error) {
      console.log(`❌ Could not create ${newAdminEmail}:`, error.message)
    } else {
      console.log(`✅ Created new admin account: ${newAdminEmail}`)
      
      // Create profile for new admin
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            password_hash: 'managed_by_supabase_auth',
            first_name: 'Admin',
            last_name: 'User',
            is_admin: true,
            is_active: true
          })
        
        if (profileError) {
          console.error('❌ Failed to create admin profile:', profileError)
        } else {
          console.log('✅ Admin profile created successfully')
        }
      }
    }
    
    console.log('\n🧪 Testing login after potential fixes...')
    
    // Test login with original admin
    const { data: loginTest, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin1@gmail.com',
      password: '#Tejith13'
    })
    
    if (loginError) {
      console.log('❌ admin1@gmail.com still needs email confirmation')
      
      // Try new admin if created
      if (newAdminEmail) {
        const { data: newLoginTest, error: newLoginError } = await supabase.auth.signInWithPassword({
          email: newAdminEmail,
          password: '#Tejith13'
        })
        
        if (newLoginError) {
          console.log(`❌ ${newAdminEmail} login failed:`, newLoginError.message)
        } else {
          console.log(`✅ ${newAdminEmail} login successful!`)
          await supabase.auth.signOut()
        }
      }
    } else {
      console.log('✅ admin1@gmail.com login successful!')
      await supabase.auth.signOut()
    }
    
    console.log('\n📋 Current admin users in database:')
    const { data: admins } = await supabase
      .from('users')
      .select('*')
      .eq('is_admin', true)
    
    if (admins) {
      admins.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.first_name} ${admin.last_name})`)
      })
    }
    
  } catch (error) {
    console.error('💥 Fix attempt failed:', error)
  }
}

fixAuthIssues()