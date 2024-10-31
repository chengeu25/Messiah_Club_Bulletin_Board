from datetime import datetime
from flask import Flask, jsonify, request, session
from flask_mysqldb import MySQL
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY")

load_dotenv()

# MySQL configurations
app.config["MYSQL_HOST"] = "localhost"
app.config["MYSQL_USER"] = os.getenv("DB_USER")
app.config["MYSQL_PASSWORD"] = os.getenv("DB_PWD")
app.config["MYSQL_DB"] = "sharc"

mysql = MySQL(app)

# Allow requests from http://localhost:5173
cors = CORS(
    app,
    resources={
        r"/api/*": {"origins": "http://localhost:5173"}  # Allow this specific origin
    },
)


@app.route("/")
def hello():
    return "Hello, World!"


@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    cur = mysql.connection.cursor()

    # Retrieve the hashed password from the database
    cur.execute(
        """SELECT pwd1 
           FROM users 
           WHERE email = %s""",
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
    session["last_activity"] = datetime.now()

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
