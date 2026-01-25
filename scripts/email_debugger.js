
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
    console.log('🔍 Testing Email Configuration...');

    // Explicitly check for the mediator email as per user request
    const MEDIATOR = 'aerohive.help@gmail.com';
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user) {
        console.error('❌ GMAIL_USER is missing in .env.local');
        return;
    }

    if (user.trim() !== MEDIATOR) {
        console.warn(`⚠️ Warning: GMAIL_USER is set to '${user}', but expected '${MEDIATOR}'`);
    }

    if (!pass) {
        console.error('❌ GMAIL_APP_PASSWORD is missing in .env.local');
        console.error('Please generate an App Password from Google Account > Security > 2-Step Verification > App Passwords');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass }
    });

    try {
        console.log('📡 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP Connection Successful!');
        console.log(`✅ Authenticated as: ${user}`);

        console.log(`📨 Sending test email to: ${user}...`);
        const info = await transporter.sendMail({
            from: `AeroHive Debugger <${user}>`,
            to: user,
            subject: 'AeroHive SMTP Configuration Test',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #059669;">Test Successful!</h2>
                    <p>Your email configuration is working correctly.</p>
                    <p><strong>Configured Sender:</strong> ${user}</p>
                    <p>Timestamp: ${new Date().toLocaleString()}</p>
                </div>
            `
        });

        console.log('✅ Email Sent!');
        console.log('Messsage ID:', info.messageId);
        console.log('Please check your inbox (and spam folder).');

    } catch (error) {
        console.error('❌ Email Sending Failed:');
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);

        if (error.response) {
            console.error('SMTP Response:', error.response);
        }
    }
}

testEmail();
