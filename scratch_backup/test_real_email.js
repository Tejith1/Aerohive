const fs = require('fs');
const path = require('path');

// Manually set environment variables so lib/email.ts gets them
const envContent = fs.readFileSync('.env.local', 'utf8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...rest] = trimmed.split('=');
    if (key && rest.length > 0) process.env[key.trim()] = rest.join('=').trim();
  }
}

const { sendEmailDirect } = require('../lib/email');

async function test() {
  console.log('Testing sendEmailDirect from lib/email...');
  
  const bookingDetails = {
    bookingId: '#AH-9999',
    orderUUID: 'test-uuid-1234',
    otp: '1234',
    pilotName: 'Arjun Patel',
    pilotPhone: '+91-9999988888',
    pilotEmail: 'bhuvanpremsurisetty@gmail.com',
    clientName: 'Valued Customer',
    clientPhone: '8888888888',
    clientEmail: 'bhuvanpremsurisetty@gmail.com',
    serviceType: 'Drone Survey',
    location: 'Mumbai, India',
    scheduledAt: '28-May-2026 10:00 AM',
    estimatedAmount: '₹3,500'
  };

  const result = await sendEmailDirect({
    to: 'bhuvanpremsurisetty@gmail.com',
    subject: 'AeroHive Test Real Email Function',
    type: 'client',
    bookingDetails
  });

  console.log('Result:', result);
}

test();
