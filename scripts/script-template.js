// ⚠️ IMPORTANT: DO NOT COMMIT THIS FILE WITH REAL CREDENTIALS
// Copy this template to the actual script file and fill in your values

const { createClient } = require('@supabase/supabase-js')

// Replace these with your actual values from .env.local or Supabase dashboard
const supabaseUrl = 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

// Your script code here...
