from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
from config import Config


def send_email(to_email, subject, body, html=False):
    """
    Send an email using the configured Gmail SMTP server.

    This function sends an email from the predefined sender email to the specified recipient.
    It uses the SMTP protocol with TLS encryption to send emails via Gmail's SMTP server.

    Args:
        to_email (str | list): The email address(es) of the recipient.
        subject (str): The subject line of the email.
        body (str): The plain text content of the email.

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

    msg = MIMEMultipart()
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = to_email

    msg.attach(MIMEText(body, "html" if html else "plain"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, to_email, msg.as_string())
    except Exception as e:
        raise Exception(f"Failed to send email to {to_email}: {e}")
