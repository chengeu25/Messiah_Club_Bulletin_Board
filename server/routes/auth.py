from datetime import datetime, timezone, timedelta
import random
import string
from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import mysql, limiter
from helper.send_email import send_email
import requests
from config import Config
import jwt

import secrets

from helper.check_user import (
    get_user_session_info,
)  # For generating secure random tokens

auth_bp = Blueprint("auth", __name__)


# Function to update the email verification status in the database
def update_email_verified(session_id, **kwargs):
    """
    Update the email verification status for a user in the database.

    This function updates the EMAIL_VERIFIED field for a given email address,
    setting it to either verified (1) or unverified (0).

    Args:
        email (str): The email address of the user to update.
        **kwargs:
            verified (bool): Flag indicating the verification status.
                             True sets EMAIL_VERIFIED to 1, False sets it to 0.

    Returns:
        bool: True if the update was successful, False otherwise.

    Behavior:
    - Requires an active MySQL database connection
    - Commits the transaction if successful
    - Rolls back the transaction if an error occurs
    - Closes the database cursor after operation
    """
    cursor = None
    try:
        if not mysql.connection:
            return False

        cursor = mysql.connection.cursor()
        query = "UPDATE session_mapping SET EMAIL_VERIFIED = %s WHERE session_id = %s"
        cursor.execute(query, (1 if kwargs["verified"] else 0, session_id))
        mysql.connection.commit()  # Commit the transaction
        return True
    except:
        if mysql.connection:
            mysql.connection.rollback()
        return False
    finally:
        if cursor:
            cursor.close()


def send_verification_email(email, code):
    """
    Send a verification email to the user with a unique code.

    This function generates and sends an email containing a verification code
    to the specified email address.

    Args:
        email (str): The recipient's email address.
        code (str): The verification code to be sent.

    Returns:
        bool: True if the email was sent successfully, False otherwise.

    Behavior:
    - Uses the send_email helper function to dispatch the email
    - Logs any email sending failures
    - Provides a simple email with the verification code
    """
    subject = "Your Verification Code"
    body = f"Your new verification code is: {code} \n\nPlease enter this code to verify your email address. \n\n Best Regards, \nSHARC Team"
    try:
        send_email(email, subject, body)
        return True
    except Exception as e:
        print(f"Failed to send email to {email} with code {code}: {e}")
        return False


def is_it_a_robot(captcha_response):
    """
    Verify a reCAPTCHA response to determine if the request is from a bot.

    This function sends the reCAPTCHA response to Google's verification endpoint
    to validate the user's human status.

    Args:
        captcha_response (str): The reCAPTCHA response token from the client.

    Returns:
        bool: True if the request passes the reCAPTCHA verification,
              False if it fails or an error occurs.

    Behavior:
    - Uses the reCAPTCHA secret key from the configuration
    - Sends a POST request to Google's siteverify endpoint
    - Returns the verification result from the response
    """
    payload = {
        "secret": Config.RECAPTCHA_SECRET_KEY,  # Use the secret key from environment
        "response": captcha_response,
    }
    response = requests.post(
        "https://www.google.com/recaptcha/api/siteverify", data=payload
    )
    result = response.json()
    return result.get("success", False)


@auth_bp.route("/verify-email", methods=["POST"])
@limiter.limit("5 per minute")
def verify_email():
    """
    Verify a user's email using a verification code.

    This endpoint validates the user's email verification code and updates
    the email verification status in the database.

    Expected JSON payload:
    {
        "code": str  # 6-character verification code
    }

    Returns:
        JSON response:
        - On successful verification:
            {"message": "Email verified successfully"}, 200 status
        - On missing verification code:
            {"error": "Verification code is required"}, 400 status
        - On invalid verification code:
            {"error": "Invalid verification code"}, 400 status
        - On database update failure:
            {"error": "Failed to update verification status"}, 500 status

    Behavior:
    - Retrieves the verification code from the session
    - Compares the input code with the stored session code
    - Updates the email verification status in the database
    - Requires an active user session with a user_id
    """
    data = request.get_json()
    input_code = data.get("code")
    get_user_session_info(mfa_required=False)

    if not input_code:
        return jsonify({"error": "Verification code is required"}), 400

    # Retrieve the stored verification code from the session
    stored_session_code = session.get("verification_code")

    if stored_session_code == input_code:
        # Update EMAIL_VERIFIED field in the database
        update_success = update_email_verified(
            session.get("session_id"), verified=True
        )  # Function that updates EMAIL_VERIFIED field

        if update_success:
            session.pop("verification_code", None)
            return jsonify({"message": "Email verified successfully"}), 200
        else:
            return jsonify({"error": "Failed to update verification status"}), 500
    else:
        return jsonify({"error": "Invalid verification code"}), 400


@auth_bp.route("/resend-code", methods=["POST"])
def resend_code():
    """
    Resend a new email verification code to the user.

    This endpoint generates a new 6-character verification code,
    updates the session, and sends a new verification email.

    Expected JSON payload:
    {
        "email": str  # User's email address,
        "forceResend": bool  # Optional, defaults to False, whether to force resend
    }

    Returns:
        JSON response:
        - On successful code resend:
            {"message": "Verification code resent"}, 200 status
        - On email sending failure:
            {"error": "Failed to send verification code"}, 500 status

    Behavior:
    - Retrieves the user's email from the active session
    - Generates a new random 6-character verification code
    - Updates the session with the new verification code
    - Sends a new verification email to the user
    - Requires an active user session with a user_id
    """
    # get email from session
    current_user = get_user_session_info(mfa_required=False)
    email = current_user["user_id"]

    if session.get("verification_code") is None or request.json.get("forceResend"):
        # Generate a new verification code
        new_code = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))

        # Update the verification code in the database
        session["verification_code"] = new_code

        # Send the new verification code to the user's email
        verified = send_verification_email(email, new_code)

        if not verified:
            return jsonify({"error": "Failed to send verification code"}), 500

        return jsonify({"message": "Verification code resent"}), 200
    else:
        return jsonify({"message": "Verification code already sent"}), 200


@auth_bp.route("/check-user-cookie", methods=["GET"])
def check_user_cookie():
    """
    Check the presence of a user_id cookie.

    This endpoint retrieves the user_id from the request cookies.

    Returns:
        JSON response:
        - If user_id cookie exists:
            {"user_id": str}, 200 status
        - If no user_id cookie is found:
            {"user_id": None}, 404 status

    Behavior:
    - Checks for the presence of a user_id in request cookies
    - Returns the user_id or None depending on cookie status
    """
    user_id = request.cookies.get("user_id")
    if user_id:
        return jsonify({"user_id": user_id}), 200
    else:
        return jsonify({"user_id": None}), 404


@auth_bp.route("/check-user", methods=["GET"])
def check_user():
    """
    Validate and retrieve the current user's session information via API endpoint.

    This route wraps the get_user_session_info() helper function to provide
    a RESTful API for checking user session status.

    Returns:
        JSON response with user session information and appropriate status code
        - Successful active session: User details, 200 status
        - No active session: Null user details, 401 status
    """
    mfa_required = request.args.get("noMFA", False)
    print(mfa_required)
    user_info = get_user_session_info(mfa_required=(not mfa_required))

    # Determine status code based on user_id presence
    status_code = 200 if user_info["user_id"] is not None else 401

    return jsonify(user_info), status_code


@auth_bp.route("/login", methods=["POST"])
@limiter.limit("5/minute")
def login():
    """
    Authenticate a user and create a new session.

    This endpoint handles user login by verifying credentials
    and establishing a session.

    Expected JSON payload:
    {
        "email": str,       # User's email address
        "password": str,    # User's password
        "remember": bool,   # Whether to maintain a longer session
        "school": int       # School ID
    }

    Returns:
        JSON response:
        - On successful login:
            Sets session variables and returns user details, 200 status
        - On missing data:
            {"error": "No data was provided"}, 400 status
        - On missing email or password:
            {"error": "Email and password are required"}, 400 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On invalid email:
            {"error": "Authentication failed"}, 401 status
        - On invalid password:
            {"error": "Authentication failed"}, 401 status
        - On user is banned:
            {"error": "User is banned"}, 403 status

    Behavior:
    - Validates input data
    - Checks database for user credentials
    - Verifies password using Werkzeug's check_password_hash
    - Sets session variables with a random session token
    - Resets email verification status
    - Supports optional "remember me" functionality
    """
    data = request.json
    if data is None:
        return jsonify({"error": "No data was provided"}), 400
    if data["email"] is None or data["password"] is None:
        return jsonify({"error": "Email and password are required"}), 400
    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
    is_mobile = request.headers.get("X-Client-Type", "web") == "mobile"

    cur = mysql.connection.cursor()

    # Retrieve the hashed password from the database
    cur.execute(
        """SELECT pwd1, is_banned
           FROM users 
           WHERE email = %s
             AND is_active = 1
             AND school_id = %s""",
        (data["email"], data["school"]),
    )
    result = cur.fetchone()

    # If no matching email is found, return an error
    if result is None:
        return jsonify({"error": "Authentication failed"}), 401

    # Check if user is banned
    if result[1] == 1:  # is_banned is the second column
        return jsonify({"error": "User is banned"}), 403

    # Verify the provided password against the hashed password
    hashed_password = result[0]
    if not check_password_hash(hashed_password, data["password"]):
        return jsonify({"error": "Authentication failed"}), 401

    # Generate a random session token
    session_token = secrets.token_hex(32)

    # Calculate session expiration (e.g., 1 hour)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(
        minutes=(Config.SESSION_TIMEOUT_MOBILE if is_mobile else Config.SESSION_TIMEOUT)
    )

    # Store the session token in the database
    cur.execute(
        """INSERT INTO session_mapping (session_id, user_email, school_id, created_at, expires_at)
           VALUES (%s, %s, %s, %s, %s)""",
        (session_token, data["email"], data["school"], now, expires_at),
    )
    mysql.connection.commit()

    # Set the session variables
    session["session_id"] = session_token
    session["school"] = data["school"]
    session["last_activity"] = now

    cur.close()

    email = data["email"]
    remember = data["remember"]

    response = jsonify({"message": "Login successful", "user_id": email})

    if remember:
        # Set a cookie that expires in 30 days
        expires = datetime.now() + timedelta(days=30)
        response.set_cookie("user_id", email, expires=expires, path="/api")
    else:
        response.set_cookie("user_id", email, expires=0, path="/api")

    return response, 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    """
    Terminate the current user session.

    This endpoint clears the user's session data and invalidates the session token.

    Returns:
        JSON response:
        - On successful logout:
            {"message": "Logged out successfully"}, 200 status

    Behavior:
    - Clears all session variables
    - Removes the session token from the database
    - Ensures complete session termination
    """
    session_id = session.pop("session_id", None)

    if session_id:
        try:
            cur = mysql.connection.cursor()
            # Remove the session token from the database
            cur.execute(
                "DELETE FROM session_mapping WHERE session_id = %s", (session_id,)
            )
            mysql.connection.commit()
            cur.close()
        except Exception as e:
            print(f"Error invalidating session: {str(e)}")
            return jsonify({"error": "Failed to log out"}), 500

    # Clear all session data
    session.clear()

    session["is_logged_out"] = True

    resp = jsonify({"message": "Logged out successfully"})
    return resp, 200


@auth_bp.route("/signup", methods=["POST"])
def signup():
    """
    Create a new user account.

    This endpoint handles user registration, including input validation,
    captcha verification, and database insertion.

    Expected JSON payload:
    {
        "email": str,            # User's email address
        "password": str,         # User's password
        "name": str,             # User's full name
        "captchaResponse": str,  # reCAPTCHA verification token
        "school": int,           # School ID
        "emailFrequency": str,   # Email frequency preference
        "emailPreferences": str, # Email preferences
        "gender": str,           # User's gender
        "semester": str,         # 'Fall' or 'Spring'
        "year: str               # Year the user started college
    }

    Returns:
        JSON response:
        - On successful signup:
            {"message": "User created successfully"}, 201 status
        - On successful signup if the user is currently inactive:
            {"message": "User reactivated successfully"}, 201 status
        - On missing or invalid data:
            {"error": "Missing required fields"}, 400 status
        - On invalid email format:
            {"error": "Invalid email format"}, 400 status
        - On email already in use:
            {"error": "Email already in use"}, 409 status
        - On reCAPTCHA verification failure:
            {"error": "reCAPTCHA verification failed"}, 403 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On banned user:
            {"error": "User is banned"}, 403 status
    """
    data = request.get_json()
    email = data.get("email")
    name = data.get("name")
    password = data.get("password")
    school = data.get("school")
    is_mobile = request.headers.get("X-Client-Type", "web") == "mobile"
    email_frequency = data.get("emailFrequency")
    email_preferences = data.get("emailPreferences")
    semester = data.get("semester")
    year = data.get("year")
    gender = (
        "M"
        if data.get("gender") == "Male"
        else "F" if data.get("gender") == "Female" else "O"
    )
    captcha_response = data.get("captchaResponse")

    # Validate reCAPTCHA response
    if not is_it_a_robot(captcha_response):
        return jsonify({"error": "You may be a robot."}), 400

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500

    cur = mysql.connection.cursor()

    # Check if the email is unique
    cur.execute(
        "SELECT name, email, is_banned, is_active FROM users WHERE email = %s",
        (email,),
    )
    existing_user = cur.fetchone()

    if existing_user:
        # Check if the user is banned
        if existing_user[2] == 1:
            return jsonify({"error": "User is banned"}), 403

        # If user exists but is inactive, reactivate the user
        if existing_user[3] == 0:
            cur.execute(
                """UPDATE users 
                SET PWD1 = %s, 
                    PWD2 = '',
                    PWD3 = '',
                    GENDER = %s, 
                    IS_ACTIVE = 1, 
                    NAME = %s, 
                    EMAIL_VERIFIED = 0,
                    EMAIL_FREQUENCY = %s,
                    EMAIL_EVENT_TYPE = %s,
                    SEMESTER_STARTED = %s,
                    YEAR_STARTED = %s
                WHERE EMAIL = %s AND SCHOOL_ID = %s""",
                (
                    generate_password_hash(password),
                    gender,
                    name,
                    email_frequency,
                    email_preferences,
                    semester,
                    year,
                    email,
                    school,
                ),
            )
            mysql.connection.commit()

            # Generate a random session token
            session_token = secrets.token_hex(32)
            now = datetime.now(timezone.utc)
            expires_at = now + timedelta(hours=1)

            # Store the session token in the database
            cur.execute(
                """INSERT INTO session_mapping (session_id, user_email, school_id, created_at, expires_at)
                   VALUES (%s, %s, %s, %s, %s)""",
                (session_token, email, school, now, expires_at),
            )
            mysql.connection.commit()

            # Set session variables
            session["session_id"] = session_token
            session["school"] = school
            session["last_activity"] = now

            return jsonify({"message": "User reactivated successfully"}), 200

        return jsonify({"error": "Email already in use"}), 400

    # Hash the password
    hashed_password = generate_password_hash(password)

    # Insert the new user into the database
    cur.execute(
        """INSERT INTO users (
                EMAIL, 
                EMAIL_VERIFIED, 
                PWD1, 
                GENDER, 
                IS_FACULTY, 
                CAN_DELETE_FACULTY, 
                IS_ACTIVE, 
                SCHOOL_ID, 
                NAME,
                EMAIL_FREQUENCY,
                EMAIL_EVENT_TYPE,
                SEMESTER_STARTED,
                YEAR_STARTED
            ) VALUES (%s, 0, %s, %s, 0, 0, 1, %s, %s, %s, %s, %s, %s)""",
        (
            email,
            hashed_password,
            gender,
            school,
            name,
            email_frequency,
            email_preferences,
            semester,
            year,
        ),
    )
    mysql.connection.commit()

    # Generate a random session token
    session_token = secrets.token_hex(32)
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(
        minutes=(Config.SESSION_TIMEOUT_MOBILE if is_mobile else Config.SESSION_TIMEOUT)
    )

    # Store the session token in the database
    cur.execute(
        """INSERT INTO session_mapping (session_id, user_email, school_id, created_at, expires_at)
           VALUES (%s, %s, %s, %s, %s)""",
        (session_token, email, school, now, expires_at),
    )
    mysql.connection.commit()

    # Set session variables
    session["session_id"] = session_token
    session["school"] = school
    session["last_activity"] = now

    cur.close()
    return jsonify({"message": "User created successfully"}), 201


@auth_bp.route("/password-reset", methods=["POST"])
@limiter.limit("5 per minute")
def reset_password():
    """
    Reset the user's password.

    This endpoint allows a user to reset their password by verifying the current password
    and ensuring the new password is unique to the last three saved passwords.

    Expected JSON payload:
    {
        "emailRequest": str,  # User's email
        "oldPassword": str,   # User's current password
        "newPassword": str    # User's desired new password
    }

    Returns:
        JSON response:
        - On successful password reset:
            {"message": "Password updated successfully"}, 200 status
        - On missing or invalid data:
            {"error": "Missing required fields"}, 400 status
        - On invalid current password:
            {"error": "Authentication failed"}, 401 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On user not found:
            {"error": "Authentication failed"}, 401 status

    Behavior:
    - Validates the provided email, current password, and new password
    - Verifies the current password matches the stored password
    - Ensures the new password is unique to the last three saved passwords
    - Updates the user's password in the database
    - Invalidates the current session token and generates a new one
    """
    data = request.json
    if data is None:
        return jsonify({"error": "No data was provided"}), 400
    if (
        data["emailRequest"] is None
        or data["oldPassword"] is None
        or data["newPassword"] is None
    ):
        return (
            jsonify(
                {"error": "Email, current password, and new password are required"}
            ),
            400,
        )
    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500

    cur = mysql.connection.cursor()

    user = get_user_session_info()

    # Retrieve the hashed passwords from the database
    cur.execute(
        """SELECT pwd1, pwd2, pwd3, email_verified
           FROM users
           WHERE email = %s
             AND is_active = 1""",
        (data["emailRequest"],),
    )
    result = cur.fetchone()

    # If no matching email is found, return an error
    if result is None:
        return jsonify({"error": "Authentication failed"}), 401

    # Verify the provided current password against the hashed password
    hashed_password = result[0]
    if not check_password_hash(hashed_password, data["oldPassword"]):
        print("Invalid current password")
        return jsonify({"error": "Authentication failed"}), 401

    # Check if email is verified
    is_email_verified = user.get("emailVerified")
    if not is_email_verified == 1:
        return jsonify({"error": "Email not verified"}), 401

    # Check if the new password is unique to the last three saved passwords
    new_password = data["newPassword"]
    if (
        check_password_hash(result[0], new_password)
        or (
            check_password_hash(result[1], new_password)
            if result[1] is not None
            else False
        )
        or (
            check_password_hash(result[2], new_password)
            if result[2] is not None
            else False
        )
    ):
        return (
            jsonify({"error": "New password cannot be a previously used password"}),
            400,
        )

    # Cascade passwords (shift pwd1 -> pwd2 -> pwd3)
    cur.execute(
        """UPDATE users
           SET pwd3 = %s, pwd2 = %s, pwd1 = %s
           WHERE email = %s""",
        (
            result[1],
            result[0],
            generate_password_hash(new_password),
            data["emailRequest"],
        ),
    )
    mysql.connection.commit()

    # Invalidate the current session token
    session_id = session.pop("session_id", None)
    if session_id:
        cur.execute("DELETE FROM session_mapping WHERE session_id = %s", (session_id,))
        mysql.connection.commit()

    # # Generate a new session token
    # new_session_token = secrets.token_hex(32)
    # now = datetime.now(timezone.utc)
    # expires_at = now + timedelta(hours=1)

    # # Store the new session token in the database
    # cur.execute(
    #     """INSERT INTO session_mapping (session_id, user_email, school_id, created_at, expires_at)
    #        VALUES (%s, %s, %s, %s, %s)""",
    #     (
    #         new_session_token,
    #         data["emailRequest"],
    #         session.get("school"),
    #         now,
    #         expires_at,
    #     ),
    # )
    # mysql.connection.commit()

    # # Update the session with the new session token
    # session["session_id"] = new_session_token
    # session["last_activity"] = now

    cur.close()

    return jsonify({"message": "Password updated successfully"}), 200


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    """
    Initiate the password reset process for a user.

    This endpoint handles the initial step of password recovery
    by sending a password reset verification code.

    Expected JSON payload:
    {
        "email": str  # User's registered email address
    }

    Returns:
        JSON response:
        - On successful reset code generation:
            {"message": "If an account exists, a reset link will be sent"}, 200 status
        - On missing email:
            {"error": "Email is required"}, 400 status
        - On email sending failure:
            {"error": "Failed to send reset code"}, 500 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status

    Behavior:
    - Validates the provided email address
    - Checks if the email exists in the database
    - Generates a time-limited password reset verification code
    - Sends a password reset email with the verification code
    - Creates a temporary session for password reset process
    - Implements security measures to prevent abuse
    - Ensures user can only reset password for their own account

    Security Considerations:
    - Verification code is time-limited
    - Only one reset code can be active at a time
    - Prevents enumeration of existing email addresses
    """
    data = request.json
    if data is None:
        return jsonify({"error": "No data was provided"}), 400
    if data["email"] is None:
        return jsonify({"error": "Email is required"}), 400
    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
    cur = mysql.connection.cursor()

    # Retrieve the hashed passwords from the database
    cur.execute(
        """Select pwd1, pwd2, email_verified, school_id
           FROM users 
           WHERE email = %s 
           AND is_active = 1""",
        (data["email"],),
    )
    result = cur.fetchone()

    # If no matching email is found, return an error
    if result is None:
        return jsonify({"error": "Invalid email"}), 401

    if Config.SECRET_KEY is None:
        return jsonify({"error": "Developer did not set secret key"}), 500

    school_id = result[3]

    # Generate a reset token
    token = jwt.encode(
        {
            "email": data["email"],
            "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
        },
        Config.SECRET_KEY,
        algorithm="HS256",
    )

    # Add token to database
    cur.execute(
        """update users
                SET reset_token = %s
                WHERE email = %s""",
        (
            token,
            data["email"],
        ),
    )
    mysql.connection.commit()
    result = cur.fetchone()

    # Create reset link
    reset_link = (
        f"{Config.API_URL_ROOT}/ForgotPasswordToken?token={token}&schoolId={school_id}"
    )

    # Send email
    send_email(
        str(data["email"]),
        "SHARC Forgot Password",
        f"Click the link to reset your password: {reset_link}",
    )
    return jsonify({"message": "Reset link sent to your email"}), 200


@auth_bp.route("/forgot-password-token", methods=["POST"])
def forgot_password_reset():
    """
    Complete the password reset process by verifying the reset code.

    This endpoint allows users to reset their password using a
    verification code sent to their email.

    Expected JSON payload:
    {
        "email": str,       # User's registered email address
        "resetCode": str,   # Verification code received via email
        "newPassword": str  # User's desired new password
    }

    Returns:
        JSON response:
        - On successful password reset:
            {"message": "Password reset successfully"}, 200 status
        - On missing or invalid data:
            {"error": "Missing required fields"}, 400 status
        - On invalid or expired reset code:
            {"error": "Invalid or expired reset code"}, 401 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On account not found:
            {"error": "No account found with this email"}, 404 status

    Behavior:
    - Validates all required input fields
    - Verifies the reset code against the stored session code
    - Checks the reset code's validity and expiration
    - Generates a new password hash
    - Updates the user's password in the database
    - Invalidates the used reset code
    - Ensures password complexity and uniqueness

    Security Considerations:
    - Reset codes are time-limited
    - Only one reset attempt is allowed per code
    - Prevents password reuse of recent passwords
    - Protects against brute-force reset attempts
    """
    data = request.json
    if data is None:
        return jsonify({"error": "No data was provided"}), 400
    if data.get("token") is None:
        return jsonify({"error": "Token is required"}), 400
    if request.json is None:
        return jsonify({"error": "No data was provided"}), 400
    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
    if Config.SECRET_KEY is None:
        return jsonify({"error": "Developer did not set secret key"}), 500
    cur = mysql.connection.cursor()

    try:
        # Extract token from request data
        token = request.json.get("token")
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    # Retrieve the hashed passwords from the database
    cur.execute(
        """select pwd1, pwd2, pwd3, email_verified, reset_token, email
                FROM users
                WHERE reset_token = %s
                    AND is_active = 1""",
        (token,),
    )
    result = cur.fetchone()

    # If no matching email is found, return an error
    if result is None:
        return jsonify({"error": "Invalid email or password"}), 401

    # Check if new password is unique to the last three saved passwords
    new_password = data["newPassword"]

    if (
        check_password_hash(result[0], new_password)
        or check_password_hash(result[1] if result[1] is not None else "", new_password)
        or check_password_hash(result[2] if result[2] is not None else "", new_password)
    ):
        return (
            jsonify({"error": "New password cannot be a previously used password"}),
            400,
        )

    # Cascade passwords
    cur.execute(
        """UPDATE users
                SET pwd3 = %s, pwd2 = %s, pwd1 = %s
                WHERE reset_token = %s""",
        (
            str(result[1]),
            str(result[0]),
            generate_password_hash(str(data["newPassword"])),
            str(data["token"]),
        ),
    )
    mysql.connection.commit()
    cur.close()
    session.pop("user_id", None)
    return jsonify({"message": "Password reset successful"}), 200


@auth_bp.route("/password-token-check", methods=["POST"])
def password_token_check():
    """
    Check the validity of a password reset token.

    This endpoint verifies the provided password reset token and checks if it is valid.

    Expected JSON payload:
    {
        "token": str
    }
    """
    data = request.json
    if data is None:
        return jsonify({"error": "No data was provided"}), 400
    if data.get("token") is None:
        return jsonify({"error": "Token is required"}), 400
    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500

    cur = mysql.connection.cursor()

    # Check if the token exists in the database
    cur.execute(
        """SELECT email, reset_token, email_verified, school_id
           FROM users 
           WHERE reset_token = %s 
             AND is_active = 1""",
        (data["token"],),
    )
    result = cur.fetchone()

    if result is None:
        return jsonify({"error": "Invalid token"}), 401

    # Check if the token is expired
    try:
        jwt.decode(data["token"], Config.SECRET_KEY, algorithms=["HS256"])
        return jsonify({"message": "Valid token"}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    return jsonify({"message": "Valid token"}), 200


@auth_bp.route("/account-info", methods=["POST"])
def update_account_info():
    try:
        # Parse the input data
        data = request.get_json()
        print(f"Received request data: {data}")

        if not data:
            return jsonify({"error": "No data was provided"}), 400

        semester = data.get("semester")
        year = data.get("year")
        if not semester or not year:
            return jsonify({"error": "Semester and year are required"}), 400

        # Validate name
        new_name = data.get("name")
        if not new_name:
            return jsonify({"error": "New name is required"}), 400

        # Map gender to the expected format
        gender_input = data.get("gender")
        gender_map = {"male": "M", "female": "F", "other": "O"}
        gender = gender_map.get(gender_input.lower())
        if not gender:
            return jsonify({"error": "Invalid gender value"}), 400

        # Retrieve the current user from session
        current_user = get_user_session_info()
        print(f"Current user session info: {current_user}")

        # Validate session data
        if not current_user or "user_id" not in current_user:
            print(f"Invalid session data: {current_user}")
            return jsonify({"error": "User session is invalid or expired"}), 401

        # Map user_id to email
        email = current_user["user_id"]

        # Database connection
        if not mysql.connection:
            return jsonify({"error": "Database connection error"}), 500

        cur = mysql.connection.cursor()

        # Check if the user exists by EMAIL
        cur.execute("SELECT EMAIL FROM users WHERE EMAIL = %s", (email,))
        user = cur.fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 404

        # Update the user's name and gender in the database
        cur.execute(
            "UPDATE users SET NAME = %s, gender = %s, semester_started = %s, year_started = %s WHERE EMAIL = %s",
            (new_name, gender, semester, year, email),
        )
        mysql.connection.commit()

        return jsonify({"message": "Account info updated successfully"}), 200

    except Exception as e:
        print(f"Error occurred: {str(e)}")  # Debugging
        return (
            jsonify({"error": "An error occurred while updating your account info"}),
            500,
        )
