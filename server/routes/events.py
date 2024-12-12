import base64
from datetime import datetime
from flask import Blueprint, jsonify, session, request
import pytz
from extensions import mysql
from config import Config
import json
from werkzeug.utils import secure_filename


events_bp = Blueprint("events", __name__)


def allowed_file(filename):
    """Check if the file is allowed based on its extension"""
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in Config.ALLOWED_EXTENSIONS
    )


def get_club_id(cur, club_name):
    cur.execute("SELECT club_id FROM club WHERE club_name = %s", (club_name,))
    result = cur.fetchone()
    if result:
        return result[0]
    else:
        raise ValueError("Club not found")


@events_bp.route("/event/<event_id>", methods=["GET"])
def get_event(event_id):
    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
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


@events_bp.route("/club-events/<club_id>", methods=["GET"])
def get_club_events(club_id):
    start_date = request.args.get("start_date")
    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
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
    cur.close()
    return jsonify({"events": final_result}), 200


@events_bp.route("/events", methods=["GET"])
def get_events():
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    if start_date is not None and end_date is not None:
        try:
            start_date = datetime.fromisoformat(start_date).strftime("%Y-%m-%d")
            end_date = datetime.fromisoformat(end_date).strftime("%Y-%m-%d")
            if not mysql.connection:
                return jsonify({"error": "Database connection error"}), 500
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


@events_bp.route("/new-event", methods=["POST"])
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
        if photo and allowed_file(photo.filename) and photo.filename is not None:
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
        if not mysql.connection:
            return jsonify({"error": "Database connection error"}), 500
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
