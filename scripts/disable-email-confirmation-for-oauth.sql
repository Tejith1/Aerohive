-- Disable email confirmation requirement for OAuth providers (Google, etc.)
-- This allows users who sign in with Google to bypass email confirmation
-- since their email is already verified by the OAuth provider

-- Note: This is a Supabase dashboard setting, not SQL
-- You need to configure this in the Supabase Dashboard UI

-- Steps to disable email confirmation for OAuth:
-- 1. Go to Supabase Dashboard
-- 2. Navigate to Authentication → Settings
-- 3. Scroll down to "Email Auth" section
-- 4. Find "Enable email confirmations"
-- 5. UNCHECK this option (or keep it checked for email/password but OAuth will bypass it)

-- Alternative: Configure per-provider settings
-- In Authentication → Providers → Google settings
-- There should be an option to skip email confirmation for OAuth providers

-- If you want to keep email confirmation for email/password signup but skip it for OAuth:
-- This is usually handled automatically by Supabase for OAuth providers
-- The error might be due to the redirect URL or callback handling

-- Check your redirect URL matches exactly:
-- Should be: https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
