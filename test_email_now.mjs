// Direct Gmail SMTP Test - run with: node test_email_now.mjs
import nodemailer from 'nodemailer'
import { readFileSync } from 'fs'

// Parse .env.local manually
const envContent = readFileSync('.env.local', 'utf8')
const envVars = {}
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...rest] = trimmed.split('=')
    if (key && rest.length > 0) envVars[key.trim()] = rest.join('=').trim()
  }
}

const GMAIL_USER = envVars['GMAIL_USER']
const GMAIL_APP_PASSWORD = envVars['GMAIL_APP_PASSWORD']?.replace(/\s+/g, '')

console.log('='.repeat(60))
console.log('AeroHive Gmail SMTP Diagnostic Test')
console.log('='.repeat(60))
console.log(`📧 GMAIL_USER       : ${GMAIL_USER || '❌ NOT SET'}`)
console.log(`🔑 GMAIL_APP_PASSWORD: ${GMAIL_APP_PASSWORD ? `✅ Set (${GMAIL_APP_PASSWORD.length} chars)` : '❌ NOT SET'}`)
console.log('')

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
  console.error('❌ FATAL: Missing credentials in .env.local')
  process.exit(1)
}

if (GMAIL_APP_PASSWORD.length !== 16) {
  console.warn(`⚠️  WARNING: App password is ${GMAIL_APP_PASSWORD.length} chars (expected 16). May be wrong.`)
}

console.log('🔌 Creating Gmail SMTP transporter (port 465, SSL)...')
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD
  },
  tls: { rejectUnauthorized: false }
})

console.log('🔍 Verifying SMTP connection...')
try {
  await transporter.verify()
  console.log('✅ SMTP connection VERIFIED successfully!\n')
} catch (err) {
  console.error('❌ SMTP connection FAILED:', err.message)
  console.error('')
  console.error('Common fixes:')
  console.error('  1. Make sure 2-Step Verification is ON: https://myaccount.google.com/security')
  console.error('  2. Generate a fresh App Password: https://myaccount.google.com/apppasswords')
  console.error('  3. The App Password must be 16 characters, no spaces')
  console.error('  4. Use the Gmail account that matches GMAIL_USER')
  process.exit(1)
}

console.log(`📨 Sending test email TO: ${GMAIL_USER}`)
try {
  const result = await transporter.sendMail({
    from: `AeroHive Test <${GMAIL_USER}>`,
    to: GMAIL_USER,
    subject: '✅ AeroHive Email Test - ESP Working!',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;border:2px solid #2563eb;border-radius:12px;">
        <h2 style="color:#2563eb;margin-top:0;">✅ AeroHive Email is Working!</h2>
        <p>This is a diagnostic test email sent from your AeroHive application.</p>
        <p><strong>Gmail Account:</strong> ${GMAIL_USER}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString('en-IN')}</p>
        <hr style="border-color:#e5e7eb;"/>
        <p style="color:#6b7280;font-size:13px;">
          If you received this, booking confirmation emails to customers and pilots will work correctly.
        </p>
      </div>
    `
  })
  console.log(`✅ Email SENT successfully!`)
  console.log(`   Message ID: ${result.messageId}`)
  console.log(`   Response  : ${result.response}`)
  console.log('')
  console.log(`📬 Check your inbox at: ${GMAIL_USER}`)
  console.log('   (Also check Spam/Junk folder)')
} catch (err) {
  console.error('❌ Email send FAILED:', err.message)
  process.exit(1)
}
