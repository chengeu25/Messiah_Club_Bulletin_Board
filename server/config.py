import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """
    Configuration class for the Messiah Club Bulletin Board application.

    This class manages environment-specific configuration settings for the application,
    loading sensitive information from environment variables and setting up
    database, upload, and email configurations.

    Attributes:
        SECRET_KEY (str): Flask secret key for session management and security.
        RECAPTCHA_SECRET_KEY (str): Secret key for reCAPTCHA verification.
        MYSQL_UNIX_SOCKET (str): Unix socket path for MySQL connection.
        MYSQL_HOST (str): Hostname for MySQL database.
        MYSQL_USER (str): Username for database authentication.
        MYSQL_PASSWORD (str): Password for database authentication.
        MYSQL_DB (str): Name of the database to connect to.
        UPLOAD_FOLDER (str): Directory path for file uploads.
        ALLOWED_EXTENSIONS (set): Set of allowed file extensions for uploads.
        SENDER_EMAIL (str): Email address used for sending system emails.
        SENDER_PASSWORD (str): Password for the sender email account.
        JWT_SECRET_KEY (str): Secret key for signing and verifying JWTs.
    """

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
    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "heic"}

    # Email configuration
    SENDER_EMAIL = os.getenv("SENDER_EMAIL")
    SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")

    # JWT configuration
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")  # Load from environment variables
    JWT_EXPIRATION = int(
        os.getenv("JWT_EXPIRATION", 3600)
    )  # Default to 3600 if not set
