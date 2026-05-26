
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

const fonosterToken = envMap['FONOSTER_TOKEN'];
const fonosterPhoneNumber = envMap['FONOSTER_PHONE_NUMBER'];
const testTo = '9876543210'; // Replace with a real test number if available

async function testFonoster() {
    console.log(`--- Testing Fonoster SMS ---`);
    console.log(`Token (masked): ${fonosterToken ? '****' + fonosterToken.slice(-4) : 'MISSING'}`);
    console.log(`From Number: ${fonosterPhoneNumber || 'MISSING'}`);

    if (!fonosterToken || !fonosterPhoneNumber) {
        console.error('❌ Missing Fonoster credentials in .env.local');
        return;
    }

    try {
        console.log(`🔄 Attempting to send test SMS to ${testTo}...`);
        const res = await fetch(`https://api.fonoster.com/v1/sms`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${fonosterToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: fonosterPhoneNumber,
                to: testTo,
                message: 'AeroHive: This is a diagnostic test of the Fonoster SMS system.',
            })
        });

        const data = await res.json();
        if (res.ok) {
            console.log('✅ SMS sent successfully!', data);
        } else {
            console.error('❌ Fonoster API error:', data);
        }
    } catch (error) {
        console.error('❌ Network error during Fonoster test:', error.message);
    }
}

testFonoster();
