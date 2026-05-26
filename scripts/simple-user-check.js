const { createClient } = require('@supabase/supabase-js')

async function simpleUserCheck() {
    console.log('🔍 Simple user registration check...\n')
    
    // Initialize with service role key for admin access
    const supabaseUrl = 'https://qtpjipfhgrmvmbbabczn.supabase.co'
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0cGppcGZoZ3Jtdm1iYmFiY3puIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYzODMyMzcsImV4cCI6MjA0MTk1OTIzN30.YURB8wNGMfGu7CHwLaR6DwZ1WKNzBB5Tw5aZdFxY3Lg'
    
    const supabase = createClient(supabaseUrl, anonKey)
    
    try {
        console.log('Checking users table...')
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .limit(5)
        
        if (error) {
            console.error('❌ Database error:', error.message)
            console.log('\n🔧 Possible causes:')
            console.log('1. Row Level Security (RLS) is enabled and blocking access')
            console.log('2. Network connectivity issues')
            console.log('3. Database permissions')
            
            return
        }
        
        console.log(`✅ Found ${data.length} users`)
        data.forEach(user => {
            console.log(`   - ${user.email} (${user.first_name} ${user.last_name})`)
        })
        
    } catch (err) {
        console.error('💥 Connection error:', err.message)
        console.log('\n🔍 ANALYSIS:')
        console.log('The issue appears to be either:')
        console.log('1. 🔒 EMAIL CONFIRMATION REQUIREMENT')
        console.log('   - Users register but can\'t login until email is confirmed')
        console.log('   - This causes "login successful" message but no profile creation')
        console.log('   - Solution: Disable email confirmation in Supabase settings')
        console.log('')
        console.log('2. 🛡️ ROW LEVEL SECURITY (RLS)')
        console.log('   - RLS policies are blocking user profile creation')
        console.log('   - Solution: Check RLS policies on users table')
        console.log('')
        console.log('3. 🔐 AUTHENTICATION FLOW ISSUE')
        console.log('   - Profile creation happens after auth signup')
        console.log('   - If email confirmation is required, profile creation fails')
        console.log('')
        console.log('🎯 MOST LIKELY CAUSE: Email confirmation is enabled')
        console.log('📧 Users can signup but cannot login until they confirm email')
        console.log('💾 Profile creation fails because auth is not complete')
    }
}

simpleUserCheck()