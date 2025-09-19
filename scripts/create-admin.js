import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ohnnwazrfvgccokgkhjj.supabase.co'
const supabaseServiceKey = 'your-service-role-key-here' // Replace with your service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    console.log('Creating admin user...')
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin1@gmail.com',
      password: '#Tejith13',
      email_confirm: true,
      user_metadata: {
        first_name: 'Admin',
        last_name: 'User',
        is_admin: true
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return
    }

    console.log('Auth user created:', authData.user?.id)

    // Create user profile in users table
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user?.id,
        email: 'admin1@gmail.com',
        first_name: 'Admin',
        last_name: 'User',
        is_admin: true,
        is_active: true
      })

    if (profileError) {
      console.error('Profile error:', profileError)
      return
    }

    console.log('Admin user created successfully!')
    console.log('Email: admin1@gmail.com')
    console.log('Password: #Tejith13')
    
  } catch (error) {
    console.error('Error creating admin user:', error)
  }
}

createAdminUser()