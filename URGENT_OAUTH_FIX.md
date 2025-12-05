# 🔴 URGENT FIX REQUIRED - OAuth Database Error

## The Problem
Error: **"Database error saving new user"**

**Root Cause:** The `users` table has `password_hash` column marked as `NOT NULL`, but OAuth users (Google sign-in) don't have passwords. When Supabase tries to create the auth user, the trigger attempts to insert into `public.users` without a password_hash, causing the database to reject it.

## The Solution
Run the SQL migration to make `password_hash` optional for OAuth users.

---

## 🚨 IMMEDIATE ACTION REQUIRED

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Fix Script
Copy and paste the ENTIRE contents of this file:
```
scripts/fix-oauth-password-column.sql
```

Or copy this SQL directly:

```sql
-- Make password_hash optional for OAuth users
ALTER TABLE public.users 
ALTER COLUMN password_hash DROP NOT NULL;

-- Drop old trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved trigger with error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_full_name TEXT;
    v_first_name TEXT;
    v_last_name TEXT;
BEGIN
    -- Only for OAuth providers
    IF NEW.raw_app_meta_data->>'provider' IN ('google', 'github', 'facebook', 'twitter', 'apple') THEN
        v_full_name := COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            SPLIT_PART(NEW.email, '@', 1)
        );
        
        v_first_name := SPLIT_PART(v_full_name, ' ', 1);
        v_last_name := SUBSTRING(v_full_name FROM POSITION(' ' IN v_full_name) + 1);
        
        IF v_last_name IS NULL OR v_last_name = '' OR v_last_name = v_first_name THEN
            v_last_name := '';
        END IF;
        
        INSERT INTO public.users (
            id, email, first_name, last_name, is_admin, phone, is_active, password_hash
        )
        VALUES (
            NEW.id, NEW.email, v_first_name, v_last_name, false, 
            NEW.raw_user_meta_data->>'phone', true, NULL
        )
        ON CONFLICT (id) DO UPDATE 
        SET is_active = true, updated_at = NOW();
        
        RAISE NOTICE 'Created/updated user profile for OAuth user: %', NEW.email;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

SELECT 'OAuth setup complete! password_hash is now optional.' as status;
```

### Step 3: Click "Run" Button
- Should see: ✅ "Success. No rows returned"
- Or: ✅ "OAuth setup complete! password_hash is now optional."

### Step 4: Verify Changes
Run this query to verify:
```sql
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'password_hash';
```

Expected result:
```
column_name   | is_nullable
--------------+-------------
password_hash | YES
```

---

## 🧪 Test OAuth Again

### Before Testing - Clean Up Failed Attempts
Run this in Supabase SQL Editor to remove any partially created users:
```sql
-- Check for your email in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'your@gmail.com';  -- Replace with your email

-- If it exists, delete it (to test fresh)
-- DELETE FROM auth.users WHERE email = 'your@gmail.com';
```

### Now Test
1. **Clear browser storage**
   - Open DevTools (F12) → Console
   - Run: `localStorage.clear()`
   - Close and reopen browser

2. **Go to http://localhost:3001**

3. **Click "Sign up with Google"**

4. **Watch console logs** - should now see:
   ```
   🔵 Starting OAuth callback...
   📊 Exchanging code for session...
   📊 Exchange result: { hasUser: true, hasSession: true, error: undefined }
   ✅ User authenticated: your@email.com
   Provider: google
   📊 User profile check: { exists: true/false }
   ✅ User profile created successfully (if new)
   🏠 Redirecting to homepage...
   ```

5. **Should redirect to HOMEPAGE (not login page)**

6. **Should see welcome toast:** ✅ "Welcome! You've successfully signed in with Google."

---

## 🎯 Expected Outcome

After running the fix:
- ✅ OAuth users can sign in with Google
- ✅ User profile created in `public.users` table
- ✅ `password_hash` will be NULL for OAuth users
- ✅ Redirects to homepage after successful sign-in
- ✅ User stays logged in

---

## 🔍 Verify Everything Works

After successful OAuth sign-in, run these queries in Supabase:

```sql
-- 1. Check auth.users
SELECT id, email, created_at, email_confirmed_at, 
       raw_app_meta_data->>'provider' as provider
FROM auth.users
WHERE email = 'your@gmail.com';

-- 2. Check public.users (should have matching id)
SELECT id, email, first_name, last_name, is_active, password_hash
FROM public.users
WHERE email = 'your@gmail.com';

-- Expected: password_hash should be NULL for OAuth user
```

---

## 📝 What This Fix Does

1. **Makes password_hash optional** - OAuth users don't need passwords
2. **Updates trigger** - Now handles OAuth users properly with NULL password
3. **Adds error handling** - Trigger won't break if something goes wrong
4. **Supports multiple OAuth providers** - Google, GitHub, Facebook, Twitter, Apple

---

## ⚠️ Important Notes

- **Email/password signups will still work** - They set password_hash when registering
- **Existing email/password users not affected** - Their password_hash remains
- **OAuth users get immediate access** - No email confirmation needed
- **Trigger auto-creates profiles** - No manual intervention needed

---

## 🆘 If Still Not Working After Fix

Share:
1. Result of running the fix script (any errors?)
2. Console logs from OAuth attempt
3. Results from verification queries
4. Screenshot of what happens

But this SHOULD fix the "Database error saving new user" issue! 🚀
