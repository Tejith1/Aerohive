// Quick test: send a test email using the current .env.local credentials
require('dotenv').config({ path: '.env.local' })
const nodemailer = require('nodemailer')

async function testEmail() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD

  console.log('=== GMAIL CREDENTIALS CHECK ===')
  console.log(`GMAIL_USER: '${user}'`)
  console.log(`GMAIL_APP_PASSWORD: '${pass}'`)
  console.log(`GMAIL_APP_PASSWORD (sanitized, no spaces): '${pass?.replace(/\s+/g, '')}'`)
  console.log(`Password length (raw): ${pass?.length}`)
  console.log(`Password length (sanitized): ${pass?.replace(/\s+/g, '').length}`)

  if (!user || !pass) {
    console.error('❌ GMAIL_USER or GMAIL_APP_PASSWORD is missing!')
    return
  }

  // Test pilot email target
  const testPilotEmail = 'dtejithreddy@gmail.com'

  console.log(`\n=== SENDING TEST EMAIL TO PILOT: ${testPilotEmail} ===`)

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: user,
        pass: pass.replace(/\s+/g, '')
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 8000
    })

    // Verify connection
    console.log('🔌 Verifying SMTP connection...')
    await transporter.verify()
    console.log('✅ SMTP connection verified successfully!')

    // Send test email
    const result = await transporter.sendMail({
      from: `AeroHive Support <${user}>`,
      replyTo: user,
      to: testPilotEmail,
      subject: '[TEST] AeroHive - Pilot Email Delivery Test',
      html: '<h2>This is a test email from AeroHive</h2><p>If you received this, the pilot email delivery is working correctly.</p>'
    })

    console.log(`✅ Test email sent! Message ID: ${result.messageId}`)
    console.log(`✅ Response: ${result.response}`)
  } catch (err) {
    console.error('❌ EMAIL FAILED:', err.message)
    console.error('Full error:', err)
  }
}

testEmail()
