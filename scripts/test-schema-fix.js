const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '../.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFixedSchema() {
  try {
    console.log('🧪 Testing the fixed database schema...')
    
    // Test 1: Try inserting a user profile without password_hash
    console.log('📋 Test 1: Manual user profile insert...')
    const testUserId = 'test-uuid-' + Date.now()
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: 'manual-test@example.com',
        first_name: 'Manual',
        last_name: 'Test',
        is_admin: false,
        is_active: true
      })
      .select()
    
    if (insertError) {
      console.error('❌ Manual insert still failing:', insertError.message)
      console.log('🚨 You need to run the SQL commands in DATABASE_FIX_REQUIRED.md first!')
      return
    } else {
      console.log('✅ Manual insert works!')
      // Clean up
      await supabase.from('users').delete().eq('id', testUserId)
    }
    
    // Test 2: Check current users
    console.log('\n📊 Test 2: Current users in database...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
    } else {
      console.log(`✅ Found ${users.length} users:`)
      users.forEach(user => {
        console.log(`   - ${user.email} (Admin: ${user.is_admin})`)
      })
    }
    
    // Test 3: Check featured products are working
    console.log('\n🚁 Test 3: Featured products...')
    const { data: featuredProducts, error: productsError } = await supabase
      .from('products')
      .select('name, is_featured, price')
      .eq('is_featured', true)
    
    if (productsError) {
      console.error('❌ Error fetching products:', productsError)
    } else {
      console.log(`✅ Found ${featuredProducts.length} featured products:`)
      featuredProducts.forEach(product => {
        console.log(`   - ${product.name} ($${product.price})`)
      })
    }
    
    console.log('\n🎉 Schema test completed!')
    console.log('✅ If all tests passed, registration should now work in your app.')
    
  } catch (error) {
    console.error('💥 Test failed:', error)
  }
}

testFixedSchema()