
const GOOGLE_SHEETS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyZPFAZtXVVMbl2YyxTd169ZluPiOMakSptHbDcaGXW8yhhVxtIJbf8_IuQulzBvjE/exec';

const testData = {
  fullName: "Test Pilot",
  email: "test@example.com",
  phone: "1234567890",
  location: "Test City",
  area: "Test Area",
  experience: "5+ years",
  dgcaNumber: "TEST1234",
  hourlyRate: "1000",
  certifications: "Test, Cert",
  specializations: "Test, Special",
  about: "Test about",
  registrationDate: new Date().toLocaleString(),
  status: "Testing"
};

async function testSync() {
  console.log('Sending test data to Google Sheets...');
  try {
    const response = await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
      redirect: 'follow'
    });

    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}

testSync();
