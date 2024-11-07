from datetime import datetime, timezone, timedelta
from flask import Flask, jsonify, request, session
from flask_mysqldb import MySQL
from flask_cors import CORS
from dotenv import load_dotenv
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
    if session.get("user_id") is not None and datetime.now(timezone.utc) - session.get(
        "last_activity"
    ) < timedelta(minutes=15):
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


@app.route("/api/signup", methods=["POST"])
def signup():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM users")
    results = cur.fetchall()
    cur.close()
    return jsonify(results)

@app.route("/api/passwordReset", methods=["POST"])
def reset_password():
    data = request.json
    cur = mysql.connection.cursor()
    print("this is the email:\n")
    print(data.user_id)

    # Retrieve the hashed password from the database
    cur.execute(
        """Select pwd1, pwd2, email_verified
                FROM users
                WHERE email = %s
                    AND is_active = 1""",
        (data["emailRequest"],),
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
    session["user_id"] = data["emailRequest"]
    session["last_activity"] = datetime.now(timezone.utc)

    # Check if email is verified
    is_email_verified = result[2]
    if not is_email_verified == 1:
        return jsonify({"error": "Email not verified"}), 401

    # Cascade passwords
    cur.execute("""UPDATE users
                SET pwd3 = %s, pwd2 = %s, pwd1 = %s
                WHERE email = %s""",
        (result[1], result[0], data['newPassword'], data['emailRequset']))


if __name__ == "__main__":
    app.run(debug=True, port=3000)
