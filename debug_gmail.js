
const nodemailer = require('nodemailer');
const fs = require('fs');

// Read .env.local manually if dotenv is missing
const env = fs.readFileSync('.env.local', 'utf8');
const envMap = {};
env.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        envMap[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
});

const gmailUser = envMap['GMAIL_USER'];
const gmailAppPassword = envMap['GMAIL_APP_PASSWORD']?.replace(/\s+/g, '');

async function testGmail() {
    console.log(`--- Testing Gmail Connection ---`);
    console.log(`User: ${gmailUser}`);
    console.log(`Password (masked): ${gmailAppPassword ? '****' + gmailAppPassword.slice(-4) : 'MISSING'}`);

    if (!gmailUser || !gmailAppPassword) {
        console.error('❌ Missing credentials in .env.local');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: gmailUser,
            pass: gmailAppPassword
        }
    });

    try {
        console.log('🔄 Verifying transporter...');
        await transporter.verify();
        console.log('✅ Connection verified!');

        console.log('🔄 Attempting to send test email...');
        const info = await transporter.sendMail({
            from: `"AeroHive Test" <${gmailUser}>`,
            to: gmailUser,
            subject: 'AeroHive Email System Test',
            text: 'This is a test to verify the Gmail App Password configuration'
        });
        console.log('✅ Email sent successfully!', info.messageId);
    } catch (error) {
        console.error('❌ Gmail test failed:', error);
        console.error('Error stack:', error.stack);
    }
}

testGmail();
