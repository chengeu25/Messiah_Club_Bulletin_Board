from datetime import datetime, timezone, timedelta
from flask import Flask, jsonify, request, session
from flask_mysqldb import MySQL
from flask_cors import CORS
from dotenv import load_dotenv
import requests
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY")

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


@app.route("/")
def hello():
    return "Hello, World!"


@app.route("/api/checkUser", methods=["GET"])
def check_user():
    user_id = request.cookies.get("user_id")
    if user_id:
        session["user_id"] = user_id
        session["last_activity"] = datetime.now(timezone.utc)
    if session.get("user_id") is not None and datetime.now(timezone.utc) - session.get(
        "last_activity"
    ) < timedelta(minutes=15):
        cur = mysql.connection.cursor()
        cur.execute(
            """SELECT email, email_verified, name
                FROM users 
                WHERE email = %s
            """,
            (session["user_id"],),
        )
        result = cur.fetchone()
        cur.close()

        if result is None:
            return jsonify({"user_id": None, "name": None, "emailVerified": None}), 401

        session["last_activity"] = datetime.now(timezone.utc)
        return (
            jsonify(
                {
                    "user_id": session["user_id"],
                    "name": result[2],
                    "emailVerified": result[1],
                }
            ),
            200,
        )
    else:
        return jsonify({"user_id": None, "name": None, "emailVerified": None}), 401


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

    email = data["email"]
    remember = data["remember"]

    response = jsonify({"message": "Login successful", "user_id": email})

    if remember:
        # Set a cookie that expires in 30 days
        expires = datetime.now() + timedelta(days=30)
        response.set_cookie("user_id", email, expires=expires, path="/api")

    return response, 200


@app.route("/api/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)
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

    print(email)
    session["user_id"] = email
    print(session.get("user_id"))
    session["last_activity"] = datetime.now(timezone.utc)

    cur.close()
    return jsonify({"message ": "User Success!"}), 200


if __name__ == "__main__":
    app.run(debug=True, port=3000)
