
const fs = require('fs');

// Read .env.local manually
const env = fs.readFileSync('.env.local', 'utf8');
const envMap = {};
env.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        envMap[parts[0].trim()] = parts.slice(1).join('=').trim();
    }
});

const accessKeyId = envMap['FONOSTER_ACCESS_KEY_ID'];
const accessKeySecret = envMap['FONOSTER_ACCESS_KEY_SECRET'];
const from = envMap['FONOSTER_PHONE_NUMBER'] || 'AeroHive';
const to = '+917416860912'; // User's number

async function testFonosterReal() {
    console.log(`--- Real Fonoster Diagnostic ---`);
    console.log(`Access Key ID: ${accessKeyId ? accessKeyId.slice(0, 10) + '...' : 'MISSING'}`);
    console.log(`From: ${from}`);
    console.log(`To: ${to}`);

    if (!accessKeyId || !accessKeySecret) {
        console.error('❌ Missing credentials in .env.local');
        return;
    }

    const auth = Buffer.from(`${accessKeyId}:${accessKeySecret}`).toString('base64');

    try {
        // Try multiple common REST endpoints for Fonoster
        const endpoints = [
            'https://api.fonoster.com/v1/sms',
            'https://api.fonoster.com/v2/sms'
        ];

        for (const url of endpoints) {
            console.log(`\n🔄 Testing URL: ${url}`);
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from,
                    to,
                    message: 'AeroHive: Live Realtime SMS Diagnostic Test.',
                })
            });

            const text = await res.text();
            console.log(`Response Status: ${res.status}`);
            console.log(`Response Body: ${text}`);

            if (res.ok) {
                console.log(`✅ SUCCESS on ${url}`);
                break;
            }
        }
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

testFonosterReal();
