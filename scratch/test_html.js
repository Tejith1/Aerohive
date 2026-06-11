const fs = require('fs');

const d = {
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
    estimatedAmount: '₹3,500',
    chargesNote: 'Final charges based on actual duration.',
    requirements: 'Survey requirement notes.'
};

function generateEmailHtml(type, d) {
    if (!d) return ''

    const isPilot = type === 'pilot'
    const bgColor = isPilot ? '#0f172a' : '#f8fafc'
    const accentColor = isPilot ? '#3b82f6' : '#2563eb'
    const title = isPilot ? 'NEW BOOKING REQUEST' : 'BOOKING CONFIRMED'
    const subtitle = isPilot
        ? 'A new drone booking request needs your confirmation.'
        : 'Your booking is placed! Waiting for pilot confirmation.'
    const headerTextColor = isPilot ? '#ffffff' : '#0f172a'
    const subtitleTextColor = isPilot ? '#94a3b8' : '#475569'
    const badgeBg = isPilot ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.05)'
    const badgeText = isPilot ? '#94a3b8' : '#475569'
    const badgeBorder = isPilot ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.1)'

    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AeroHive - ${title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding-bottom: 40px; }
        .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; color: #1e293b; border-radius: 24px; overflow: hidden; margin-top: 40px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
        .header { background-color: ${bgColor}; padding: 48px 40px; text-align: center; }
        .badge { display: inline-block; padding: 6px 12px; background-color: ${badgeBg}; border-radius: 100px; color: ${badgeText}; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; margin-bottom: 16px; border: 1px solid ${badgeBorder}; }
        .header h1 { color: ${headerTextColor}; font-size: 32px; font-weight: 800; margin: 0; letter-spacing: -0.025em; line-height: 1.1; }
        .header p { color: ${subtitleTextColor}; font-size: 16px; margin-top: 12px; margin-bottom: 0; }
        .content { padding: 48px 40px; }
        .grid-row { display: flex; flex-wrap: wrap; margin-bottom: 32px; gap: 24px; }
        .grid-item { flex: 1; min-width: 200px; }
        .label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
        .value { font-size: 16px; font-weight: 600; color: #1e293b; }
        .highlight-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px; margin-bottom: 32px; }
        .otp-display { text-align: center; background: linear-gradient(135deg, ${accentColor}, #1d4ed8); border-radius: 16px; padding: 24px; color: white; margin-bottom: 32px; }
        .otp-display span { font-size: 48px; font-weight: 800; letter-spacing: 0.1em; display: block; margin-bottom: 4px; }
        .otp-display p { font-size: 12px; font-weight: 600; opacity: 0.8; margin: 0; text-transform: uppercase; }
        .btn-container { text-align: center; padding-bottom: 48px; }
        .btn { display: inline-block; background-color: ${accentColor}; color: #ffffff !important; padding: 18px 36px; border-radius: 16px; text-decoration: none; font-weight: 700; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(37,99,235,0.3); }
        .footer { padding: 40px; text-align: center; color: #64748b; font-size: 14px; }
        .footer b { color: #1e293b; }
    </style>
</head>
<body>
    <div class="wrapper">
        <table class="main">
            <tr>
                <td class="header">
                    <div class="badge">AEROHIVE MISSION CONTROL</div>
                    <h1>${title}</h1>
                    <p>${subtitle}</p>
                </td>
            </tr>
            <tr>
                <td class="content">
                    <div class="grid-row">
                        <div class="grid-item">
                            <div class="label">Booking ID</div>
                            <div class="value">${d.bookingId}</div>
                        </div>
                        <div class="grid-item">
                            <div class="label">Service Type</div>
                            <div class="value">${d.serviceType}</div>
                        </div>
                    </div>

                    <div class="grid-row">
                        <div class="grid-item">
                            <div class="label">Date &amp; Time</div>
                            <div class="value">${d.scheduledAt}</div>
                        </div>
                        <div class="grid-item">
                            <div class="label">Location</div>
                            <div class="value">${d.location}</div>
                        </div>
                    </div>

                    ${isPilot ? `
                    <div class="grid-row">
                        <div class="grid-item">
                            <div class="label">Client Name</div>
                            <div class="value">${d.clientName || 'N/A'}</div>
                        </div>
                        <div class="grid-item">
                            <div class="label">Client Phone</div>
                            <div class="value">${d.clientPhone || 'N/A'}</div>
                        </div>
                    </div>
                    ` : `
                    <div class="grid-row">
                        <div class="grid-item">
                            <div class="label">Pilot Name</div>
                            <div class="value">${d.pilotName || 'N/A'}</div>
                        </div>
                        <div class="grid-item">
                            <div class="label">Pilot Phone</div>
                            <div class="value">${d.pilotPhone || 'N/A'}</div>
                        </div>
                    </div>
                    `}

                    <div class="highlight-box">
                        <div class="label">${isPilot ? 'Mission Notes' : 'Estimated Charges'}</div>
                        <div class="value" style="color: ${accentColor}; font-size: 20px;">
                            ${isPilot ? (d.requirements || 'No special requirements.') : (d.estimatedAmount || 'Contact for Quote')}
                        </div>
                        <p style="font-size: 12px; color: #64748b; margin-top: 8px; margin-bottom: 0;">${d.chargesNote || ''}</p>
                    </div>

                    ${!isPilot ? `
                    <div class="otp-display">
                        <span>${d.otp}</span>
                        <p>SECURITY VERIFICATION OTP</p>
                    </div>
                    <div style="text-align: center; font-size: 13px; color: #64748b; margin-bottom: 24px;">
                        Share this OTP with the pilot <strong>only upon arrival</strong> to verify identity.
                    </div>
                    ` : `
                    <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 16px; padding: 20px; margin-bottom: 24px; text-align: center;">
                        <div style="font-size: 14px; font-weight: 700; color: #92400e; margin-bottom: 6px;">ACTION REQUIRED</div>
                        <div style="font-size: 13px; color: #78350f;">Log in to your <strong>Pilot Panel</strong> to Accept or Reject this booking.<br/>After accepting, you will need to collect the client's 4-digit OTP to verify and start the service.</div>
                    </div>
                    `}

                    <div class="btn-container">
                        <a href="${isPilot ? d.acceptJobLink : d.trackingLink}" class="btn">
                            ${isPilot ? 'Open Pilot Panel' : 'Track Booking Status'}
                        </a>
                    </div>
                </td>
            </tr>
            <tr>
                <td class="footer">
                    Sent via <b>AeroHive Network</b> &bull; Secure Drone Services<br>
                    Need help? Contact <a href="mailto:aerohive.help@gmail.com" style="color: ${accentColor};">AeroHive Support</a>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>`
}

console.log('Generating Client Email HTML...');
const html = generateEmailHtml('client', d);
console.log('Client Email generated successfully. Length:', html.length);

console.log('Generating Pilot Email HTML...');
const html2 = generateEmailHtml('pilot', d);
console.log('Pilot Email generated successfully. Length:', html2.length);
