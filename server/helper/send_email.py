from email.mime.text import MIMEText
import smtplib
from config import Config


def send_email(to_email, subject, body):
    sender_email = Config.SENDER_EMAIL
    sender_password = Config.SENDER_PASSWORD

    if sender_password is None or sender_email is None:
        return False

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = to_email

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, to_email, msg.as_string())
    except Exception as e:
        raise Exception(f"Failed to send email to {to_email}: {e}")
