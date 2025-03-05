from datetime import datetime, timedelta, timezone
import os
from flask import Flask, redirect, session, url_for
from config import Config
from extensions import mysql, cors
from routes.auth import auth_bp
from routes.clubs import clubs_bp
from routes.events import events_bp
from routes.interests import interests_bp
from routes.rsvp import rsvp_bp
from routes.subscriptions import subscriptions_bp
from routes.admintools import admintools_bp
from routes.school import school_bp
from routes.emails import emails_bp
from routes.prefs import prefs_bp
from routes.reports import reports_bp
from jobs.email_notification_job import EmailScheduler
from flask_jwt_extended import JWTManager
from flask.signals import appcontext_tearing_down
import atexit
import signal
from flask_mysqldb import MySQLdb


def create_app(config_class=Config):
    """
    Create and configure the Flask application.
    This function initializes the Flask application with the specified configuration,
    sets up database and CORS extensions, and registers all API blueprints.
    Args:
        config_class (Config, optional): Configuration class for the application.
                                         Defaults to the Config class.
    Returns:
        Flask: A configured Flask application instance.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)

    jwt = JWTManager(app)

    # Initialize extensions
    mysql.init_app(app)

    # Access JWT_EXPIRATION in your setup
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(seconds=Config.JWT_EXPIRATION)

    def check_session_timeout():
        if "last_activity" in session:
            now = datetime.now(timezone.utc)
            last_activity = session["last_activity"]
            timeout_duration = timedelta(
                minutes=int(os.getenv("SESSION_TIMEOUT_MINUTES", 60))
            )  # Use environment variable for timeout duration

            if now - last_activity > timeout_duration:
                session.clear()  # Clear the session to log out the user
                return redirect(url_for("auth.logout"))  # Redirect to logout route

        session["last_activity"] = datetime.now(
            timezone.utc
        )  # Update last activity timestamp

    # CORS configuration
    cors.init_app(
        app,
        supports_credentials=True,
        resources={
            r"/api/*": {
                "origins": "http://localhost:5173",  # Your frontend's URL
                "supports_credentials": True,
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": [
                    "Content-Type",
                    "Authorization",
                    "Access-Control-Allow-Headers",
                    "Access-Control-Allow-Origin",
                ],
                "expose_headers": ["Set-Cookie"],
                "max_age": 600,
            }
        },
    )

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(clubs_bp, url_prefix="/api/clubs")
    app.register_blueprint(events_bp, url_prefix="/api/events")
    app.register_blueprint(interests_bp, url_prefix="/api/interests")
    app.register_blueprint(rsvp_bp, url_prefix="/api/rsvp")
    app.register_blueprint(subscriptions_bp, url_prefix="/api/subscriptions")
    app.register_blueprint(admintools_bp, url_prefix="/api/admintools")
    app.register_blueprint(school_bp, url_prefix="/api/school")
    app.register_blueprint(emails_bp, url_prefix="/api/emails")
    app.register_blueprint(prefs_bp, url_prefix="/api/prefs")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")

    # Start email scheduler
    email_scheduler = EmailScheduler()
    email_scheduler.start()

    # Handle SIGINT (Ctrl+C) to stop the scheduler gracefully
    def handle_sigint(signum, frame):
        email_scheduler.stop()
        exit(0)

    # Register the stop method to be called on program exit
    atexit.register(lambda: handle_sigint(None, None))

    signal.signal(signal.SIGINT, handle_sigint)

    @app.before_request
    def before_request():
        check_session_timeout()

    @appcontext_tearing_down.connect_via(app)
    def close_mysql_connection(sender, **extra):
        try:
            if mysql.connection:
                mysql.connection.close()
        except MySQLdb.OperationalError:
            pass

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=3000)
