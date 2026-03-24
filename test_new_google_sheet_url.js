
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n=============================================');
console.log('🤖 GOOGLE SHEETS DEPLOYMENT TESTER 🤖');
console.log('=============================================\n');
console.log('I cannot fix this automatically because it requires logging into YOUR Google account.');
console.log('The current URL is blocking access because it is not set to "Access: Anyone".\n');
console.log('Have you followed the guide to create a NEW deployment with "Access: Anyone"?');

rl.question('If yes, please paste the NEW Web App URL here (or press Enter to exit): ', async (newUrl) => {
  if (!newUrl || !newUrl.includes('script.google.com')) {
    console.log('\n❌ No valid URL provided. Exiting.');
    rl.close();
    return;
  }

  console.log('\nTesting new URL...', newUrl);
  
  try {
    const response = await fetch(newUrl, { 
      method: 'POST', 
      redirect: 'manual',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true })
    });
    
    if (response.status === 302) {
      console.log('\n❌ FAILED! The script is STILL redirecting to a Google Login page.');
      console.log('You must recreate the deployment and specifically select "Who has access: Anyone".');
    } else {
      console.log(`\n✅ SUCCESS! The new URL is working. Status code: ${response.status}`);
      
      // Update .env.local
      let envLocal = fs.readFileSync('.env.local', 'utf8');
      envLocal = envLocal.replace(/GOOGLE_SHEETS_WEB_APP_URL=.*/g, `GOOGLE_SHEETS_WEB_APP_URL=${newUrl}`);
      fs.writeFileSync('.env.local', envLocal);
      console.log('✅ Next.js environment variables updated! Please restart your dev server.');
    }
  } catch (err) {
    console.log('\n❌ Error testing URL:', err.message);
  }
  
  rl.close();
});
