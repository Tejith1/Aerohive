-- Trigger to automatically create user profile when someone signs up with Google
-- Run this in Supabase SQL Editor

-- Function to create user profile on signup (ONLY for OAuth providers)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only auto-create profiles for OAuth providers (Google, etc.)
  -- Email/password signups will be handled by the signup API
  IF NEW.raw_app_meta_data->>'provider' IN ('google', 'github', 'facebook', 'twitter') THEN
    INSERT INTO public.users (id, email, first_name, last_name, is_admin, phone, is_active)
    VALUES (
      NEW.id,
      NEW.email,
      -- Extract first name from OAuth full_name or use email prefix
      COALESCE(
        SPLIT_PART(NEW.raw_user_meta_data->>'full_name', ' ', 1),
        SPLIT_PART(NEW.raw_user_meta_data->>'name', ' ', 1),
        SPLIT_PART(NEW.email, '@', 1)
      ),
      -- Extract last name from OAuth full_name or leave empty
      COALESCE(
        SUBSTRING(NEW.raw_user_meta_data->>'full_name' FROM POSITION(' ' IN NEW.raw_user_meta_data->>'full_name') + 1),
        SUBSTRING(NEW.raw_user_meta_data->>'name' FROM POSITION(' ' IN NEW.raw_user_meta_data->>'name') + 1),
        ''
      ),
      false, -- is_admin
      NEW.raw_user_meta_data->>'phone',
      true  -- OAuth users are active immediately (no email confirmation needed)
    )
    ON CONFLICT (id) DO UPDATE 
    SET is_active = true;  -- Ensure OAuth users are always active
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify trigger was created
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
