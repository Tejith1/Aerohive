import os
import smtplib
from email.mime.text import MIMEText
from typing import Dict, Any

class NotificationService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_pass = os.getenv("SMTP_PASS")
        self.sms_api_key = os.getenv("SMS_API_KEY")

    def send_booking_notifications(self, booking_data: Dict[str, Any], pilot_data: Dict[str, Any], user_data: Dict[str, Any]):
        """Triggers both Email and SMS for Client and Pilot."""
        
        # 1. Notify Client
        client_email_body = f"""
        Hello {user_data.get('name')},
        
        Your drone service booking {booking_data.get('id')} is confirmed!
        Pilot: {pilot_data.get('full_name')}
        Service: {booking_data.get('service_type')}
        Date: {booking_data.get('scheduled_at')}
        
        You can track your pilot live via the AeroHive dashboard once the mission starts.
        
        Thank you,
        AeroHive Team
        """
        self._send_email(user_data.get('email'), f"Booking Confirmed: {booking_data.get('id')}", client_email_body)
        self._send_sms(user_data.get('phone'), f"AeroHive: Booking {booking_data.get('id')} confirmed with pilot {pilot_data.get('full_name')}.")

        # 2. Notify Pilot
        pilot_email_body = f"""
        Hello {pilot_data.get('full_name')},
        
        You have a new mission assignment!
        Booking ID: {booking_data.get('id')}
        Service Type: {booking_data.get('service_type')}
        Scheduled Time: {booking_data.get('scheduled_at')}
        Requirements: {booking_data.get('requirements')}
        
        Please log in to the Pilot Portal to view mission details and location.
        
        AeroHive Ops
        """
        self._send_email(pilot_data.get('email'), f"New Mission Assigned: {booking_data.get('id')}", pilot_email_body)
        self._send_sms(pilot_data.get('phone'), f"AeroHive: New mission {booking_data.get('id')} assigned to you. Check portal for details.")

    def _send_email(self, to_email: str, subject: str, body: str):
        if not all([self.smtp_user, self.smtp_pass, to_email]):
            print(f"DEBUG: Email skipped (missing credentials or recipient). To: {to_email}")
            return

        try:
            msg = MIMEText(body)
            msg['Subject'] = subject
            msg['From'] = self.smtp_user
            msg['To'] = to_email

            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_pass)
                server.send_message(msg)
            print(f"DEBUG: Email sent to {to_email}")
        except Exception as e:
            print(f"EMAIL ERROR: {e}")

    def _send_sms(self, phone: str, message: str):
        if not self.sms_api_key or not phone:
            print(f"DEBUG: SMS skipped (missing key or phone). To: {phone}, Msg: {message}")
            return
        
        # Abstraction for Twilio/Msg91/etc.
        print(f"DEBUG: SMS would be sent to {phone} via provider: {message}")

notifier = NotificationService()
