
const GOOGLE_SHEETS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyZPFAZtXVVMbl2YyxTd169ZluPiOMakSptHbDcaGXW8yhhVxtIJbf8_IuQulzBvjE/exec';

const testData = {
  fullName: "Form Data Test",
  email: "form@example.com",
  phone: "0000000000",
  location: "Form City",
  status: "Testing"
};

async function testSyncForm() {
  console.log('Sending test data as Form Data...');
  try {
    const params = new URLSearchParams(testData);
    const response = await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: 'POST',
      body: params,
      redirect: 'follow'
    });

    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response (first 100 bytes):', text.substring(0, 100));
  } catch (err) {
    console.error('Error:', err);
  }
}

testSyncForm();
