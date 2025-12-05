# Google OAuth - Comprehensive Testing Guide

## Current Status
✅ Client-side callback page created (`app/auth/callback/page.tsx`)
✅ Enhanced auth context with detailed logging
✅ localStorage-based success notification
✅ Comprehensive error handling

## Testing Steps

### 1. Open Browser DevTools (F12)
- Open **Console** tab
- Open **Network** tab
- Keep it open during entire OAuth flow

### 2. Start Fresh
```powershell
# Clear browser data (in DevTools Console):
localStorage.clear()
# Then manually clear cookies for localhost:3000
```

### 3. Test OAuth Flow
1. Click **"Sign up with Google"** button
2. Watch Console for logs (should see emojis 🔵 📊 ✅)
3. Complete Google authentication
4. Should redirect to `/auth/callback`
5. Watch for callback logs:
   - 🔵 "Starting OAuth callback..."
   - 📊 "Exchanging code for session..."
   - 📊 "Exchange result"
   - 📝 "Creating user profile..." (if new user)
   - ✅ "User profile created successfully"
   - 🏠 "Redirecting to homepage..."
6. Should see success screen briefly
7. Should redirect to homepage with welcome toast

### 4. Check Auth State
In browser console (on homepage):
```javascript
// Check if user is authenticated
console.log('Auth user:', await window.supabase.auth.getUser())

// Check if profile exists
console.log('Profile:', await window.supabase.from('users').select('*').single())
```

### 5. Verify in Supabase Dashboard

#### Check Authentication
1. Go to: Authentication → Users
2. Look for your Google email
3. Should show:
   - Email confirmed: ✓
   - Provider: google
   - Last sign in: recent timestamp

#### Check User Profile
1. Go to: Table Editor → users
2. Look for your email
3. Should show:
   - id: matches auth.users.id
   - email: your Google email
   - first_name: from Google profile
   - last_name: from Google profile
   - is_admin: false
   - is_active: true

#### Check Logs
1. Go to: Logs
2. Look for recent entries
3. Check for any errors

### 6. Check Console Logs

You should see this sequence in browser console:

```
🔔 Auth state change: INITIAL_SESSION undefined
🔍 Fetching user profile... undefined
🔵 Starting OAuth callback...
📊 Exchanging code for session...
📊 Exchange result: { hasUser: true, hasSession: true, error: undefined }
✅ User authenticated: your@email.com
Provider: google
📊 User profile check: { exists: false, error: 'PGRST116' }
📝 Creating user profile...
✅ User profile created successfully
🏠 Redirecting to homepage...
🔔 Auth state change: SIGNED_IN your@email.com
📊 User signed in, fetching profile...
🔍 Fetching user profile... your@email.com
✅ User profile loaded: your@email.com
🎉 OAuth login successful!
```

## Common Issues & Solutions

### Issue 1: "Redirecting to login page"
**Possible causes:**
- Callback page not being used (still using old route.ts)
- Auth state not propagating
- Cookies not being set

**Solution:**
- Verify `app/auth/callback/page.tsx` exists
- Verify `app/auth/callback/route.ts` is DELETED
- Check browser console for errors
- Check Network tab for callback request

### Issue 2: "Data not stored in Supabase"
**Possible causes:**
- Trigger not installed
- RLS policies blocking insert
- Email already exists with different provider

**Solutions:**
1. **Install trigger:**
   ```sql
   -- Run in Supabase SQL Editor
   -- Copy from scripts/create-google-oauth-trigger.sql
   ```

2. **Check RLS policies:**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

3. **Check for existing user:**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT * FROM auth.users WHERE email = 'your@email.com';
   SELECT * FROM public.users WHERE email = 'your@email.com';
   ```

### Issue 3: "Profile creation error in console"
**Check the error message:**
- If "duplicate key": User already exists, just needs activation
- If "permission denied": RLS policy issue
- If "column does not exist": Database schema mismatch

**Solutions:**
- For duplicate: Normal, should activate existing user
- For permission: Update RLS policies
- For schema: Verify users table structure

### Issue 4: "Session not persisting"
**Symptoms:**
- User authenticated in callback
- Homepage shows not authenticated
- Auth context says no user

**Solutions:**
1. Check if `onAuthStateChange` is firing:
   ```typescript
   // Should see in console:
   🔔 Auth state change: SIGNED_IN your@email.com
   ```

2. Verify profile can be fetched:
   ```typescript
   // Should see in console:
   🔍 Fetching user profile... your@email.com
   ✅ User profile loaded: your@email.com
   ```

3. If profile not loading, check:
   - Does user exist in public.users table?
   - Are RLS policies correct?
   - Is is_active = true?

## Debugging Checklist

- [ ] Browser console open (F12)
- [ ] Network tab open
- [ ] Clicked "Sign up with Google"
- [ ] Saw Google authentication screen
- [ ] Redirected to `/auth/callback`
- [ ] Saw loading spinner on callback page
- [ ] Saw console logs with emojis (🔵 📊 ✅)
- [ ] Saw success screen (green checkmark)
- [ ] Redirected to homepage
- [ ] Saw welcome toast notification
- [ ] User avatar/name shows in header (if applicable)

## Next Steps If Still Failing

1. **Share console logs:**
   - Copy ALL console output from OAuth flow
   - Include any errors (red text)

2. **Share Network tab:**
   - Look for `/auth/callback` request
   - Check status code (should be 200)
   - Check response

3. **Run verification script:**
   - Open Supabase SQL Editor
   - Run `scripts/verify-oauth-setup.sql`
   - Share results

4. **Check Supabase logs:**
   - Go to Logs in Supabase dashboard
   - Look for errors during OAuth attempt
   - Share any error messages

## Environment Check

Make sure these are set in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_SUPABASE_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Make sure Google OAuth is configured in Supabase:
1. Go to: Authentication → Providers → Google
2. Should be **Enabled**
3. Should have Client ID and Client Secret
4. Callback URL should be: `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`

## Expected Behavior Summary

**What SHOULD happen:**
1. Click Google button → Redirect to Google
2. Authenticate with Google → Redirect to `/auth/callback`
3. Callback page exchanges code for session
4. Callback page creates user profile
5. Callback page redirects to homepage
6. Auth context detects session
7. Auth context fetches user profile
8. Homepage shows user as logged in
9. Welcome toast appears

**What you're experiencing:**
- Some steps working
- Some steps failing
- Need to identify where it breaks

**Follow the console logs** - they will tell us exactly where the flow breaks!
