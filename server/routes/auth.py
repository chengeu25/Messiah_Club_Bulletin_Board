from datetime import datetime, timezone, timedelta
import random
import string
from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import mysql
from helper.send_email import send_email
import requests
from config import Config
import jwt

auth_bp = Blueprint("auth", __name__)


# Function to update the email verification status in the database
def update_email_verified(email, **kwargs):
    cursor = None
    try:
        if not mysql.connection:
            return False

        cursor = mysql.connection.cursor()
        query = "UPDATE users SET EMAIL_VERIFIED = %s WHERE email = %s"
        cursor.execute(query, (1 if kwargs["verified"] else 0, email))
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
    subject = "Your Verification Code"
    body = f"Your new verification code is: {code}"
    try:
        send_email(email, subject, body)
        return True
    except Exception as e:
        print(f"Failed to send email to {email} with code {code}: {e}")
        return False


def is_it_a_robot(captcha_response):
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
def verify_email():
    data = request.get_json()
    input_code = data.get("code")
    email = session.get("user_id")

    if not input_code:
        return jsonify({"error": "Verification code is required"}), 400

    # store verification code in session
    stored_session_code = session.get("verification_code")

    if stored_session_code == input_code:
        # Update EMAIL_VERIFIED field in the database
        update_success = update_email_verified(
            email, verified=True
        )  # Function that updates EMAIL_VERIFIED field

        if update_success:
            return jsonify({"message": "Email verified successfully"}), 200
        else:
            return jsonify({"error": "Failed to update verification status"}), 500
    else:
        return jsonify({"error": "Invalid verification code"}), 400


@auth_bp.route("/resend-code", methods=["POST"])
def resend_code():
    # get email from session
    email = session.get("user_id")

    # Generate a new verification code
    new_code = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))

    # Update the verification code in the database
    session["verification_code"] = new_code

    # Send the new verification code to the user's email
    verified = send_verification_email(email, new_code)

    if not verified:
        return jsonify({"error": "Failed to send verification code"}), 500

    return jsonify({"message": "Verification code resent"}), 200


@auth_bp.route("/check-user-cookie", methods=["GET"])
def check_user_cookie():
    user_id = request.cookies.get("user_id")
    if user_id:
        return jsonify({"user_id": user_id}), 200
    else:
        return jsonify({"user_id": None}), 404


@auth_bp.route("/check-user", methods=["GET"])
def check_user():
    last_activity = session.get("last_activity")
    try:
        if (
            session.get("user_id") is not None
            and last_activity is not None
            and datetime.now(timezone.utc) - last_activity < timedelta(minutes=15)
        ):
            if not mysql.connection:
                return (
                    jsonify(
                        {
                            "user_id": None,
                            "name": None,
                            "emailVerified": None,
                            "isFaculty": None,
                            "canDeleteFaculty": None,
                            "clubAdmins": None,
                            "tags": None,
                        }
                    ),
                    401,
                )
            cur = mysql.connection.cursor()
            cur.execute(
                """SELECT email, email_verified, name, is_faculty, can_delete_faculty
                    FROM users 
                    WHERE email = %s
                        AND is_active = 1
                """,
                (session["user_id"],),
            )
            result = cur.fetchone()
            cur.execute(
                """SELECT a.club_id 
                            FROM club_admin a
                            INNER JOIN users u ON u.email = a.user_id
                            WHERE a.user_id = %s
                                AND u.is_active = 1
                                AND a.is_active = 1
                        """,
                (session["user_id"],),
            )
            result_2 = None
            try:
                result_2 = cur.fetchall()
                result_2 = list(map(lambda x: x[0], result_2))
            except TypeError:
                result_2 = None
            cur.execute(
                """SELECT tag_name 
                        FROM tag t 
                        INNER JOIN user_tags ut 
                            ON t.tag_id = ut.tag_id 
                        WHERE ut.user_id = %s""",
                (session["user_id"],),
            )
            result_3 = None
            try:
                result_3 = cur.fetchall()
                result_3 = list(map(lambda x: x[0], result_3))
            except TypeError:
                result_3 = None
            cur.close()
            if result is None:
                return (
                    jsonify(
                        {
                            "user_id": None,
                            "name": None,
                            "emailVerified": None,
                            "isFaculty": None,
                            "canDeleteFaculty": None,
                            "clubAdmins": None,
                            "tags": None,
                        }
                    ),
                    401,
                )
            session["last_activity"] = datetime.now(timezone.utc)
            return (
                jsonify(
                    {
                        "user_id": session["user_id"],
                        "name": result[2],
                        "emailVerified": result[1],
                        "isFaculty": result[3],
                        "canDeleteFaculty": result[4],
                        "clubAdmins": result_2,
                        "tags": result_3,
                    }
                ),
                200,
            )
        else:
            return (
                jsonify(
                    {
                        "user_id": None,
                        "name": None,
                        "emailVerified": None,
                        "isFaculty": None,
                        "canDeleteFaculty": None,
                        "clubAdmins": None,
                        "tags": None,
                    }
                ),
                401,
            )
    except Exception as e:
        print(e)
        return (
            jsonify(
                {
                    "user_id": None,
                    "name": None,
                    "emailVerified": None,
                    "isFaculty": None,
                    "canDeleteFaculty": None,
                    "clubAdmins": None,
                    "tags": None,
                }
            ),
            401,
        )


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    if data is None:
        return jsonify({"error": "No data was provided"}), 400
    if data["email"] is None or data["password"] is None:
        return jsonify({"error": "Email and password are required"}), 400
    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
    cur = mysql.connection.cursor()

    # Retrieve the hashed password from the database
    cur.execute(
        """SELECT pwd1
                FROM users 
                WHERE email = %s
                    AND is_active = 1""",
        (data["email"],),
    )
    result = cur.fetchone()

    # Turn off email verified
    update_email_verified(data["email"], verified=False)

    # If no matching email is found, return an error
    if result is None:
        return jsonify({"error": "Invalid email or password"}), 401

    # Verify the provided password against the hashed password
    hashed_password = result[0]
    if not check_password_hash(hashed_password, data["password"]):
        return jsonify({"error": "Invalid password"}), 401

    # Set the user ID and activity timestamp in the session
    session["user_id"] = data["email"]
    session["last_activity"] = datetime.now(timezone.utc)

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
    session.clear()
    session.modified = True
    resp = jsonify({"message": "Logout successful"})
    resp.set_cookie("user_id", "", expires=0, path="/api")
    return resp, 200


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email")  # These are to get the current inputs
    name = data.get("name")
    password = data.get("password")
    if data.get("gender") == "male":
        gender = 1
    elif data.get("gender") == "female":
        gender = 0
    else:
        gender = None
    captcha_response = data.get("captchaResponse")

    # Validate reCAPTCHA response
    if not is_it_a_robot(captcha_response):
        return jsonify({"error": "You may be a robot."}), 400

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500

    # to check if the email is unique
    cur = mysql.connection.cursor()
    cur.execute(
        "SELECT * FROM users WHERE email = %s",
        (str(email),),
    )
    existing_user = cur.fetchone()
    cur.close()

    if existing_user:
        return jsonify({"error": "email already in use"}), 400

    # To check password strngth

    # Hash da password
    hashed_password = generate_password_hash(password)
    # Putting it all into the database if pass

    cur = mysql.connection.cursor()
    cur.execute(
        "INSERT INTO users(EMAIL, EMAIL_VERIFIED, PWD1, GENDER, IS_FACULTY, CAN_DELETE_FACULTY, IS_ACTIVE, SCHOOL_ID, NAME) VALUES (%s, 0, %s, %s, 0,0,1,1,%s)",
        (email, hashed_password, gender, name),
    )
    mysql.connection.commit()

    session["user_id"] = email
    session["last_activity"] = datetime.now(timezone.utc)

    cur.close()
    return jsonify({"message ": "User Success!"}), 200


@auth_bp.route("password-reset", methods=["POST"])
def reset_password():
    data = request.json
    if data is None:
        return jsonify({"error": "No data was provided"}), 400
    if (
        data["emailRequest"] is None
        or data["oldPassword"] is None
        or data["newPassword"] is None
    ):
        return jsonify({"error": "Email and password are required"}), 400
    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
    cur = mysql.connection.cursor()

    # Retrieve the hashed passwords from the database
    cur.execute(
        """Select pwd1, pwd2, pwd3, email_verified
                FROM users
                WHERE email = %s
                    AND is_active = 1""",
        (data["emailRequest"]["email"],),
    )
    result = cur.fetchone()

    # If no matching email is found, return an error
    if result is None:
        return jsonify({"error": "Invalid email or password"}), 401

    # Verify the provided current password against the hashed password
    hashed_password = result[0]
    if not check_password_hash(hashed_password, data["oldPassword"]):
        return jsonify({"error": "Invalid password"}), 401

    # Set the user ID and activity timestamp in the session
    session["user_id"] = data["emailRequest"]["email"]
    session["last_activity"] = datetime.now(timezone.utc)

    # Check if email is verified
    is_email_verified = result[3]
    if not is_email_verified == 1:
        return jsonify({"error": "Email not verified"}), 401

    # Check if new password is unique to the last three saved passwords
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

    # Cascade passwords
    cur.execute(
        """UPDATE users
                SET pwd3 = %s, pwd2 = %s, pwd1 = %s
                WHERE email = %s""",
        (
            str(result[1]),
            str(result[0]),
            generate_password_hash(str(data["newPassword"])),
            str(data["emailRequest"]["email"]),
        ),
    )

    mysql.connection.commit()
    cur.close()
    session.pop("user_id", None)
    return jsonify({"message": "Password successfully reset"})


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
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
        """Select pwd1, pwd2, email_verified
                FROM users
                WHERE email = %s
                    AND is_active = 1""",
        (data["email"],),
    )
    result = cur.fetchone()

    # If no matching email is found, return an error
    if result is None:
        return jsonify({"error": "Invalid email"}), 401

    # Check if email is verified
    is_email_verified = result[2]
    if not is_email_verified == 1:
        return jsonify({"error": "Email not verified"}), 401

    if Config.SECRET_KEY is None:
        return jsonify({"error": "Developer did not set secret key"}), 500

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
    reset_link = f"http://localhost:5173/ForgotPasswordToken?token={token}"

    # Send email
    send_email(
        str(data["email"]),
        "SHARC Forgot Password",
        f"Click the link to reset your password: {reset_link}",
    )
    return jsonify({"message": "Reset link sent to your email"}), 200


@auth_bp.route("/forgot-password-token", methods=["POST"])
def forgot_password_reset():
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
        or check_password_hash(result[1], new_password)
        or check_password_hash(result[2], new_password)
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
