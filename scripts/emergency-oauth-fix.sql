-- ============================================
-- EMERGENCY FIX FOR OAUTH ISSUES
-- ============================================
-- Run this if OAuth users are not being created properly

-- 1. First, check if you have any Google OAuth users in auth.users
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name' as full_name,
    raw_app_meta_data->>'provider' as provider,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE raw_app_meta_data->>'provider' = 'google'
ORDER BY created_at DESC;

-- 2. Check if those users have profiles in public.users
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.is_active,
    u.created_at,
    'Profile exists' as status
FROM public.users u
WHERE u.id IN (
    SELECT id FROM auth.users WHERE raw_app_meta_data->>'provider' = 'google'
)
ORDER BY u.created_at DESC;

-- 3. If profiles are missing, create them manually
-- Replace the email with your Google email
DO $$
DECLARE
    v_auth_user RECORD;
    v_full_name TEXT;
    v_first_name TEXT;
    v_last_name TEXT;
BEGIN
    -- Get the auth user (change email to yours)
    SELECT * INTO v_auth_user
    FROM auth.users
    WHERE email = 'your@email.com' -- CHANGE THIS
      AND raw_app_meta_data->>'provider' = 'google';
    
    IF v_auth_user.id IS NOT NULL THEN
        -- Extract name
        v_full_name := COALESCE(
            v_auth_user.raw_user_meta_data->>'full_name',
            v_auth_user.raw_user_meta_data->>'name',
            SPLIT_PART(v_auth_user.email, '@', 1)
        );
        
        v_first_name := SPLIT_PART(v_full_name, ' ', 1);
        v_last_name := SUBSTRING(v_full_name FROM POSITION(' ' IN v_full_name) + 1);
        
        -- Create or update profile
        INSERT INTO public.users (id, email, first_name, last_name, is_admin, is_active)
        VALUES (
            v_auth_user.id,
            v_auth_user.email,
            v_first_name,
            COALESCE(NULLIF(v_last_name, ''), ''),
            false,
            true
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            is_active = true,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name;
        
        RAISE NOTICE 'Profile created/updated for: %', v_auth_user.email;
    ELSE
        RAISE NOTICE 'No Google OAuth user found with that email';
    END IF;
END $$;

-- 4. Verify the profile was created
SELECT 
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    u.is_admin,
    u.is_active,
    au.raw_app_meta_data->>'provider' as provider
FROM public.users u
JOIN auth.users au ON au.id = u.id
WHERE u.email = 'your@email.com' -- CHANGE THIS
ORDER BY u.created_at DESC;

-- 5. Check RLS policies on users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'users';

-- If RLS is blocking, you might need to adjust policies or temporarily disable:
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- (Only do this temporarily for testing!)
