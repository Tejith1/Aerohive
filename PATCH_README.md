# AeroHive — Patch Notes & Changed Files
**Date:** 26 May 2026  
**Purpose:** Bug fixes (TypeScript errors), ESP email service integration, Gmail SMTP configuration

---

## 📦 Files Included in This Patch

This zip contains **6 modified files** and **2 new files** — every file that was changed or created compared to the original project.

---

## 🆕 NEW FILES

### 1. `lib/email.ts`
**Type:** New File  
**Why it was created:**  
The original project had email helper functions (`createGmailTransporter`, `generateEmailHtml`, `sendEmailDirect`, `BookingEmailDetails` interface) all defined inside `app/api/send-email/route.ts` and exported from there. This caused a **TypeScript error TS2344** — Next.js route files must ONLY export HTTP method handlers (`GET`, `POST`, etc.). Any other named export causes a type constraint violation in the `.next/types/` generated files.

**What it contains:**
- `BookingEmailDetails` interface — type definition for all booking email fields
- `EmailRequest` interface — type for the email API request body
- `createGmailTransporter()` — creates a Nodemailer SMTP transporter for Gmail (port 465, SSL)
- `generateEmailHtml(type, details)` — generates beautiful HTML email templates for both "client" (BOOKING CONFIRMED) and "pilot" (NEW MISSION ASSIGNED) email types
- `sendEmailDirect({ to, subject, type, bookingDetails })` — sends email via Gmail SMTP (primary) with automatic fallback to Resend API if Gmail fails

**Path in project:** `lib/email.ts`

---

### 2. `test_email_now.mjs`
**Type:** New File (Diagnostic/Utility Script)  
**Why it was created:**  
A standalone Node.js script to directly test the Gmail SMTP connection and email sending WITHOUT needing the Next.js server. Useful for debugging email issues.

**How to run:**
```bash
node test_email_now.mjs
```

**What it does:**
1. Reads `GMAIL_USER` and `GMAIL_APP_PASSWORD` from `.env.local`
2. Verifies the SMTP connection to smtp.gmail.com:465
3. Sends a test HTML email to the configured Gmail address
4. Prints success/failure with diagnostics

**Path in project:** `test_email_now.mjs` (root)

---

## ✏️ MODIFIED FILES

### 3. `app/api/send-email/route.ts`
**Type:** Modified (completely rewritten)  
**Original issue:** The file exported `createGmailTransporter`, `generateEmailHtml`, `sendEmailDirect`, `BookingEmailDetails`, and `MEDIATOR_EMAIL` — none of which are valid Next.js route exports, causing TS2344 error.

**What changed:**
- **REMOVED** all helper function definitions and type exports from this file
- **KEPT** only the `POST` HTTP handler (the only valid export for a Next.js route)
- **ADDED** import of `sendEmailDirect` and `EmailRequest` from `@/lib/email` (the new shared module)

**Key change (before → after):**
```ts
// BEFORE (caused TS2344 error):
export const MEDIATOR_EMAIL = 'aerohive.help@gmail.com'
export interface BookingEmailDetails { ... }
export function createGmailTransporter() { ... }
export function generateEmailHtml(...) { ... }
export async function sendEmailDirect(...) { ... }
export async function POST(...) { ... }  // ← only this is allowed

// AFTER (clean):
import { sendEmailDirect, type EmailRequest } from '@/lib/email'
export async function POST(...) { ... }  // ← only HTTP handler
```

**Path in project:** `app/api/send-email/route.ts`

---

### 4. `app/api/bookings/create/route.ts`
**Type:** Modified (1 line changed)  
**Original issue:** Line 3 imported `sendEmailDirect` and `BookingEmailDetails` from `../../send-email/route`. After the route file was cleaned up, these exports no longer existed there.

**What changed:**
```ts
// BEFORE:
import { sendEmailDirect, BookingEmailDetails } from '../../send-email/route'

// AFTER:
import { sendEmailDirect, type BookingEmailDetails } from '@/lib/email'
```

**Path in project:** `app/api/bookings/create/route.ts`

---

### 5. `app/api/auth/send-otp/route.ts`
**Type:** Modified (lines 3–5 changed)  
**Original issue:** Line 3 imported `sendEmailDirect` AND `MEDIATOR_EMAIL` from `../../send-email/route`. After the route cleanup, `MEDIATOR_EMAIL` was no longer exported from there (TS2459 error).

**What changed:**
```ts
// BEFORE:
import { sendEmailDirect, MEDIATOR_EMAIL } from '../../send-email/route'

// AFTER:
import { sendEmailDirect } from '@/lib/email'
const MEDIATOR_EMAIL = 'aerohive.help@gmail.com'  // defined locally
```

**Path in project:** `app/api/auth/send-otp/route.ts`

---

### 6. `app/api/create-payment-intent/route.ts`
**Type:** Modified (1 line changed)  
**Original issue:** Stripe was initialized with `apiVersion: "2025-09-30.clover"` which does not exist in the installed `stripe` npm package's TypeScript types. This caused **TS2322 type error**.

**What changed:**
```ts
// BEFORE (invalid API version — caused TS2322):
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-09-30.clover",
})

// AFTER (correct stable version):
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-08-27.basil",
})
```

**Path in project:** `app/api/create-payment-intent/route.ts`

---

### 7. `.env.local`
**Type:** Modified (added ESP configuration section)  
**Original issue:** No Gmail SMTP credentials were configured, so the email system silently failed on every booking.

**What was added (lines 18–34):**
```env
# ─── ESP (Email Service Provider) - Gmail SMTP ───────────────────────────────
GMAIL_USER=bhuvanpremsurisetty@gmail.com
GMAIL_APP_PASSWORD=rqqcshiliaslisgl
```

**Important notes about `.env.local`:**
- `GMAIL_USER` — the Gmail address used to send emails FROM
- `GMAIL_APP_PASSWORD` — a 16-character Google App Password (NOT your regular Gmail password)
  - Must be generated at: https://myaccount.google.com/apppasswords
  - Must have **NO spaces** (Google displays it as `xxxx xxxx xxxx xxxx` — remove all spaces)
  - Requires **2-Step Verification** to be enabled on the Google account first
- This file is in `.gitignore` and should NEVER be committed to version control

**Path in project:** `.env.local` (root)

---

## 🏗️ Architecture Summary

### How the Email System Works Now

```
Customer clicks "Contact" on a pilot card
        ↓
app/drone-pilots/page.tsx  →  POST /api/bookings/create
        ↓
app/api/bookings/create/route.ts
  - Creates booking in Supabase DB
  - Fetches pilot email from drone_pilots table
  - Fetches client email from user session
  - Calls sendEmailDirect() from lib/email.ts
        ↓
lib/email.ts → createGmailTransporter() → smtp.gmail.com:465
  - Sends "BOOKING CONFIRMED" email → Customer Gmail
  - Sends "NEW MISSION ASSIGNED" email → Pilot Gmail
```

### Email Templates
Both emails use a premium dark/light HTML template with:
- AeroHive branding header
- Booking ID, service type, date/time, location grid
- OTP display (client email only — large prominent code)
- Pilot/client contact details
- CTA button (Track Booking / Accept & Confirm Job)
- Responsive design for mobile

---

## 🔧 TypeScript Errors Fixed

| Error | File | Root Cause | Fix |
|-------|------|------------|-----|
| TS2344 | `app/api/send-email/route.ts` | Non-HTTP exports in route file | Moved to `lib/email.ts` |
| TS2459 | `app/api/auth/send-otp/route.ts` | Importing non-existent export | Re-import from `lib/email` |
| TS2322 | `app/api/create-payment-intent/route.ts` | Invalid Stripe API version string | Fixed to `2025-08-27.basil` |

**Result:** `npx tsc --noEmit` → **0 errors** ✅

---

## 📋 How to Apply This Patch to the Original Project

1. Copy all files from this zip into the root of your project, **preserving the folder structure**
2. In `.env.local`, replace `GMAIL_APP_PASSWORD` with your own App Password if needed
3. Restart the dev server: `npm run dev`
4. Test email: `node test_email_now.mjs`

---

## 🧪 Testing

To verify emails work:
```bash
# Direct SMTP test (no server needed):
node test_email_now.mjs

# Or via the API (server must be running):
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your@gmail.com","subject":"Test","type":"client","bookingDetails":{...}}'
```

---

*Patch created by AeroHive development session — 26 May 2026*
