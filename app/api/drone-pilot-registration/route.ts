
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Use environment variable with hardcoded fallback
    const GOOGLE_SHEETS_WEB_APP_URL = process.env.GOOGLE_SHEETS_WEB_APP_URL || 'https://script.google.com/macros/s/AKfycbx7KedcJl5F10aKfL7Bf0di05tJ_pAZh0gvfiozTGY8V86OqvMSP6gz1PlWh15iRrI3/exec'
    
    console.log('📤 Forwarding registration to Google Sheets:', body)
    
    // Send data to Google Sheets via Web App URL
    // We use a query string or form data depending on how the script is set up.
    // Most Apps Script "doPost" functions expect the data in the body.
    const response = await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      // Important for Google Apps Script redirects
      redirect: 'follow'
    })
    
    if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Google Sheets API response not OK:', response.status, errorText)
        // We don't necessarily want to fail the whole registration if Google Sheets fails
    } else {
        console.log('✅ Successfully sent to Google Sheets')
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ Error in drone-pilot-registration API:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}
