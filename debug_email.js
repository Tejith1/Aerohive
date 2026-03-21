
const fetch = require('node-fetch');

async function testEmail() {
    const baseUrl = 'http://localhost:3000';
    const to = 'aerohive.help@gmail.com'; // Send to self for testing
    
    console.log(`--- Testing Email Sending for Pilot ---`);
    const payload = {
        to,
        subject: 'Debug Job Assignment | Action Required',
        type: 'pilot',
        bookingDetails: {
            bookingId: '#AH-DEBUG',
            orderUUID: 'debug-uuid-123',
            otp: '1234',
            pilotName: 'Test Pilot',
            clientName: 'Test Client',
            location: 'Bangalore Office',
            scheduledAt: '21-Mar-2026, 6:00 PM',
            durationHours: 2,
            acceptJobLink: 'http://localhost:3000/pilots/accept-job?id=debug-uuid-123',
            estimatedAmount: '₹5000'
        }
    };

    try {
        const res = await fetch(`${baseUrl}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log('Result:', data);
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

testEmail();
