# 📧 Email Confirmation Setup Guide

## ✅ What We've Implemented

Your registration flow now works with **email confirmation enabled**:

1. User registers → Account created (inactive)
2. User receives confirmation email
3. User clicks link → Account activated
4. User redirected to homepage with success message
5. User can now log in

## 🔧 Supabase Configuration Required

### Step 1: Enable Email Confirmations

1. Go to **Supabase Dashboard**: https://app.supabase.com
2. Select your project
3. Navigate to: **Authentication** → **Providers** → **Email**
4. Find: **"Confirm email"**
5. ✅ **Check** "Enable email confirmations"
6. Click **Save**

### Step 2: Configure Email Templates (Optional but Recommended)

1. In Supabase Dashboard, go to: **Authentication** → **Email Templates**
2. Click **"Confirm signup"**
3. Customize the email template:

```html
<h2>Confirm your email</h2>
<p>Follow this link to confirm your email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
```

You can make it more branded:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #2563eb;">Welcome to AeroHive! 🚁</h2>
  <p>Thank you for registering. Please confirm your email address to activate your account.</p>
  <p style="margin: 30px 0;">
    <a href="{{ .ConfirmationURL }}" 
       style="background: linear-gradient(to right, #2563eb, #4f46e5); 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 8px; 
              display: inline-block;">
      Confirm Email Address
    </a>
  </p>
  <p style="color: #666; font-size: 14px;">
    If you didn't create an account, you can safely ignore this email.
  </p>
</div>
```

### Step 3: Add Redirect URL to Allowed List

1. In Supabase Dashboard, go to: **Authentication** → **URL Configuration**
2. Find **"Redirect URLs"** section
3. Add these URLs:
   ```
   http://localhost:3001/auth/callback
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   ```
4. Click **Save**

### Step 4: Configure Email Service (If Not Already Done)

Supabase provides a default email service, but for production:

1. Go to: **Project Settings** → **Auth** → **SMTP Settings**
2. Configure your own SMTP server (recommended for production):
   - **Host**: smtp.gmail.com (or your provider)
   - **Port**: 587
   - **Username**: your-email@gmail.com
   - **Password**: your-app-password

For Gmail:
- Enable 2-factor authentication
- Generate an "App Password"
- Use that password in SMTP settings

## 🧪 Testing the Flow

### Test Registration:

1. **Start your dev server** (should already be running on http://localhost:3001)

2. **Go to registration**: http://localhost:3001/register

3. **Fill out the form**:
   - First Name: Test
   - Last Name: User
   - Email: your-real-email@gmail.com (use a real email you can access)
   - Password: test123
   - ✅ Agree to terms

4. **Submit the form**

5. **You should see**:
   - Toast message: "Registration Successful! 🎉 Please check your email..."
   - Redirect to homepage with blue toast: "📧 Check Your Email!"

6. **Check your email inbox**:
   - Look for email from Supabase
   - Subject: "Confirm your signup"
   - Click the confirmation link

7. **After clicking link**:
   - Redirect to homepage
   - Green toast: "✅ Email Confirmed! Your account is now active..."

8. **Now try logging in**:
   - Go to: http://localhost:3001/login
   - Use the email and password you registered with
   - Should successfully log in

## 📋 User Flow Diagram

```
User Registers
    ↓
Account Created (is_active: false)
    ↓
Profile Created in Database
    ↓
Confirmation Email Sent
    ↓
User Redirected to Homepage
    ↓
Toast: "📧 Check Your Email!"
    ↓
User Opens Email
    ↓
User Clicks Confirmation Link
    ↓
/auth/callback route processes link
    ↓
User Profile Updated (is_active: true)
    ↓
User Redirected to Homepage
    ↓
Toast: "✅ Email Confirmed!"
    ↓
User Can Now Login
```

## 🔍 Troubleshooting

### Email Not Arriving?

1. **Check Spam/Junk folder**

2. **Verify email settings in Supabase**:
   - Go to: Authentication → Settings
   - Check "Enable email confirmations" is ON
   - Verify SMTP settings (if custom)

3. **Check Supabase logs**:
   - Dashboard → Logs → Auth Logs
   - Look for email send events

4. **For Development**:
   - Supabase might rate-limit emails
   - Try with different email addresses
   - Check if email service is enabled

### Confirmation Link Not Working?

1. **Check redirect URLs**:
   - Must include `http://localhost:3001/auth/callback`
   - Case-sensitive

2. **Check browser console**:
   - Look for errors in `/auth/callback`

3. **Verify callback route exists**:
   - File: `app/auth/callback/route.ts` ✅ Created

### User Can't Login After Confirming?

1. **Check database**:
   - Supabase Dashboard → Table Editor → users
   - Find user by email
   - Verify `is_active = true`

2. **Check auth.users**:
   - Dashboard → Authentication → Users
   - Verify email shows "Confirmed" (green checkmark)

3. **Try password reset**:
   - Use Supabase "Send password recovery" feature

## 🎨 Customization Options

### Change Email Confirmation Message

Edit `contexts/auth-context.tsx` line ~310:

```typescript
toast({
  title: "Registration Successful! 🎉",
  description: "Your custom message here...",
  className: "border-green-200 bg-green-50 text-green-900",
  duration: 10000,
})
```

### Change Redirect After Confirmation

Edit `app/auth/callback/route.ts` line ~35:

```typescript
return NextResponse.redirect(
  new URL('/products?message=welcome', requestUrl.origin) // Custom redirect
)
```

### Skip Email Confirmation (Development Only)

If you want to temporarily disable for testing:

1. **Supabase Dashboard** → Authentication → Email
2. **Uncheck** "Enable email confirmations"
3. User will be logged in immediately after registration

⚠️ **Remember to re-enable for production!**

## 🚀 Production Checklist

Before deploying:

- [ ] Email confirmation enabled in Supabase
- [ ] Custom SMTP server configured (not using Supabase default)
- [ ] Email templates customized with your branding
- [ ] Production redirect URL added to allowed list
- [ ] Test full registration → confirmation → login flow
- [ ] Verify emails arrive in inbox (not spam)
- [ ] Check email templates on mobile devices
- [ ] Set up email analytics/monitoring

## 📊 Database Schema

The `users` table has these key fields for email confirmation:

```sql
users:
  - id: UUID (from auth.users)
  - email: TEXT
  - is_active: BOOLEAN  -- false until email confirmed
  - created_at: TIMESTAMP
```

When user confirms:
- `auth.users.email_confirmed_at` is set
- `public.users.is_active` is set to `true`

## 🔒 Security Notes

1. **Email links expire** (Supabase default: 24 hours)
2. **One-time use**: Confirmation links can't be reused
3. **Inactive accounts**: Users can't login until confirmed
4. **Password security**: Passwords hashed by Supabase Auth
5. **Session security**: Cookies are httpOnly and secure

## 💡 Next Steps

1. **Enable email confirmation** in Supabase (Step 1 above)
2. **Add redirect URL** to allowed list (Step 3)
3. **Test registration** with a real email
4. **Customize email template** (optional)
5. **Set up production SMTP** (before going live)

Your registration with email confirmation is now fully implemented! 🎉
