import { NextRequest, NextResponse } from 'next/server'
import { sendEmailDirect, type EmailRequest } from '@/lib/email'

export async function POST(request: NextRequest) {
    try {
        const gmailUser = process.env.GMAIL_USER
        const gmailPass = process.env.GMAIL_APP_PASSWORD

        if (!gmailUser || !gmailPass) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Email provider not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD to .env.local'
                },
                { status: 500 }
            )
        }

        const body: EmailRequest = await request.json()
        const result = await sendEmailDirect(body)

        if (result.success) {
            return NextResponse.json(result)
        } else {
            return NextResponse.json(result, { status: 500 })
        }
    } catch (error: any) {
        console.error('Email API Error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to send email' },
            { status: 500 }
        )
    }
}
