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

@app.route('/api/verify-email', methods=['POST'])
def verify_email():
    data = request.get_json()
    code = data.get('code')
    if not code:
        return jsonify({"error": "Code is required"}), 400

    # Add logic to verify the code with the database
    cursor = mysql.connection.cursor()
    cursor.execute("SELECT * FROM users WHERE verification_code = %s", (code,))
    user = cursor.fetchone()
    if user:
        cursor.execute("UPDATE users SET is_verified = 1 WHERE verification_code = %s", (code,))
        mysql.connection.commit()
        return jsonify({"message": "Email verified successfully"}), 200
    else:
        return jsonify({"error": "Invalid verification code"}), 400

@app.route('/api/resend-code', methods=['POST'])
def resend_code():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"error": "Email is required"}), 400

    # Generate a new verification code
    new_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

    # Update the verification code in the database
    cursor = mysql.connection.cursor()
    cursor.execute("UPDATE users SET verification_code = %s WHERE email = %s", (new_code, email))
    mysql.connection.commit()

    # Send the new verification code to the user's email
    send_verification_email(email, new_code)

    return jsonify({"message": "Verification code resent"}), 200

def send_verification_email(email, code):
    sender_email = os.getenv("SENDER_EMAIL")
    sender_password = os.getenv("SENDER_PASSWORD")
    subject = "Your Verification Code"
    body = f"Your new verification code is: {code}"

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender_email
    msg['To'] = email

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, email, msg.as_string())
    except Exception as e:
        print(f"Failed to send email: {e}")


@app.route("/api/checkUser", methods=["GET"])
def check_user():
    if session.get("user_id") is not None and datetime.now(timezone.utc) - session.get(
        "last_activity"
    ) < timedelta(minutes=15):
        return jsonify({"user_id": session["user_id"]}), 200
    else:
        return jsonify({"user_id": None}), 401


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


if __name__ == "__main__":
    app.run(debug=True, port=3000)
