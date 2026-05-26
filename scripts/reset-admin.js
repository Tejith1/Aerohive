const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if(!supabaseUrl || !supabaseKey) { 
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY'); 
  process.exit(1); 
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function setAdminPassword() {
  const email = 'charansaitej021206@gmail.com';
  const newPassword = 'Aerohive@123';
  
  console.log(`Checking for admin user: ${email}...`);
  
  const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    console.error('Error listing users:', error);
    return;
  }
  
  const adminUser = users?.find(u => u.email === email);

  if (adminUser) {
    console.log(`Admin user found (ID: ${adminUser.id}). Updating password to ${newPassword}...`);
    const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(adminUser.id, {
      password: newPassword,
      app_metadata: { provider: 'email' },
      user_metadata: { is_admin: true }
    });
    if(updateError) console.error('Failed to update:', updateError);
    else console.log('✅ Admin password updated successfully');
  } else {
    console.log(`Admin user not found. Creating new admin account...`);
    const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: newPassword,
      email_confirm: true,
      user_metadata: { first_name: 'Aerohive', last_name: 'Admin', is_admin: true }
    });
    
    if(createError) {
      console.error('Failed to create:', createError);
    } else {
      console.log('✅ Admin user created successfully in Auth');
      
      // Also insert to 'users' table
      const { error: profileError } = await supabaseAdmin.from('users').insert({
        id: data.user.id,
        email: email,
        first_name: 'Aerohive',
        last_name: 'Admin',
        is_admin: true,
        is_active: true
      });
      
      if (profileError) {
        console.error('Failed to create profile:', profileError);
      } else {
        console.log('✅ Admin profile created in database');
      }
    }
  }
}

setAdminPassword();
