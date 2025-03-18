from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
import os
from config import Config
from bs4 import BeautifulSoup

# Hardcoded logo path and email template
LOGO_PATH = os.path.join(os.path.dirname(__file__), "..", "assets", "logo.png")


def send_email(to_email, subject, body, html=False):
    """
    Send an email using the configured Gmail SMTP server.

    This function sends an email from the predefined sender email to the specified recipient.
    It uses the SMTP protocol with TLS encryption to send emails via Gmail's SMTP server.

    Args:
        to_email (str | list): The email address(es) of the recipient.
        subject (str): The subject line of the email.
        body (str): The plain text content of the email.
        html (bool, optional): Whether the body is already in HTML format. Defaults to False.

    Returns:
        None

    Raises:
        Exception: If the email fails to send, with details about the failure.

    Note:
        - Requires SENDER_EMAIL and SENDER_PASSWORD to be set in the Config.
        - Uses Gmail's SMTP server (smtp.gmail.com) on port 587.
        - Requires a valid Gmail account with less secure app access or an app password.
    """
    sender_email = Config.SENDER_EMAIL
    sender_password = Config.SENDER_PASSWORD

    if isinstance(to_email, list):
        to_email = ", ".join(to_email)

    if sender_password is None or sender_email is None:
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = to_email

    msg.add_header(
        "List-Unsubscribe", f"<{Config.API_URL_ROOT}/dashboard/emailPreferences>"
    )

    # Email template with blue bar, logo, and light gray background
    email_template = f"""
    <html>
        <body>
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0f0f0; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #172554; color: white; padding: 15px; display: flex; align-items: center;">
                    <img src="{Config.API_URL_ROOT}/logo.png" alt="Logo" style="max-height: 50px; margin-right: 15px;">
                    <h1 style="margin: 0; font-size: 18px;">{subject}</h1>
                </div>
                <div style="padding: 20px; background-color: white; border-radius: 0 0 8px 8px;">
                    {body if html else body.replace(chr(10), '<br>')}<br><br>
                    To manage email preferences or unsubscribe, click <a href="{Config.API_URL_ROOT}/dashboard/emailPreferences">here</a>.
                </div>
            </div>
        </body>
    </html>
    """

    # Attach message parts
    html_part = MIMEText(email_template, "html")
    soup = BeautifulSoup(body, "html.parser")
    plain_text = soup.get_text()
    text_part = MIMEText(plain_text, "plain")
    msg.attach(text_part)
    msg.attach(html_part)

    try:
        with smtplib.SMTP_SSL("smtp.hostinger.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, to_email.split(","), msg.as_string())
    except Exception as e:
        raise Exception(f"Failed to send email to {to_email}: {e}")
