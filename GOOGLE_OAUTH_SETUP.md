# Google OAuth Setup Guide

## Google Client Credentials
- **Client ID**: `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`
- **Client Secret**: `YOUR_GOOGLE_CLIENT_SECRET`

> ⚠️ **Note**: Keep these credentials secure! Never commit them to public repositories.
> Store them in environment variables or Supabase dashboard only.

## Supabase Configuration Steps

### 1. Enable Google Provider in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list
5. Click **Enable**

7. Click **Save**

### 2. Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (round-catfish-420804)
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Add these to **Authorized redirect URIs**:
   ```
   https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```
6. Add these to **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://your-production-domain.com
   ```
7. Click **Save**

### 3. Test the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test Google Sign-In**:
   - Go to http://localhost:3000/login
   - Click "Sign in with Google"
   - You should be redirected to Google login
   - After successful login, you'll be redirected back to your app

3. **Test Google Sign-Up**:
   - Go to http://localhost:3000/register
   - Click "Sign up with Google"
   - Same flow as sign-in

### 4. User Profile Creation

When a user signs in with Google for the first time, Supabase automatically creates a user in the `auth.users` table. However, you need to create a corresponding entry in your `users` table.

**Option 1: Database Trigger (Recommended)**

Create a trigger in Supabase SQL Editor:

```sql
-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    '',
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Option 2: Manual Backend Endpoint**

Create an API route to handle user profile creation after Google sign-in.

## Features Implemented

✅ Google OAuth sign-in on login page
✅ Google OAuth sign-up on register page  
✅ Maintains existing CSS styling
✅ Error handling for OAuth failures
✅ Redirect to home page after successful auth
✅ Compatible with existing email/password authentication

## Testing Checklist

- [ ] Google sign-in works on login page
- [ ] Google sign-up works on register page
- [ ] User is redirected to home page after successful auth
- [ ] User profile is created in database
- [ ] Email/password login still works
- [ ] Email/password registration still works

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Check that redirect URI in Google Cloud Console matches Supabase callback URL
- Make sure to include both production and localhost URLs

### User not created in users table
- Run the database trigger SQL script above
- Check Supabase logs for errors

### OAuth popup blocked
- Make sure user allows popups in browser
- Some browsers block OAuth popups by default

## Security Notes

⚠️ **Important**: Keep your Client Secret secure!
- Never commit it to version control
- Use environment variables in production
- Rotate credentials if exposed

## Production Deployment

Before deploying to production:

1. Add production domain to Google Cloud Console authorized origins
2. Add production callback URL to Google Cloud Console redirect URIs
3. Ensure Supabase project is in production mode
4. Test OAuth flow on production domain
