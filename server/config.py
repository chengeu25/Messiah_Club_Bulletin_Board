import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("FLASK_SECRET_KEY")
    RECAPTCHA_SECRET_KEY = os.getenv("RECAPTCHA_SECRET_KEY")

    # MySQL configuration
    MYSQL_UNIX_SOCKET = os.getenv("MYSQL_UNIX_SOCKET")
    MYSQL_HOST = os.getenv("MYSQL_HOST")
    MYSQL_USER = os.getenv("DB_USER")
    MYSQL_PASSWORD = os.getenv("DB_PWD")
    MYSQL_DB = "sharc"

    # Upload configuration
    UPLOAD_FOLDER = "uploads/"
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

    # Email configuration
    SENDER_EMAIL = os.getenv("SENDER_EMAIL")
    SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")
