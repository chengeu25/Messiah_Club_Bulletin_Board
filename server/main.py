from datetime import datetime, timezone, timedelta
from flask import Flask, jsonify, request, session
from flask_mysqldb import MySQL
from flask_cors import CORS
from dotenv import load_dotenv
import requests
from werkzeug.security import generate_password_hash, check_password_hash
import os
import random
import string
import smtplib
from email.mime.text import MIMEText
import base64

app = Flask(__name__)
# Load the secret keys from environment variables
app.secret_key = os.getenv("FLASK_SECRET_KEY")
RECAPTCHA_SECRET_KEY = os.getenv("RECAPTCHA_SECRET_KEY")


def is_it_a_robot(captcha_response):
    payload = {
        "secret": RECAPTCHA_SECRET_KEY,  # Use the secret key from environment
        "response": captcha_response,
    }
    response = requests.post(
        "https://www.google.com/recaptcha/api/siteverify", data=payload
    )
    result = response.json()
    return result.get("success", False)


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
        r"/api/*": {"origins": "http://localhost:5173", "supports_credentials": True}
    },
)


# Function to update the email verification status in the database
def update_email_verified(email, **kwargs):
    try:
        cursor = mysql.connection.cursor()
        query = "UPDATE users SET EMAIL_VERIFIED = %s WHERE email = %s"
        cursor.execute(query, (1 if kwargs["verified"] else 0, email))
        mysql.connection.commit()  # Commit the transaction
        cursor.close()
        return True
    except:
        return False


# Function to send a verification email
def send_verification_email(email, code):
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_PASSWORD")

    # Check if variables are loaded correctly
    print(f"Sender Email: {sender_email}")
    print(f"Sender Password: {sender_password}")

    subject = "Your Verification Code"
    body = f"Your new verification code is: {code}"

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender_email
    msg["To"] = email  # changed to 'email' to use the intended recipient

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, email, msg.as_string())
        print("Email sent successfully.")
    except Exception as e:
        print(f"Failed to send email to {email} with code {code}: {e}")
        return False

    return True


@app.route("/")
def hello():
    return "Hello, World!"


@app.route("/api/verify-email", methods=["POST"])
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


@app.route("/api/resend-code", methods=["POST"])
def resend_code():
    data = request.get_json()
    print("Received data:", data)  # Print received data
    # get email from session?
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


@app.route("/api/checkUserCookie", methods=["GET"])
def check_user_cookie():
    user_id = request.cookies.get("user_id")
    if user_id:
        return jsonify({"user_id": user_id}), 200
    else:
        return jsonify({"user_id": None}), 404


@app.route("/api/checkUser", methods=["GET"])
def check_user():
    if session.get("user_id") is not None and datetime.now(timezone.utc) - session.get(
        "last_activity"
    ) < timedelta(minutes=15):
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
                    """,
            (session["user_id"],),
        )
        result_2 = None
        try:
            result_2 = cur.fetchall()
            result_2 = list(map(lambda x: x[0], result_2))
        except TypeError:
            result_2 = None
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
                }
            ),
            401,
        )


@app.route("/api/clubs", methods=["GET"])
def get_clubs():
    cur = mysql.connection.cursor()
    cur.execute(
        "SELECT club_id, club_name, description, club_logo, logo_prefix FROM club WHERE is_active = 1"
    )
    result = None
    try:
        result = cur.fetchall()
        result = list(
            map(
                lambda x: {
                    "id": x[0],
                    "name": x[1],
                    "description": x[2],
                    "image": (
                        f"{x[4]},{base64.b64encode(x[3]).decode('utf-8')}"
                        if x[3]
                        else None
                    ),
                },
                result,
            )
        )
    except TypeError as e:
        print(e)
        result = None
    if result is None:
        return jsonify({"error": "No clubs found"}), 404
    cur.close()
    return jsonify(result), 200


@app.route("/api/club/<club_id>", methods=["GET"])
def get_club(club_id):
    cur = mysql.connection.cursor()
    cur.execute(
        """SELECT club_id, club_name, description, club_logo, logo_prefix 
            FROM club 
            WHERE is_active = 1 
                AND club_id = %s""",
        (club_id,),
    )
    result = cur.fetchone()
    if result is None:
        return jsonify({"error": "The requested club was not found on the server"}), 404
    result = {
        "id": result[0],
        "name": result[1],
        "description": result[2],
        "image": (
            f"{result[4]},{base64.b64encode(result[3]).decode('utf-8')}"
            if result[3]
            else None
        ),
    }
    cur.execute(
        """SELECT user_id, club_admin_id FROM club_admin WHERE club_id = %s""",
        (club_id,),
    )
    result["admins"] = list(map(lambda x: {"user": x[0], "id": x[1]}, cur.fetchall()))
    cur.execute(
        """SELECT image, club_photo_id, image_prefix FROM club_photo WHERE club_id = %s""",
        (club_id,),
    )
    result["images"] = list(
        map(
            lambda x: {
                "image": f"{x[2]},{base64.b64encode(x[0]).decode('utf-8')}",
                "id": x[1],
            },
            cur.fetchall(),
        )
    )
    cur.close()
    return jsonify(result), 200


@app.route("/api/new-club", methods=["POST"])
def new_club():
    data = request.json
    cur = mysql.connection.cursor()
    mysql.connection.rollback()

    # First create the new club instance
    base64_image = data["image"]

    try:
        base64_imagedata = base64_image.split(",")
        base64_image = base64_imagedata[1]
        prefix = base64_imagedata[0]

        image_data = base64.b64decode(base64_image)
    except Exception as e:
        return jsonify({"error": "Invalid image"}), 400
    try:
        cur.execute(
            "INSERT INTO club (club_name, is_active, description, last_updated, club_logo, logo_prefix) VALUES (%s, 1, %s, CURRENT_TIMESTAMP(), %s, %s)",
            (data["name"], data["description"], image_data, prefix),
        )
    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to create new club"}), 400

    # Now we need to get the ID of the new club for use in the other tables
    cur.execute(
        """SELECT club_id 
            FROM club 
            WHERE is_active = 1 
                AND club_name = %s 
                AND description = %s 
                AND club_logo = %s""",
        (data["name"], data["description"], image_data),
    )
    new_club_id = cur.fetchone()[0]

    # Add the admins
    for admin in data["admins"]:
        try:
            cur.execute(
                "INSERT INTO club_admin (user_id, club_id, is_active) VALUES (%s, %s, 1)",
                (admin["user"], new_club_id),
            )
        except Exception as e:
            print(e)
            return jsonify({"error": f"User {admin['user']} does not exist"}), 400

    # Add the photos
    for image in data["images"]:
        try:
            base64_imagedata = image["image"].split(",")
            base64_image = base64_imagedata[1]
            prefix = base64_imagedata[0]

            image_data = base64.b64decode(base64_image)
        except Exception as e:
            return jsonify({"error": "Invalid image"}), 400
        try:
            cur.execute(
                "INSERT INTO club_photo (image, club_id, image_prefix) VALUES (%s, %s, %s)",
                (image_data, new_club_id, prefix),
            )
        except Exception as e:
            print(e)
            return (
                jsonify({"error": "Failed to create new photo. It may be too large."}),
                400,
            )

    # Commit the changes to the database
    mysql.connection.commit()
    cur.close()

    return jsonify({"id": int(new_club_id)}), 200


@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
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

    # Check if email is verified
    # is_email_verified = result[1]
    # if not is_email_verified == 1:
    #     return jsonify({"error": "Email not verified"}), 401

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


@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()
    session.modified = True
    resp = jsonify({"message": "Logout successful"})
    resp.set_cookie("user_id", "", expires=0, path="/api")
    return resp, 200


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


@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email")  # These are to get the current inputs
    name = data.get("name")
    password = data.get("password")
    gender_str = data.get("gender")
    gender = 1 if data.get("gender") == "male" else 0
    captcha_response = data.get("captchaResponse")

    # Validate reCAPTCHA response
    print(f"Captcha Response: {captcha_response}")  # Debugging line
    if not is_it_a_robot(captcha_response):
        return jsonify({"error": "You may be a robot."}), 400

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

    print((email, hashed_password, gender, name))
    cur = mysql.connection.cursor()
    cur.execute(
        "INSERT INTO users(EMAIL, EMAIL_VERIFIED, PWD1, GENDER, IS_FACULTY, CAN_DELETE_FACULTY, IS_ACTIVE, SCHOOL_ID, NAME) VALUES (%s, 0, %s, %s, 0,0,1,1,%s)",
        (email, hashed_password, gender, name),
    )
    mysql.connection.commit()
    results = cur.fetchall()

    print(email)
    session["user_id"] = email
    print(session.get("user_id"))
    session["last_activity"] = datetime.now(timezone.utc)

    cur.close()
    return jsonify({"message ": "User Success!"}), 200


if __name__ == "__main__":
    app.run(debug=True, port=3000)
