
const GOOGLE_SHEETS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbx7KedcJl5F10aKfL7Bf0di05tJ_pAZh0gvfiozTGY8V86OqvMSP6gz1PlWh15iRrI3/exec';

const testData = {
  fullName: "GET_Test",
  email: "get@example.com",
  phone: "0000000000",
  location: "GET City",
  status: "Testing"
};

async function testSyncGET() {
  console.log('Sending test data as GET query params...');
  try {
    const params = new URLSearchParams(testData);
    const response = await fetch(`${GOOGLE_SHEETS_WEB_APP_URL}?${params}`, {
      method: 'GET',
      redirect: 'follow'
    });

    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response (first 100 bytes):', text.substring(0, 100));
  } catch (err) {
    console.error('Error:', err);
  }
}

testSyncGET();
