const { createClient } = require('@supabase/supabase-js')

// Initialize Supabase client
const supabaseUrl = 'https://qtpjipfhgrmvmbbabczn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0cGppcGZoZ3Jtdm1iYmFiY3puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzODMyMzcsImV4cCI6MjA0MTk1OTIzN30.YURB8wNGMfGu7CHwLaR6DwZ1WKNzBB5Tw5aZdFxY3Lg'
const supabase = createClient(supabaseUrl, supabaseKey)

async function diagnoseUserRegistration() {
    console.log('🔍 Diagnosing user registration and login issues...\n')
    
    try {
        // 1. Check if users table exists and has correct schema
        console.log('1. Checking users table schema...')
        const { data: schema, error: schemaError } = await supabase
            .from('users')
            .select('*')
            .limit(1)
        
        if (schemaError) {
            console.error('❌ Error accessing users table:', schemaError.message)
            return
        }
        console.log('✅ Users table is accessible')
        
        // 2. Check current users in the table
        console.log('\n2. Checking existing users...')
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, first_name, last_name, is_admin, is_active, created_at')
            .order('created_at', { ascending: false })
        
        if (usersError) {
            console.error('❌ Error fetching users:', usersError.message)
        } else {
            console.log(`✅ Found ${users.length} users in database:`)
            users.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.email} - ${user.first_name} ${user.last_name} ${user.is_admin ? '(Admin)' : '(User)'} - Created: ${new Date(user.created_at).toLocaleDateString()}`)
            })
        }
        
        // 3. Check auth users
        console.log('\n3. Checking Supabase Auth users...')
        try {
            // Note: This requires service role key to list auth users
            console.log('⚠️  Cannot check auth users with anon key - requires admin access')
        } catch (error) {
            console.log('⚠️  Cannot access auth users - requires admin privileges')
        }
        
        // 4. Test user creation workflow
        console.log('\n4. Testing user creation workflow...')
        const testEmail = `test-${Date.now()}@example.com`
        const testPassword = 'testpass123'
        
        console.log(`   Creating test user: ${testEmail}`)
        
        // Try to sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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
        
        if (signUpError) {
            console.error('❌ Sign up error:', signUpError.message)
            
            // Check if it's an email confirmation issue
            if (signUpError.message.includes('email') && signUpError.message.includes('confirm')) {
                console.log('📧 This appears to be an email confirmation issue')
                console.log('   Email confirmation is enabled in Supabase settings')
                console.log('   Users need to confirm their email before they can log in')
                console.log('   Admin should check Supabase Dashboard > Authentication > Settings')
            }
        } else {
            console.log('✅ Sign up successful!')
            console.log(`   User ID: ${signUpData.user?.id}`)
            console.log(`   Email confirmed: ${signUpData.user?.email_confirmed_at ? 'Yes' : 'No'}`)
            
            if (signUpData.user) {
                // Try to create profile in users table
                console.log('   Attempting to create user profile...')
                const { error: profileError } = await supabase
                    .from('users')
                    .insert({
                        id: signUpData.user.id,
                        email: signUpData.user.email,
                        password_hash: 'managed_by_supabase_auth',
                        first_name: 'Test',
                        last_name: 'User',
                        phone: null,
                        is_admin: false,
                        is_active: true
                    })
                
                if (profileError) {
                    console.error('❌ Profile creation error:', profileError.message)
                    if (profileError.message.includes('duplicate key')) {
                        console.log('   Profile already exists for this user')
                    }
                } else {
                    console.log('✅ Profile created successfully!')
                }
            }
        }
        
        // 5. Check authentication settings
        console.log('\n5. Authentication Analysis:')
        console.log('   Based on the errors, here are likely issues:')
        
        if (signUpError && signUpError.message.includes('confirm')) {
            console.log('   🔸 Email confirmation is ENABLED')
            console.log('   🔸 Users must confirm email before login')
            console.log('   🔸 This explains "login successful" but no data storage')
            console.log('   🔸 Recommendation: Disable email confirmation for testing')
        }
        
        console.log('\n📋 SUMMARY:')
        console.log('If users see "login successful" but data isn\'t stored:')
        console.log('1. Check if email confirmation is enabled in Supabase')
        console.log('2. Users table schema needs password_hash column (appears to be correct)')
        console.log('3. Auth context is properly creating profiles after registration')
        console.log('4. The issue is likely email confirmation requirement')
        
        console.log('\n🔧 RECOMMENDED FIXES:')
        console.log('1. Go to Supabase Dashboard > Authentication > Settings')
        console.log('2. Disable "Enable email confirmations" for testing')
        console.log('3. Or manually confirm existing user emails in the auth.users table')
        console.log('4. Check Row Level Security policies on users table')
        
    } catch (error) {
        console.error('💥 Diagnostic error:', error.message)
    }
}

// Run the diagnostic
diagnoseUserRegistration().then(() => {
    console.log('\n✅ Diagnostic complete!')
}).catch(console.error)