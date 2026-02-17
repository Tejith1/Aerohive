
import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD
const SUPPORT_EMAIL = 'support@aerohive.co.in'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, phone, company, department, priority, subject, message } = body

        if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
            console.error('❌ Missing Gmail credentials in .env.local')
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: GMAIL_USER,
                pass: GMAIL_APP_PASSWORD.replace(/\s+/g, '')
            }
        })

        // Verify connection
        await transporter.verify()

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #1e40af; padding: 20px; color: white;">
                        <h2 style="margin: 0;">New Contact Us Submission</h2>
                    </div>
                    <div style="padding: 20px;">
                        <p><strong>Priority:</strong> <span style="color: ${priority === 'urgent' ? 'red' : 'black'}">${priority?.toUpperCase()}</span></p>
                        <p><strong>Department:</strong> ${department}</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        
                        <h3 style="margin-bottom: 10px;">User Details</h3>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                        <p><strong>Company:</strong> ${company || 'N/A'}</p>
                        
                        <h3 style="margin-bottom: 10px;">Message</h3>
                        <p><strong>Subject:</strong> ${subject}</p>
                        <div style="background-color: #f9fafb; padding: 15px; border-radius: 4px; border-left: 4px solid #1e40af;">
                            ${message.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                    <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                        This email was sent from the AeroHive Contact Form.
                    </div>
                </div>
            </body>
            </html>
        `

        const mailOptions = {
            from: `"AeroHive Contact Form" <${GMAIL_USER}>`,
            to: SUPPORT_EMAIL,
            replyTo: email,
            subject: `[Contact] ${priority?.toUpperCase()}: ${subject}`,
            html: htmlContent
        }

        await transporter.sendMail(mailOptions)

        return NextResponse.json({ success: true, message: 'Email sent successfully' })

    } catch (error: any) {
        console.error('❌ Error sending contact email:', error)
        return NextResponse.json(
            { error: 'Failed to send email', details: error.message },
            { status: 500 }
        )
    }
}
