-- ============================================
-- FIX OAUTH USER CREATION - Make password_hash optional
-- ============================================
-- Run this in Supabase SQL Editor

-- 1. Make password_hash column nullable (required for OAuth users)
ALTER TABLE public.users 
ALTER COLUMN password_hash DROP NOT NULL;

-- 2. Drop and recreate the trigger function with better error handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Create improved trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_full_name TEXT;
    v_first_name TEXT;
    v_last_name TEXT;
BEGIN
    -- Only auto-create profiles for OAuth providers (Google, etc.)
    -- Email/password signups will be handled by the signup API
    IF NEW.raw_app_meta_data->>'provider' IN ('google', 'github', 'facebook', 'twitter', 'apple') THEN
        -- Extract full name from user metadata
        v_full_name := COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            SPLIT_PART(NEW.email, '@', 1)
        );
        
        -- Split into first and last name
        v_first_name := SPLIT_PART(v_full_name, ' ', 1);
        v_last_name := SUBSTRING(v_full_name FROM POSITION(' ' IN v_full_name) + 1);
        
        -- If last name is empty, set it to empty string
        IF v_last_name IS NULL OR v_last_name = '' OR v_last_name = v_first_name THEN
            v_last_name := '';
        END IF;
        
        -- Insert user profile (password_hash is now nullable, so we don't set it)
        INSERT INTO public.users (
            id, 
            email, 
            first_name, 
            last_name, 
            is_admin, 
            phone, 
            is_active,
            password_hash
        )
        VALUES (
            NEW.id,
            NEW.email,
            v_first_name,
            v_last_name,
            false,
            NEW.raw_user_meta_data->>'phone',
            true,  -- OAuth users are active immediately
            NULL   -- OAuth users don't have password_hash
        )
        ON CONFLICT (id) DO UPDATE 
        SET 
            is_active = true,
            updated_at = NOW();
        
        RAISE NOTICE 'Created/updated user profile for OAuth user: %', NEW.email;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the auth.users insert
        RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 5. Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users' 
  AND column_name = 'password_hash';

-- Should show: is_nullable = 'YES'

-- 6. Verify trigger exists
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 7. Test the trigger (optional - creates a test log entry)
-- DO $$
-- BEGIN
--     RAISE NOTICE 'Trigger setup complete. Ready for OAuth users!';
-- END $$;

SELECT 'OAuth setup complete! password_hash is now optional for OAuth users.' as status;
