/* eslint-disable @typescript-eslint/no-var-requires */
import { createClient } from '@supabase/supabase-js'

// Use require for dotenv to avoid needing type declarations for this script
const dotenv = require('dotenv')
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testRLS() {
    console.log('🧪 Testing Public Access (Anon Key)...')

    // Try to insert a dummy user
    const dummyId = 'test-' + Date.now()
    const { error } = await supabase.from('users').insert({
        id: dummyId,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        password_hash: 'test'
    })

    if (error) {
        console.error('❌ Insert Failed:', error.message)
        console.error('   Error Code:', error.code)
        if (error.code === '42501' || error.message.includes('permission denied') || error.message.includes('policy')) {
            console.log('🚨 CONCLUSION: RLS is ENABLED and blocking writes. You need Policies!')
        } else {
            console.log('⚠️ Conclusion: Failed, but maybe not RLS?', error)
        }
    } else {
        console.log('✅ Insert Succeeded! RLS is likely OFF or permissive.')
        // Cleanup
        await supabase.from('users').delete().eq('id', dummyId)
    }
}

testRLS()
