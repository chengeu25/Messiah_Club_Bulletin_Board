from datetime import datetime, timezone, timedelta
from flask import Flask, jsonify, request, session
from flask_mysqldb import MySQL
from flask_cors import CORS
from dotenv import load_dotenv
import requests
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import random
import string
import smtplib
import jwt
from email.mime.text import MIMEText
import base64
import json
import pytz

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
    print("user_id ", user_id)
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


@app.route("/api/getAvailableTags", methods=["GET"])
def get_avaliable_tags():
    cur = mysql.connection.cursor()
    cur.execute("SELECT tag_id, tag_name FROM tag")
    result = cur.fetchall()
    result = list(map(lambda x: {"tag": x[1], "tag_id": x[0]}, result))
    cur.close()
    return jsonify({"tags": result}), 200


@app.route("/api/event/<event_id>", methods=["GET"])
def get_event(event_id):
    cur = mysql.connection.cursor()
    cur.execute(
        """SELECT event_id, start_time, end_time, location, description, cost, event_name FROM event 
            WHERE event_id = %s
                AND is_active = 1
                AND is_approved = 1""",
        (event_id,),
    )
    result = cur.fetchone()
    if result is None:
        return (
            jsonify({"error": "The requested event was not found on the server"}),
            404,
        )
    cur.execute(
        """SELECT c.club_name, c.club_id FROM event_host eh
                INNER JOIN club c 
                    ON c.club_id = eh.club_id
                WHERE eh.event_id = %s
                    AND c.is_active = 1""",
        (event_id,),
    )
    result_2 = None
    try:
        result_2 = cur.fetchall()
        result_2 = list(map(lambda x: {"name": x[0], "id": x[1]}, result_2))
    except TypeError:
        result_2 = None
    cur.execute(
        """SELECT is_yes FROM rsvp
                WHERE event_id = %s
                    AND user_id = %s
                    AND is_active = 1""",
        (event_id, session["user_id"]),
    )
    result_3 = cur.fetchone()
    if result_3 is not None:
        result_3 = result_3[0]
    cur.execute(
        """SELECT t.tag_name FROM tag t
                INNER JOIN event_tags et
                    ON t.tag_id = et.tag_id
                WHERE et.event_id = %s""",
        (event_id,),
    )
    result_4 = cur.fetchall()
    result_4 = list(map(lambda x: x[0], result_4))
    cur.execute(
        """SELECT image, event_photo_id, image_prefix FROM event_photo WHERE event_id = %s""",
        (event_id,),
    )
    result_5 = list(
        map(
            lambda x: {
                "image": f"{x[2]},{base64.b64encode(x[0]).decode('utf-8')}",
                "id": x[1],
            },
            cur.fetchall(),
        )
    )
    print(result[1])
    print(type(result[1]))
    final_result = {
        "id": result[0],
        "startTime": (
            result[1].replace(tzinfo=pytz.UTC)
            if result[1].tzinfo is None
            else result[1].astimezone(pytz.UTC).isoformat()
        ),
        "endTime": (
            result[2].replace(tzinfo=pytz.UTC)
            if result[2].tzinfo is None
            else result[2].astimezone(pytz.UTC).isoformat()
        ),
        "location": result[3],
        "description": result[4],
        "cost": result[5],
        "title": result[6],
        "host": result_2,
        "rsvp": "block" if result_3 == 0 else ("rsvp" if result_3 == 1 else None),
        "tags": result_4,
        "images": result_5,
    }
    cur.close()
    return jsonify({"event": final_result}), 200


@app.route("/api/club_events/<club_id>", methods=["GET"])
def get_club_events(club_id):
    start_date = request.args.get("start_date")
    cur = mysql.connection.cursor()
    cur.execute(
        """SELECT e.event_id, e.start_time, e.end_time, e.event_name FROM event e
            INNER JOIN event_host eh
                ON eh.event_id = e.event_id
            WHERE eh.club_id = %s
                AND e.is_active = 1
                AND e.is_approved = 1
                AND e.start_time >= %s
            LIMIT 10""",
        (club_id, start_date),
    )
    result = cur.fetchall()
    cur.execute(
        """SELECT r.event_id, r.is_yes FROM rsvp r
                INNER JOIN event e 
                    ON e.event_id = r.event_id
                INNER JOIN event_host eh
                    ON eh.event_id = e.event_id
                WHERE r.user_id = %s
                    AND e.is_active = 1
                    AND e.is_approved = 1
                    AND r.is_active = 1
                    AND eh.club_id = %s""",
        (session["user_id"], club_id),
    )
    result_2 = cur.fetchall()
    result_2 = list(map(lambda x: {"event": x[0], "type": x[1]}, result_2))
    final_result = list(
        map(
            lambda x: {
                "id": x[0],
                "startTime": (
                    x[1].replace(tzinfo=pytz.UTC)
                    if x[1].tzinfo is None
                    else x[1].astimezone(pytz.UTC).isoformat()
                ),
                "endTime": (
                    x[2].replace(tzinfo=pytz.UTC)
                    if x[2].tzinfo is None
                    else x[2].astimezone(pytz.UTC).isoformat()
                ),
                "title": x[3],
                "rsvp": next(
                    (
                        ("block" if item["type"] == 0 else "rsvp")
                        for item in result_2
                        if item["event"] == x[0]
                    ),
                    None,
                ),
            },
            result,
        )
    )
    print(result)
    cur.close()
    return jsonify({"events": final_result}), 200


@app.route("/api/events", methods=["GET"])
def get_events():
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    if start_date is not None and end_date is not None:
        try:
            start_date = datetime.fromisoformat(start_date).strftime("%Y-%m-%d")
            end_date = datetime.fromisoformat(end_date).strftime("%Y-%m-%d")
            cur = mysql.connection.cursor()
            cur.execute(
                """SELECT event_id, start_time, end_time, location, description, cost, event_name FROM event 
                    WHERE start_time BETWEEN %s AND %s
                        AND is_active = 1
                        AND is_approved = 1""",
                (start_date, end_date),
            )
            result = cur.fetchall()
            cur.execute(
                """SELECT c.club_name, eh.event_id, c.club_id FROM event_host eh
                        INNER JOIN club c ON c.club_id = eh.club_id
                        WHERE c.is_active = 1""",
            )
            result_2 = cur.fetchall()
            result_2 = list(
                map(lambda x: {"club": x[0], "club_id": x[2], "event": x[1]}, result_2)
            )
            cur.execute(
                """SELECT r.event_id, r.is_yes FROM rsvp r
                        INNER JOIN event e 
                            ON e.event_id = r.event_id
                        WHERE r.user_id = %s
                            AND e.is_active = 1
                            AND e.is_approved = 1
                            AND r.is_active = 1""",
                (session["user_id"],),
            )
            result_3 = cur.fetchall()
            result_3 = list(map(lambda x: {"event": x[0], "type": x[1]}, result_3))
            cur.execute(
                """SELECT et.event_id, t.tag_name FROM tag t
                        INNER JOIN event_tags et
                            ON t.tag_id = et.tag_id"""
            )
            result_4 = cur.fetchall()
            result_4 = list(
                map(
                    lambda x: {"event": x[0], "tag": x[1]},
                    result_4,
                )
            )
            final_result = list(
                map(
                    lambda x: {
                        "id": x[0],
                        "startTime": (
                            x[1].replace(tzinfo=pytz.UTC).isoformat()
                            if x[1].tzinfo is None
                            else x[1].astimezone(pytz.UTC).isoformat()
                        ),
                        "endTime": (
                            x[2].replace(tzinfo=pytz.UTC).isoformat()
                            if x[2].tzinfo is None
                            else x[2].astimezone(pytz.UTC).isoformat()
                        ),
                        "location": x[3],
                        "description": x[4],
                        "cost": x[5],
                        "title": x[6],
                        "host": list(
                            map(
                                lambda y: {"name": y["club"], "id": y["club_id"]},
                                list(
                                    filter(
                                        lambda y: y["event"] == x[0],
                                        result_2,
                                    )
                                ),
                            )
                        ),
                        "rsvp": next(
                            (
                                ("block" if item["type"] == 0 else "rsvp")
                                for item in result_3
                                if item["event"] == x[0]
                            ),
                            None,
                        ),
                        "tags": list(
                            map(
                                lambda y: y["tag"],
                                list(
                                    filter(
                                        lambda y: y["event"] == x[0],
                                        result_4,
                                    )
                                ),
                            )
                        ),
                    },
                    result,
                )
            )
            cur.close()
            return jsonify({"events": final_result}), 200
        except ValueError:
            return jsonify({"error": "Invalid date format"}), 400
        except Exception as e:
            print(e)
            return jsonify({"error": f"Failed to get events"}), 500
    else:
        return jsonify({"error": "Missing start_date or end_date"}), 400


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
    try:
        cur.execute(
            """SELECT c.club_id, t.tag_name 
                FROM club_tags c 
                INNER JOIN tag t 
                    ON c.tag_id = t.tag_id""",
        )
        tags = cur.fetchall()
        tags = list(map(lambda x: {"tag": x[1], "club_id": x[0]}, tags))
        result = list(
            map(
                lambda x: {
                    **x,
                    "tags": list(
                        map(
                            lambda y: y["tag"],
                            filter(lambda y: y["club_id"] == x["id"], tags),
                        )
                    ),
                },
                result,
            )
        )
    except TypeError as e:
        print(e)
    cur.close()
    return jsonify(result), 200


@app.route("/api/inactiveClubs", methods=["GET"])
def get_inactive_clubs():
    cur = mysql.connection.cursor()
    cur.execute(
        "SELECT club_id, club_name, description, club_logo, logo_prefix FROM club WHERE is_active = 0"
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
    try:
        cur.execute(
            """SELECT c.club_id, t.tag_name 
                FROM club_tags c 
                INNER JOIN tag t 
                    ON c.tag_id = t.tag_id""",
        )
        tags = cur.fetchall()
        tags = list(map(lambda x: {"tag": x[1], "club_id": x[0]}, tags))
        result = list(
            map(
                lambda x: {
                    **x,
                    "tags": list(
                        map(
                            lambda y: y["tag"],
                            filter(lambda y: y["club_id"] == x["id"], tags),
                        )
                    ),
                },
                result,
            )
        )
    except TypeError as e:
        print(e)
    cur.close()
    return jsonify(result), 200


@app.route("/api/club/<club_id>", methods=["GET"])
def get_club(club_id):
    cur = mysql.connection.cursor()
    cur.execute(
        """SELECT club_id, club_name, description, club_logo, logo_prefix 
            FROM club 
            WHERE club_id = %s""",
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
        """SELECT a.user_id, a.club_admin_id, u.name 
            FROM club_admin a 
            INNER JOIN users u ON u.email = a.user_id
            WHERE club_id = %s
                AND a.is_active = 1""",
        (club_id,),
    )
    result["admins"] = list(
        map(lambda x: {"user": x[0], "id": x[1], "name": x[2]}, cur.fetchall())
    )
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
    cur.execute(
        """SELECT c.tag_id, t.tag_name 
            FROM club_tags c 
            INNER JOIN tag t 
                ON c.tag_id = t.tag_id 
            WHERE club_id = %s""",
        (club_id,),
    )
    result["tags"] = list(map(lambda x: {"label": x[1], "value": x[0]}, cur.fetchall()))
    cur.close()
    return jsonify(result), 200


@app.route("/api/update-club", methods=["PUT"])
def update_club():
    data = request.json
    cur = mysql.connection.cursor()
    cur.execute(
        "SELECT COUNT(*) FROM club WHERE is_active = 1 AND club_name = %s AND club_id != %s",
        (data["name"], data["id"]),
    )
    if not (cur.fetchone()[0] == 0):
        return jsonify({"error": "An active club with this name already exists."}), 400
    try:
        cur.execute(
            "UPDATE club SET club_name = %s, description = %s, last_updated = CURRENT_TIMESTAMP(), is_active = 1 WHERE club_id = %s",
            (data["name"], data["description"], data["id"]),
        )
    except Exception as e:
        print(e)
        mysql.connection.rollback()
        cur.close()
        return jsonify({"error": "Failed to update the club"}), 400
    try:
        if data["image"]:
            cur.execute(
                "UPDATE club SET club_logo = %s, logo_prefix = %s WHERE club_id = %s",
                (
                    base64.b64decode(data["image"].split(",")[1]),
                    data["image"].split(",")[0],
                    data["id"],
                ),
            )
    except Exception as e:
        print(e)
        mysql.connection.rollback()
        cur.close()
        return (
            jsonify(
                {
                    "error": "Failed to update the club, something may be wrong with the logo."
                }
            ),
            400,
        )
    if data["images"]:
        try:
            cur.execute(
                "DELETE FROM club_photo WHERE club_id = %s",
                (data["id"],),
            )
            for image in data["images"]:
                cur.execute(
                    "INSERT INTO club_photo (club_id, image, image_prefix) VALUES (%s, %s, %s)",
                    (
                        data["id"],
                        base64.b64decode(image["image"].split(",")[1]),
                        image["image"].split(",")[0],
                    ),
                )
        except Exception as e:
            print(e)
            mysql.connection.rollback()
            cur.close()
            return (
                jsonify(
                    {
                        "error": "Failed to update the club, something may be wrong with the images."
                    }
                ),
                400,
            )
    # Add the tags
    cur.execute("DELETE FROM club_tags WHERE club_id = %s", (data["id"],))
    for tag in data["tags"]:
        try:
            cur.execute(
                "INSERT INTO club_tags (club_id, tag_id) VALUES (%s, %s)",
                (data["id"], tag["value"]),
            )
        except Exception as e:
            print(e)
            mysql.connection.rollback()
            cur.close()
            return jsonify({"error": f"Tag {tag['label']} does not exist"}), 400
        if data["admins"]:
            try:
                # Fetch existing admin user_ids for the club
                cur.execute(
                    "SELECT user_id FROM club_admin WHERE club_id = %s",
                    (data["id"],),
                )
                existing_admins = {admin[0] for admin in cur.fetchall()}
            except Exception as e:
                print(e)
                mysql.connection.rollback()
                cur.close()
                return (
                    jsonify(
                        {
                            "error": "Failed to update the club, something may be wrong with the admin emails."
                        }
                    ),
                    400,
                )

            # Determine the new admins
            new_admins = {admin["user"] for admin in data["admins"]}

            try:
                # Set is_active to 0 for admins no longer in the list
                inactive_admins = existing_admins - new_admins
                if inactive_admins:
                    cur.execute(
                        "UPDATE club_admin SET is_active = 0 WHERE club_id = %s AND user_id IN %s",
                        (data["id"], tuple(inactive_admins)),
                    )

                # Reactivate admins who are inactive
                for admin in new_admins:
                    if admin in existing_admins:
                        cur.execute(
                            "UPDATE club_admin SET is_active = 1 WHERE club_id = %s AND user_id = %s",
                            (data["id"], admin),
                        )
                    else:
                        # Insert new admins
                        cur.execute(
                            "INSERT INTO club_admin (user_id, club_id, is_active) VALUES (%s, %s, 1)",
                            (admin, data["id"]),
                        )
            except Exception as e:
                print(e)
                mysql.connection.rollback()
                cur.close()
                return (
                    jsonify(
                        {
                            "error": "Failed to update the club, something may be wrong with the admin emails."
                        }
                    ),
                    400,
                )
    mysql.connection.commit()
    cur.close()
    return jsonify({"message": "Club updated successfully"}), 200


@app.route("/api/delete-club/<club_id>", methods=["DELETE"])
def delete_club(club_id):
    cur = mysql.connection.cursor()
    mysql.connection.rollback()
    try:
        cur.execute("UPDATE club SET is_active = 0 WHERE club_id = %s", (int(club_id),))
        cur.execute(
            "UPDATE club_admin SET is_active = 0 WHERE club_id = %s", (int(club_id),)
        )
    except Exception as e:
        print(e)
        mysql.connection.rollback()
        cur.close()
        return jsonify({"error": "Failed to delete the club"}), 400
    mysql.connection.commit()
    cur.close()
    return jsonify({"message": "Club deleted successfully"}), 200


@app.route("/api/new-club", methods=["POST"])
def new_club():
    data = request.json
    cur = mysql.connection.cursor()

    # Check if a club with the same name already exists
    cur.execute(
        "SELECT COUNT(*) FROM club WHERE is_active = 1 AND club_name = %s",
        (data["name"],),
    )
    if not (cur.fetchone()[0] == 0):
        return jsonify({"error": "An active club with this name already exists."}), 400

    # Create the new club instance
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
        mysql.connection.rollback()
        cur.close()
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
            mysql.connection.rollback()
            cur.close()
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
            mysql.connection.rollback()
            cur.close()
            return (
                jsonify({"error": "Failed to create new photo. It may be too large."}),
                400,
            )

    # Add the tags
    for tag in data["tags"]:
        try:
            cur.execute(
                "INSERT INTO club_tags (club_id, tag_id) VALUES (%s, %s)",
                (new_club_id, tag["value"]),
            )
        except Exception as e:
            print(e)
            mysql.connection.rollback()
            cur.close()
            return jsonify({"error": f"Tag {tag['label']} does not exist"}), 400

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

    cur = mysql.connection.cursor()
    cur.execute(
        "INSERT INTO users(EMAIL, EMAIL_VERIFIED, PWD1, GENDER, IS_FACULTY, CAN_DELETE_FACULTY, IS_ACTIVE, SCHOOL_ID, NAME) VALUES (%s, 0, %s, %s, 0,0,1,1,%s)",
        (email, hashed_password, gender, name),
    )
    mysql.connection.commit()
    results = cur.fetchall()

    session["user_id"] = email
    session["last_activity"] = datetime.now(timezone.utc)

    cur.close()
    return jsonify({"message ": "User Success!"}), 200


@app.route("/api/getinterests")
def getinterests():
    """Fetch the current user's selected interests from the database."""
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "User not logged in"}), 401

    cur = mysql.connection.cursor()
    try:
        cur.execute(
            """
            SELECT t.tag_name
            FROM tag t
            INNER JOIN user_tags ut ON t.tag_id = ut.tag_id
            WHERE ut.user_id = %s
            """,
            (user_id,),
        )
        result = cur.fetchall()
        interests = [row[0] for row in result]
        return jsonify({"interests": interests}), 200
    except Exception as e:
        print(f"Error fetching interests: {e}")
        return jsonify({"error": "Failed to fetch interests"}), 500
    finally:
        cur.close()


@app.route("/api/getallinterests")
def getallinterests():
    """Fetch all available interests."""
    cur = mysql.connection.cursor()
    try:
        cur.execute("SELECT tag_name FROM tag")
        result = cur.fetchall()
        all_interests = [row[0] for row in result]
        return jsonify({"interests": all_interests}), 200
    except Exception as e:
        print(f"Error fetching all interests: {e}")
        return jsonify({"error": "Failed to fetch all interests"}), 500
    finally:
        cur.close()


@app.route("/api/editinterestpage", methods=["POST"])
def editinterestpage():
    """Update the current users interests"""
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "User not logged in"}), 401

    data = request.json
    if not data or not isinstance(data.get("interests"), list):
        return jsonify({"error": "Invalid data provided"}), 400

    interests = data["interests"]

    cur = mysql.connection.cursor()
    try:
        # Step 1: Clear existing user interests
        cur.execute("DELETE FROM user_tags WHERE user_id = %s", (user_id,))
        mysql.connection.commit()

        # Step 2: Insert new interests
        for interest in interests:
            cur.execute("SELECT tag_id FROM tag WHERE tag_name = %s", (interest,))
            tag_result = cur.fetchone()

            if tag_result:
                tag_id = tag_result[0]
                cur.execute(
                    "INSERT INTO user_tags (user_id, tag_id) VALUES (%s, %s)",
                    (user_id, tag_id),
                )
            else:
                print(f"Tag not found for interest: {interest}")

        mysql.connection.commit()
        return jsonify({"message": "Interests updated successfully"}), 200
    except Exception as e:
        print(f"Error updating interests: {e}")
        mysql.connection.rollback()
        return jsonify({"error": "Failed to update interests"}), 500
    finally:
        cur.close()
        print(f"Error occurred: {str(e)}")  # Log any exceptions
        return jsonify({"error": str(e)}), 500


@app.route("/api/add_tag", methods=["POST"])
def add_tag():

    try:
        # Parse the JSON request data
        data = request.json
        tag_name = data.get("tag_name")

        if not tag_name:
            return jsonify({"error": "Tag name is required"}), 400

        # Insert tag into the database
        cursor = mysql.connection.cursor()
        query = "INSERT INTO tag (tag_name) VALUES (%s)"
        cursor.execute(query, (tag_name,))
        mysql.connection.commit()
        cursor.close()

        return jsonify({"message": f"Interest '{tag_name}' added successfully!"}), 201

    except mysql.connection.IntegrityError:
        return jsonify({"error": f"Interest '{tag_name}' already exists."}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/remove_tag", methods=["DELETE"])
def remove_tag():
    try:
        # Parse the JSON request data
        data = request.json
        tag_name = data.get("tag_name")

        if not tag_name:
            return jsonify({"error": "Interest name is required"}), 400

        # Delete tag from the database
        cursor = mysql.connection.cursor()
        query = "DELETE FROM tag WHERE tag_name = %s"
        cursor.execute(query, (tag_name,))
        mysql.connection.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": f"Interest '{tag_name}' does not exist."}), 404

        cursor.close()

        return jsonify({"message": f"Interest '{tag_name}' removed successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Configure your upload folder and allowed extensions
UPLOAD_FOLDER = "uploads/"  # Specify your uploads folder
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


def allowed_file(filename):
    """Check if the file is allowed based on its extension"""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def get_club_id(cur, club_name):
    cur.execute("SELECT club_id FROM club WHERE club_name = %s", (club_name,))
    result = cur.fetchone()
    if result:
        return result[0]
    else:
        raise ValueError("Club not found")


import json


@app.route("/api/club/events", methods=["POST"])
def create_event():
    # Check if the user is logged in
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "User not logged in"}), 401

    # Get the event data from the request
    club_name = request.form.get("clubName")
    event_name = request.form.get("eventName")
    description = request.form.get("description")
    start_date = request.form.get("startDate")
    end_date = request.form.get("endDate")
    location = request.form.get("location")
    event_cost = request.form.get("eventCost")
    tags = request.form.get("tags")  # This should be a JSON string (e.g., "[1, 2, 3]")

    if tags:
        try:
            # Convert the tags string into a list of integers
            tags = json.loads(
                tags
            )  # This will handle strings like "[1, 2, 3]" as a Python list
        except json.JSONDecodeError:
            return (
                jsonify({"error": "Invalid tags format, should be a JSON array"}),
                400,
            )
    else:
        tags = []

    # Validate the data
    if (
        not event_name
        or not description
        or not start_date
        or not end_date
        or not location
    ):
        return jsonify({"error": "Missing required fields"}), 400

    # Validate event cost (set to None if empty or invalid)
    try:
        if event_cost:
            event_cost = float(event_cost)  # Try to convert the cost to a float
        else:
            event_cost = None  # If no cost is provided, set it to None (nullable)
    except ValueError:
        return jsonify({"error": "Invalid event cost value"}), 400

    # Handle file uploads
    event_photos = request.files.getlist("eventPhotos[]")
    saved_photos = []

    for photo in event_photos:
        if photo and allowed_file(photo.filename):
            filename = secure_filename(photo.filename)
            image_data = photo.read()  # Read the image file into binary data
            saved_photos.append((image_data, filename))  # Store image data and filename

    try:
        # Updated date parsing logic
        try:
            # Handle ISO 8601 with milliseconds and 'Z' for UTC
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%dT%H:%M:%S.%fZ")
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%dT%H:%M:%S.%fZ")
        except ValueError:
            try:
                # Fallback if no milliseconds are present
                start_date_obj = datetime.strptime(start_date, "%Y-%m-%dT%H:%M:%SZ")
                end_date_obj = datetime.strptime(end_date, "%Y-%m-%dT%H:%M:%SZ")
            except ValueError as e:
                return jsonify({"error": f"Invalid date format: {str(e)}"}), 400

        # Insert the event into the database
        cur = mysql.connection.cursor()
        cur.execute(
            """INSERT INTO event (event_name, start_time, end_time, location, description, cost, school_id)
               VALUES (%s, %s, %s, %s, %s, %s, %s)""",
            (
                event_name,
                start_date_obj,
                end_date_obj,
                location,
                description,
                event_cost,
                "1",
            ),
        )
        event_id = cur.lastrowid  # Get the ID of the newly created event

        # Optional: Associate tags with the event
        for tag in tags:
            try:
                tag_id = int(tag)  # Ensure tag is an integer
                cur.execute(
                    """INSERT INTO event_tags (event_id, tag_id) VALUES (%s, %s)""",
                    (event_id, tag_id),
                )
            except ValueError:
                return jsonify({"error": f"Invalid tag format: {tag}"}), 400
            except Exception as e:
                return jsonify({"error": f"Failed to insert tag: {str(e)}"}), 500

        # insert club_id and event_id into event_host table**
        club_id = get_club_id(cur, club_name)
        print(club_id)
        print(club_name)

        cur.execute(
            """INSERT INTO event_host (club_id, event_id) VALUES (%s, %s)""",
            (club_id, event_id),
        )

        # Save photos into the database as blobs and store the file names
        for image_data, filename in saved_photos:
            try:
                image_prefix = filename  # You can store the filename as the prefix
                cur.execute(
                    """INSERT INTO event_photo (event_id, IMAGE, IMAGE_PREFIX) 
                    VALUES (%s, %s, %s)""",
                    (event_id, image_data, image_prefix),
                )
            except Exception as e:
                return jsonify({"error": f"Failed to insert photo: {str(e)}"}), 500

        mysql.connection.commit()  # Commit the transaction
        cur.close()

        # Return a success response
        return jsonify({"message": "Event created successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to create event: {str(e)}"}), 500


@app.route("/api/passwordReset", methods=["POST"])
def reset_password():
    data = request.json
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
        {"email": data["email"], "exp": datetime.utcnow() + timedelta(minutes=15)},
        app.config["SECRET_KEY"],
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
    send_email(str(data["email"]), reset_link)
    return jsonify({"message": "Reset link sent to your email"}), 200


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


@app.route("/api/rsvp", methods=["POST"])
def RSVP():
    event_id = request.args.get("event_id")  # Event ID
    print(event_id)
    user_id = session.get("user_id")
    typeofRSVP = request.args.get("type")  # Type parameter

    # Validate input parameters
    if not event_id or not user_id or not typeofRSVP:
        return jsonify({"error": "Missing event_id, user_id, or type parameter"}), 400

    try:
        cur = mysql.connection.cursor()

        # Check if the user_id exists
        cur.execute("SELECT COUNT(*) FROM users WHERE email = %s", (user_id,))
        user_exists = cur.fetchone()[0]

        if not user_exists:
            return jsonify({"error": "Invalid user_id"}), 400

        if typeofRSVP == "block":
            # Insert or update the RSVP to set is_yes to False
            cur.execute(
                """INSERT INTO rsvp (event_id, user_id, is_yes, is_active)
                     VALUES (%s, %s, FALSE, TRUE)
                     ON DUPLICATE KEY UPDATE is_yes = FALSE, is_active = TRUE
                """,
                (event_id, user_id),
            )
            mysql.connection.commit()
            return jsonify({"message": "RSVP set to 'block'"}), 200

        elif typeofRSVP == "rsvp":
            # Insert or update the RSVP to set is_yes to True
            cur.execute(
                """INSERT INTO rsvp (event_id, user_id, is_yes, is_active)
                    VALUES (%s, %s, TRUE, TRUE)
                    ON DUPLICATE KEY UPDATE is_yes = TRUE, is_active = TRUE
                """,
                (event_id, user_id),
            )
            mysql.connection.commit()
            return jsonify({"message": "RSVP set to 'rsvp'"}), 200

        elif typeofRSVP == "cancel":
            # Delete RSVP from the database
            cur.execute(
                """UPDATE rsvp 
                    SET is_active = FALSE 
                    WHERE event_id = %s AND user_id = %s
                """,
                (event_id, user_id),
            )
            mysql.connection.commit()
            return jsonify({"message": "RSVP deleted"}), 200

        else:
            return jsonify({"error": "Invalid type parameter"}), 400

    except Exception as e:
        # Rollback in case of an error
        mysql.connection.rollback()
        print(e)
        return jsonify({"error": str(e)}), 500

    finally:
        # Close the cursor
        cur.close()


@app.route("/api/checkRSVP/<event_id>", methods=["GET"])
def checkRSVP(event_id):
    user_id = session.get("user_id")
    try:
        cur = mysql.connection.cursor()

        cur.execute(
            "SELECT is_yes FROM rsvp WHERE event_id = %s AND user_id = %s",
            (event_id, user_id),
        )
        result = cur.fetchone()

        if result is None:
            return jsonify({"rsvp": None}), 200
        else:
            rsvp_type = result[0]
            if rsvp_type == 0:
                return jsonify({"rsvp": "block"}), 200
            elif rsvp_type == 1:
                return jsonify({"rsvp": "rsvp"}), 200
            else:
                return jsonify({"error": "Invalid RSVP type"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()


# check subscription


@app.route("/api/check_subscription", methods=["POST"])
def check_subscription():
    data = request.json

    user_id = data.get("userId")

    club_id = data.get("clubId")

    if not user_id or not club_id:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        cur = mysql.connection.cursor()
        # Query the database to check subscription

        cur.execute(
            """

            SELECT is_active FROM user_subscription
            WHERE email = %s AND club_id = %s

        """,
            (user_id, club_id),
        )

        result = cur.fetchone()

        if result and result[0] == 1:
            return jsonify({"isSubscribed": True}), 200
        else:
            return jsonify({"isSubscribed": False}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": "Database operation failed"}), 500


# Handle subscribe and unsubscribe actions


@app.route("/api/subscribe", methods=["POST"])
def manage_subscription():
    data = request.json

    action = data.get("action")

    club_id = data.get("clubId")

    user_id = data.get("userId")  # Ensure this matches the query string

    print(f"Received data: {data}")
    print(f"Query parameters: user_id={user_id}")

    # Validate input
    if not user_id or not club_id or not action:
        print("Error: Missing required fields")
        return jsonify({"error": "Missing required fields"}), 400

    try:
        cur = mysql.connection.cursor()

        if action == "subscribe":

            # Check if subscription exists
            subscription = cur.execute(
                """
                SELECT * FROM user_subscription
                WHERE email = %s AND club_id = %s
                """,
                (user_id, club_id),
            )
            subscription = cur.fetchone()

            if subscription:
                # Update existing subscription
                cur.execute(
                    """
                    UPDATE user_subscription

                    SET is_active = 1, subscribed_or_blocked = 1

                    WHERE email = %s AND club_id = %s
                    """,
                    (user_id, club_id),
                )
            else:
                # Insert new subscription
                cur.execute(
                    """

                    INSERT INTO user_subscription (email, club_id, is_active, subscribed_or_blocked)

                    VALUES (%s, %s, 1, 1)

                    """,
                    (user_id, club_id),
                )

        elif action == "unsubscribe":

            # Deactivate subscription
            cur.execute(
                """
                UPDATE user_subscription
                SET is_active = 0
                WHERE email = %s AND club_id = %s
                """,
                (user_id, club_id),
            )

        mysql.connection.commit()
        return jsonify({"success": True}), 200

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": "Database operation failed"}), 500


@app.route("/api/assignFaculty", methods=["POST"])
def assignFaculty():
    data = request.get_json()

    # Validate input
    email = data.get("email")
    can_delete = data.get("can_delete_faculty")

    if not email or not isinstance(can_delete, bool):
        return jsonify({"error": "Invalid input"}), 400

    try:
        cur = mysql.connection.cursor()

        # Check if user exists and email is verified
        cur.execute(
            """SELECT name, email_verified
               FROM users
               WHERE email = %s
                 AND is_active = 1""",
            (email,),
        )
        result = cur.fetchone()

        # If no matching email is found, return an error
        if result is None:
            return jsonify({"error": "Invalid email"}), 404

        # Check if email is verified
        is_email_verified = result[1]
        if not is_email_verified:
            return jsonify({"error": "Email not verified"}), 403

        # Update faculty status
        cur.execute(
            """UPDATE users
               SET is_faculty = 1,
                   can_delete_faculty = %s
               WHERE email = %s""",
            (can_delete, email),
        )
        mysql.connection.commit()
        return (
            jsonify(
                {"name": result[0], "email": email, "can_delete_faculty": can_delete}
            ),
            200,
        )
        # return jsonify({"message": "Faculty assigned successfully"}), 200

    except Exception as e:
        # Log the error and return an internal server error
        print(f"Error assigning faculty: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

    finally:
        cur.close()


@app.route("/api/getFacultyData", methods=["GET"])
def get_faculty_data():
    try:
        # Connect to the database
        cur = mysql.connection.cursor()

        # Query to fetch faculty data
        cur.execute(
            """
            SELECT name, email, can_delete_faculty 
            FROM users
            WHERE is_faculty = 1
        """
        )
        result = cur.fetchall()

        # Convert result into a list of dictionaries
        faculty_list = [
            {"name": row[0], "email": row[1], "can_delete_faculty": bool(row[2])}
            for row in result
        ]

        # Return the data as JSON
        return jsonify(faculty_list), 200

    except Exception as e:
        app.logger.error(f"Error fetching faculty data: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

    finally:
        if "cur" in locals() and cur:
            cur.close()


@app.route("/api/removeFaculty", methods=["POST"])
def remove_faculty():
    data = request.get_json()
    try:
        # connect to the database
        cur = mysql.connection.cursor()

        # Query to remove faculty privileges
        cur.execute(
            """
            UPDATE users
            SET is_faculty = 0,
                can_delete_faculty = 0
            WHERE email = %s""",
            (data["email"],),
        )
        mysql.connection.commit()
        return jsonify({"message": "Faculty privileges removed"}), 200

    except Exception as e:
        # Log the error and return an internal server error
        print(f"Error removing faculty: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

    finally:
        cur.close()


@app.route("/api/assignDelete", methods=["POST"])
def assign_delete():
    data = request.get_json()

    try:
        # Connect to the database
        cur = mysql.connection.cursor()

        # Query to change deletion abilities
        cur.execute(
            """UPDATE users
                SET can_delete_faculty = %s
                WHERE email = %s""",
            (
                data["cdf"],
                data["email"],
            ),
        )
        mysql.connection.commit()
        return jsonify({"message": "Deletion ablilities removed"}), 200

    except Exception as e:
        # Log the error and return an internal server error
        print(f"Error removing faculty: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

    finally:
        cur.close()


if __name__ == "__main__":
    app.run(debug=True, port=3000)
