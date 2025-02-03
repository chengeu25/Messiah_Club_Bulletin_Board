from datetime import timedelta
from flask import Flask
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
from jobs.email_notification_job import start_email_scheduler
from flask_jwt_extended import JWTManager


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

    # Start email scheduler
    start_email_scheduler()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=3000)
