# 🚨 Database Schema Fix Required

## Problem
The user registration is not working because the `users` table has a `password_hash` column marked as NOT NULL, but Supabase authentication manages passwords separately in the `auth.users` table.

## Solution
You need to fix the database schema in your Supabase dashboard. 

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase dashboard: https://supabase.com
2. Select your project
3. Go to "SQL Editor" in the sidebar
4. Create a new query

### Step 2: Run This SQL Code
Copy and paste this entire SQL block and run it:

```sql
-- Fix users table for Supabase authentication compatibility

-- Option 1: Remove password_hash column completely (RECOMMENDED)
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;

-- Option 2: If you want to keep the column, make it optional
-- ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Ensure proper UUID types for compatibility
ALTER TABLE users ALTER COLUMN id TYPE UUID USING id::uuid;
ALTER TABLE products ALTER COLUMN id TYPE UUID USING id::uuid; 
ALTER TABLE categories ALTER COLUMN id TYPE UUID USING id::uuid;

-- Add missing columns that might be useful
ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications JSONB;

-- Create a function to automatically handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, is_admin, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    CASE WHEN NEW.email = 'admin1@gmail.com' THEN true ELSE false END,
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile on auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Create policy to allow users to update their own data  
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Allow admins to read all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Allow admins to update all users
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

### Step 3: Test the Fix
After running the SQL, test the registration:

1. Go to your website: http://localhost:3000
2. Click "Sign Up" 
3. Register with any email and password
4. Check if the user appears in your users table

### Step 4: Create Admin Account
1. Register with: admin1@gmail.com / #Tejith13
2. The trigger will automatically set is_admin = true for this email

## Why This Happened
- Supabase authentication uses its own `auth.users` table for passwords
- Our custom `users` table should only store profile information
- The original schema was designed for traditional authentication, not Supabase

## After the Fix
- User registration will work automatically
- New users will be created in both `auth.users` and `users` tables
- Admin account will be automatically configured
- Row Level Security will protect user data

## Verification Commands
After the fix, you can test with this Node.js script:

```bash
cd "d:\Aerohive\drone web\Aerohive"
node scripts/check-schema.js
```

If successful, you should see the test insert work without errors.