# Deployment Troubleshooting Guide

## Issues Fixed in Latest Update

### 1. ✅ Supabase Client Deprecation Warning
**Issue:** "using deprecated parameters for the initialization function"
**Fix:** Updated Supabase client initialization to use modern API without deprecated nested configuration.

### 2. ✅ Session Persistence on Page Refresh
**Issue:** Database connection lost when refreshing the page
**Fixes Applied:**
- Added explicit `storage` and `storageKey` configuration
- Updated `onAuthStateChange` to use modern syntax
- Added retry logic (up to 1 retry) for network failures
- Better error handling in `fetchUserProfile()`

### 3. ✅ Data Loading Failures
**Issue:** Products not loading after refresh
**Fixes Applied:**
- Added retry logic to `getProducts()` (up to 2 retries with exponential backoff)
- Added retry logic to product fetching in homepage
- Enhanced error logging with emoji markers for easier debugging

### 4. ✅ Missing Favicon (404 Error)
**Fix:** Added favicon configuration to layout metadata

## Deployment Checklist

### Before Deploying:

1. **Environment Variables**
   - Ensure `NEXT_PUBLIC_SUPABASE_URL` is set in your deployment platform
   - Ensure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set in your deployment platform
   
2. **Supabase Configuration** (at https://app.supabase.com)
   - **Authentication > URL Configuration > Site URL**: Set to your deployed domain
     ```
     Example: https://yourdomain.com
     ```
   
   - **Authentication > URL Configuration > Redirect URLs**: Add these URLs:
     ```
     https://yourdomain.com/**
     https://yourdomain.com/auth/callback
     ```
   
   - **Authentication > Providers > Google**: Ensure it's enabled with correct credentials

3. **Google Cloud Console** (for OAuth)
   - **Authorized JavaScript origins**: Add your deployed domain
     ```
     https://yourdomain.com
     ```
   
   - **Authorized redirect URIs**: Add Supabase callback URL
     ```
     https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
     ```

### After Deploying:

1. **Test Session Persistence**
   - Sign in with email/password or Google
   - Refresh the page (F5)
   - ✅ Should remain logged in with profile visible
   
2. **Test Data Loading**
   - Open homepage
   - Check that featured products load
   - Refresh page
   - ✅ Products should reload successfully
   
3. **Check Browser Console**
   - Look for these success messages:
     - `🔄 Initializing auth...`
     - `✅ Session found: [email]`
     - `✅ User profile loaded: [email]`
     - `✅ Featured products loaded: [count]`
   
   - Should NOT see:
     - `❌ Session error`
     - `❌ Error fetching user profile`
     - Deprecation warnings about Supabase

## Common Issues & Solutions

### Issue: "Failed to load resource: 404" for /demo, /forgot-password, /admin/login
**Cause:** These routes don't exist in your application
**Solution:** These are just 404s from Next.js prefetching. They're harmless and won't affect functionality.

### Issue: Session still not persisting after deploy
**Possible Causes:**
1. Environment variables not set in deployment platform
2. Supabase Site URL not configured correctly
3. Browser blocking cookies (check browser console)

**Debug Steps:**
```javascript
// In browser console:
const { data: { session } } = await window.supabase.auth.getSession()
console.log('Session:', session)
```

If session is null but you just logged in, check:
- Supabase Dashboard > Authentication > URL Configuration
- Deployment platform environment variables

### Issue: OAuth profile not showing after Google sign-in
**Possible Causes:**
1. Database trigger `handle_new_user` not installed
2. RLS policies blocking profile access

**Fix:**
```sql
-- Verify trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- If missing, create it:
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, is_admin, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    FALSE,
    TRUE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## Monitoring Your Deployment

### Key Console Logs to Watch:

**On Page Load:**
```
🔄 Initializing auth...
✅ Session found: user@example.com
🔍 Fetching user profile... user@example.com
✅ User profile loaded: user@example.com
🔄 Fetching featured products...
✅ Featured products loaded: 4
```

**On Google OAuth:**
```
🎉 OAuth callback detected
📊 User signed in, fetching profile...
✅ Session found: user@gmail.com
```

**Retry Indicators (only if network issues):**
```
🔄 Retrying profile fetch...
🔄 Retrying getProducts (attempt 1)...
```

### Error Indicators:
```
❌ Session error: [error message]
❌ Error fetching user profile: [error message]
❌ Database query error: [error message]
```

If you see these, check:
1. Network tab for failed requests
2. Supabase dashboard for service status
3. Environment variables in deployment platform

## Performance Improvements

The latest updates include:
- **Automatic retry logic**: 1-2 retries on network failures
- **Better session storage**: Explicit localStorage configuration
- **Exponential backoff**: Delays increase with each retry
- **Enhanced logging**: Easier debugging with emoji markers

## Next Steps

1. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "Fix session persistence and database connection issues"
   git push origin main
   ```

2. **Redeploy** your website (automatic with Vercel/Netlify if connected)

3. **Test thoroughly** using the checklist above

4. **Monitor console logs** for the first few user sessions

## Need More Help?

If issues persist after following this guide:
1. Share the full browser console logs (with errors)
2. Check Supabase Dashboard > Logs for server-side errors
3. Verify all environment variables are set correctly
4. Test authentication in a clean incognito window
