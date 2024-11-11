from datetime import datetime, timezone, timedelta
from flask import Flask, jsonify, request, session
from flask_mysqldb import MySQL
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
import os
import random
import string
import smtplib
from email.mime.text import MIMEText

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

# Function to get user by email from the database
def get_code_by_email(email):
    cursor = mysql.connection.cursor()
    query = "SELECT verification_code FROM users WHERE email = %s"
    cursor.execute(query, (email,))
    user = cursor.fetchone()[0]  # Fetch the first result
    cursor.close()
    return user

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


@app.route("/")
def hello():
    return "Hello, World!"

@app.route('/api/verify-email', methods=['POST'])
def verify_email():
    data = request.get_json()
    input_code = data.get('code')
    email = session.get('user_id')
    
    if not input_code:
        return jsonify({"error": "Verification code is required"}), 400
    # if not email:
    #     return jsonify({"error": "Email is required"}), 400

    # Retrieve user from the database
    user = get_code_by_email(email)  # This function should query the database to find the user by email
    print(user)

    if user == input_code:
        # Update EMAIL_VERIFIED field in the database
        update_success = update_email_verified(email, verified=True)  # Function that updates EMAIL_VERIFIED field

        if update_success:
            return jsonify({"message": "Email verified successfully"}), 200
        else:
            return jsonify({"error": "Failed to update verification status"}), 500
    else:
        return jsonify({"error": "Invalid verification code"}), 400


@app.route('/api/resend-code', methods=['POST'])
def resend_code():
    data = request.get_json()
    print("Received data:", data)  # Print received data
    #get email from session?
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

    # Check if variables are loaded correctly
    print(f"Sender Email: {sender_email}")
    print(f"Sender Password: {sender_password}")

    subject = "Your Verification Code"
    body = f"Your new verification code is: {code}"

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = sender_email
    msg['To'] = email  # changed to 'email' to use the intended recipient

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, email, msg.as_string())
        print("Email sent successfully.")
    except Exception as e:
        print(f"Failed to send email to {email} with code {code}: {e}")


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
