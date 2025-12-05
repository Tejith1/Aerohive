-- ============================================
-- VERIFY OAUTH SETUP
-- ============================================
-- Run this in Supabase SQL Editor to verify
-- that the trigger and everything is set up correctly

-- 1. Check if the trigger exists
SELECT 
    tgname as trigger_name,
    proname as function_name,
    tgenabled as enabled
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';

-- Expected result: Should show one row with trigger_name = 'on_auth_user_created'
-- If empty, the trigger is not installed - run create-google-oauth-trigger.sql

-- 2. Check if the function exists
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc
WHERE proname = 'handle_new_user';

-- Expected result: Should show the function with its source code
-- If empty, the function is not created

-- 3. List all users (to see if OAuth users are being created)
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name' as full_name,
    raw_app_meta_data->>'provider' as provider,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 4. Check users table (public.users)
SELECT 
    id,
    email,
    first_name,
    last_name,
    is_admin,
    is_active,
    created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check RLS policies on users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'users';

-- If you see policies that might block INSERT from triggers,
-- you may need to adjust them or add a policy for service_role
