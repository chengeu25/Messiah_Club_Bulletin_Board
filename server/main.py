from datetime import datetime, timezone, timedelta
from flask import Flask, jsonify, request, session
from flask_mysqldb import MySQL
from flask_cors import CORS
from dotenv import load_dotenv
import requests
from werkzeug.security import generate_password_hash, check_password_hash
import os
import jwt
import smtplib
from email.mime.text import MIMEText
import urllib.parse
import base64

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY")
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY")

load_dotenv()

# MySQL configuration
app.config["MYSQL_UNIX_SOCKET"] = os.getenv("MYSQL_UNIX_SOCKET")
app.config["MYSQL_HOST"] = os.getenv("MYSQL_HOST")
app.config["MYSQL_USER"] = os.getenv("DB_USER")
app.config["MYSQL_PASSWORD"] = os.getenv("DB_PWD")
app.config["MYSQL_DB"] = "sharc"


mysql = MySQL(app)

# Allow requests from http://localhost:5173
cors = CORS(
    app,
    resources={
        r"/api/*": {"origins": "http://localhost:5173"}#, "supports_credentials": True}
    }, supports_credentials=True
)


@app.route("/")
def hello():
    return "Hello, World!"


# @app.route("/api/checkUser", methods=["GET"])
# def check_user():
#     print("Last Activity: ", session.get("last_activity"))
#     print("Time: ", datetime.now(timezone.utc) - session.get("last_activity"))
#     if session.get("user_id") is not None and datetime.now(timezone.utc) - session.get(
#         "last_activity"
#     ) < timedelta(minutes=15):
#         cur = mysql.connection.cursor()
#         cur.execute(
#             """SELECT email, name
#                 FROM users 
#                 WHERE email = %s
#             """,
#             (session["user_id"],),
#         )
#         result = cur.fetchone()
#         cur.close()

#         if result is None:
#             return jsonify({"user_id": None, "name": None}), 401
#         return jsonify({"user_id": session["user_id"], "name": result[1]}), 200
#     else:
#         return jsonify({"user_id": None, "name": None}), 401
@app.route("/api/checkUser", methods=["GET"])
def check_user():
    print("Last Activity: ", session.get("last_activity"))
    # print("Time: ", datetime.now(timezone.utc) - session.get("last_activity"))
    if session.get("user_id") is not None:
        if datetime.now(timezone.utc) - session.get("last_activity") < timedelta(minutes = 15):
            cur = mysql.connection.cursor()
            cur.execute(
                """SELECT email, name
                    FROM users 
                    WHERE email = %s
                """,
                (session["user_id"],),
            )
            result = cur.fetchone()
            cur.close()

        if result is None:
            return jsonify({"user_id": None, "name": None}), 401
        return jsonify({"user_id": session["user_id"], "name": result[1]}), 200
    else:
        return jsonify({"user_id": None, "name": None}), 401

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    cur = mysql.connection.cursor()

    # Retrieve the hashed password from the database
    cur.execute(
        """SELECT pwd1, email_verified
                FROM users 
                WHERE email = %s
                    AND is_active = 1""",
        (data["email"],),
    )
    result = cur.fetchone()

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

    # Check if email is verified
    is_email_verified = result[1]
    if not is_email_verified == 1:
        return jsonify({"error": "Email not verified"}), 401

    cur.close()
    return jsonify({"message": "Login successful"}), 200


RECAPTCHA_KEY = "All-of-the-stars"


def password_strong_or_nah(password):
    if len(password) < 8:
        return False
    if not any(char.isupper() for char in password):
        return False
    if not any(char.isdigit() for char in password):
        return False
    if not any(char in "!@#$%^&*" for char in password):
        return False
    return True


def is_it_a_robot(captcha_response):  # checks for if it is or is not a robot
    payload = {"secret": RECAPTCHA_KEY, "response": captcha_response}
    response = requests.post(
        "https://www.google.com/recaptcha/api/siteverify", data=payload
    )
    result = response.json()
    return result.get("success", False)


@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email")  # These are to get the current inputs
    name = data.get("name")
    password = data.get("password")
    gender_str = data.get("gender")
    gender = 1 if data.get("gender") == "male" else 0
    captcha_response = data.get("captchaResponse")

    ##if not is_it_a_robot(captcha_response): # to verify the robot or not
    ##return jsonify({"error": "you may be a robot."}), 400
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
    if not password_strong_or_nah(password):
        return (
            jsonify(
                {
                    "error": "password is too weak! It must be at elast 8 characters long, with one uppercase, one number and one special character"
                },
            ),
            400,
        )
    # Hash da password
    hashed_password = generate_password_hash(password)
    # Putting it all into the database if pass

    print((email, hashed_password, gender, name))
    cur = mysql.connection.cursor()
    cur.execute(
        "INSERT INTO users(EMAIL, EMAIL_VERIFIED, PWD1, GENDER, IS_FACULTY, CAN_DELETE_FACULTY, IS_ACTIVE, SCHOOL_ID, NAME) VALUES (%s, 1, %s, %s, 0,0,1,1,%s)",
        (email, hashed_password, gender, name),
    )
    mysql.connection.commit()
    results = cur.fetchall()
    cur.close()
    return jsonify({"message ": "User Success!"}), 200


@app.route("/api/passwordReset", methods=["POST"])
def reset_password():
    data = request.json
    cur = mysql.connection.cursor()
    print("this is the email:\n")
    print(data["emailRequest"]["email"])

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
    print(new_password)
    print(result[0])
    print(result[1])
    print(result[2])
    if result[1] != None and result[2] != None:
        if check_password_hash(result[0], new_password) or check_password_hash(result[1], new_password) or check_password_hash(result[2], new_password):
            return jsonify({"error": "New password cannot be a previously used password"}), 400

    # Cascade passwords
    print(
        f"""UPDATE users
                SET pwd3 = {result[1]}, pwd2 = {result[0]}, pwd1 = {data['newPassword']}
                WHERE email = {data['emailRequest']['email']}"""
    )
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
    session.pop('user_id', None)
    return jsonify({"message": "Password successfully reset"})


@app.after_request
def apply_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

@app.route("/api/forgotPassword", methods=["POST"])
def forgot_password():
    data = request.json
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

    # Generate a reset token
    token = jwt.encode(
        {"email": data["email"], "exp": datetime.utcnow() + timedelta(hours=1)},
        app.config["SECRET_KEY"],
        algorithm="HS256",
    )

    # Add token to database
    cur.execute(
        """update users
                SET reset_token = %s
                WHERE email = %s""",
            (token, data["email"],),
    )
    mysql.connection.commit()
    result = cur.fetchone()

    # Create reset link
    reset_link = f"http://localhost:5173/ForgotPasswordToken?token={token}"

    # Send email
    send_email(str(data["email"]), reset_link)
    return jsonify({"message": "Reset link sent to your email"}), 200

def base64url_decode(encoded_data):
    # Add the necessary padding before decoding
    padding = '=' * (4 - len(encoded_data) % 4)
    return base64.urlsafe_b64decode(encoded_data + padding).decode('utf-8')

def send_email(to_email, reset_link):
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_PASSWORD")

    subject = "SHARC Forgot Password"
    body = f"Click the link to reset your password: {reset_link}"

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = to_email

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, to_email, msg.as_string())
            print("Email sent successfully")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")

@app.route("/api/forgotPasswordToken", methods=["POST"])
def forgot_password_reset():
    data = request.json
    cur = mysql.connection.cursor()

    try:
        # Extract token from request data
        token = request.json.get("token")
        decoded_data = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        user_email = decoded_data.get("email")
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

    if check_password_hash(result[0], new_password) or check_password_hash(result[1], new_password) or check_password_hash(result[2], new_password):
        return jsonify({"error": "New password cannot be a previously used password"}), 400

    # Cascade passwords
    print(
        f"""UPDATE users
                SET pwd3 = {result[1]}, pwd2 = {result[0]}, pwd1 = {data['newPassword']}
                WHERE email = {result[5]}"""
    )
    print((
            str(result[1]),
            str(result[0]),
            generate_password_hash(str(data["newPassword"])),
            str(data["token"]),
        ))
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
    session.pop('user_id', None)
    return jsonify({'message': "Password reset successful"}), 200


if __name__ == "__main__":
    app.run(debug=True, port=3000)
