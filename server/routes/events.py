import base64
from datetime import datetime, timedelta, timezone
from flask import Blueprint, jsonify, logging, session, request
import jwt
import pytz
from extensions import mysql
from config import Config
import json
from helper.check_user import get_user_session_info
import traceback
from helper.send_email import send_email
import pytz
from dotenv import load_dotenv
import os
from flask_cors import CORS


events_bp = Blueprint("events", __name__)

# Apply CORS to this specific blueprint
CORS(events_bp, supports_credentials=True)

mail = None

# Load environment variables from .env file
load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")


# Check if the file is allowed based on its extension
def allowed_file(filename):
    """
    Validate if an uploaded file has an allowed image file extension.

    This function checks whether the uploaded file has an extension
    that is considered safe and acceptable for image uploads.

    Args:
        filename (str): The name of the file to be validated

    Returns:
        bool: True if the file extension is allowed, False otherwise

    Allowed File Extensions:
    - .png (Portable Network Graphics)
    - .jpg, .jpeg (Joint Photographic Experts Group)
    - .gif (Graphics Interchange Format)
    - .webp (Web Picture Format)

    Behavior:
    - Converts filename to lowercase to ensure case-insensitive matching
    - Checks file extension against a predefined set of allowed extensions
    - Returns False for files with no extension or unrecognized extensions

    Security Considerations:
    - Prevents upload of potentially malicious file types
    - Limits file uploads to common image formats
    - Case-insensitive extension checking
    """
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in Config.ALLOWED_EXTENSIONS
    )


def get_club_id(cur, club_name):
    """
    Retrieve the club ID for a given club name.

    Args:
        cur (mysql.connection.cursor): Active database cursor
        club_name (str): Name of the club to look up

    Returns:
        int: The unique identifier for the club

    Raises:
        ValueError: If no club is found with the given name

    Behavior:
    - Queries the club table for the matching club name
    - Returns the first column (club_id) if found
    - Raises an exception if no matching club exists
    """
    cur.execute(
        "SELECT club_id FROM club WHERE club_name = %s AND is_active = 1 AND school_id = %s",
        (club_name, session.get("school")),
    )
    result = cur.fetchone()
    if result:
        return result[0]
    else:
        raise ValueError("Club not found")


def get_events_by_date(
    cur, start_date, end_date, school_id, user_id, filter_query="", approved=True
):
    """
    Retrieve events within a specified date range for a specific school.

    This function fetches all active and approved events occurring between
    the given start and end dates for a particular school.

    Args:
        cur (mysql.connection.cursor): Active database cursor for executing queries
        start_date (str): ISO 8601 formatted start date to retrieve events from
        end_date (str): ISO 8601 formatted end date to retrieve events until
        school_id (int): Unique identifier of the school to filter events
        user_id (int): Unique identifier of the user
        filter_query (str): Optional filter query to further refine event retrieval
            - 'Hosted by Subscribed Clubs' for events from clubs the user is subscribed to
            - 'Attending' for events the user has RSVP'd to
            - 'Suggested' for events that share tags with the user
        approved (bool): Optional flag to filter events by approval status (default: True)

    Returns:
        dict: A dictionary containing:
            - On successful retrieval:
                {
                    'events': [
                        {
                            'id': int,
                            'startTime': str,
                            'endTime': str,
                            'location': str,
                            'description': str,
                            'cost': float,
                            'title': str,
                            'host': [{'name': str, 'id': int}],
                            'rsvp': str or None,
                            'tags': [str],
                            'subscribed': bool,
                            'image': str,
                            'genderRestriction': str
                        }
                    ]
                }
            - On no events found: {'error': 'No events found'}

    Behavior:
    - Converts input dates to 'YYYY-MM-DD' format
    - Filters events that are:
        * Active (is_active = 1)
        * Approved (is_approved = 1)
        * Within the specified date range
        * Belonging to the specified school
    - Retrieves event details and their hosting clubs
    - Supports empty result sets
    """
    try:
        start_date = datetime.fromisoformat(start_date).strftime("%Y-%m-%d")
        end_date = datetime.fromisoformat(end_date).strftime("%Y-%m-%d")
        cur.execute(
            """SELECT e.event_id,
                      e.start_time, 
                      e.end_time, 
                      e.location, 
                      e.description, 
                      e.cost, 
                      e.event_name,
                      GROUP_CONCAT(DISTINCT eh.club_id SEPARATOR ','),
                      GROUP_CONCAT(DISTINCT c.club_name SEPARATOR ','),
                      r.is_yes,
                      GROUP_CONCAT(DISTINCT t.tag_name SEPARATOR ','),
                      CASE 
                        WHEN MAX(CASE WHEN us.subscribed_or_blocked = 1 THEN 1 ELSE 0 END) = 1 THEN 1
                        WHEN MAX(CASE WHEN us.subscribed_or_blocked = 0 THEN 1 ELSE 0 END) = 1 THEN 0
                        ELSE NULL
                      END AS is_subscribed,
                      (SELECT image_prefix
                        FROM event_photo
                        WHERE event_id = e.event_id
                        ORDER BY event_photo_id
                        LIMIT 1) AS image_prefix,
                      (SELECT image
                        FROM event_photo
                        WHERE event_id = e.event_id
                        ORDER BY event_photo_id
                        LIMIT 1) AS image,
                      (SELECT event_photo_id
                        FROM event_photo
                        WHERE event_id = e.event_id
                        ORDER BY event_photo_id
                        LIMIT 1) AS image_id,
                      e.gender_restriction
                FROM event e
                LEFT JOIN event_host eh
                    ON eh.event_id = e.event_id
                    AND eh.is_approved = 1
                LEFT JOIN club c
                    ON c.club_id = eh.club_id
                    AND c.is_active = 1
                LEFT JOIN rsvp r
                    ON r.event_id = e.event_id
                    AND r.user_id = %s
                    AND r.is_active = 1
                LEFT JOIN event_tags et
                    ON et.event_id = e.event_id
                LEFT JOIN tag t
                    ON t.tag_id = et.tag_id
                LEFT JOIN event_photo ep
                    ON ep.event_id = e.event_id
                LEFT JOIN user_subscription us
                    ON us.club_id = eh.club_id
                    AND us.email = %s
                    AND us.is_active = 1
                    AND eh.event_id = e.event_id
                LEFT JOIN users u
                    ON u.email = %s
                WHERE e.start_time BETWEEN %s AND %s
                    AND e.is_active = 1
                    AND e.is_approved = %s
                    AND e.school_id = %s
                    AND (r.is_yes = 1 OR %s <> 'Attending')
                    AND ((e.gender_restriction IS NULL) 
                        OR (e.gender_restriction = u.gender) 
                        OR (u.is_faculty = 1))
                GROUP BY e.event_id, e.start_time, e.end_time, e.location, e.description, e.cost, e.event_name
                HAVING (is_subscribed = 1 OR (%s <> 'Hosted by Subscribed Clubs'))
                    AND ((is_subscribed <> 0 OR is_subscribed IS NULL) OR (%s <> 'Suggested'))
                    AND (is_subscribed = 1
                            OR %s <> 'Suggested'
                            OR r.is_yes = 1
                            OR EXISTS
                                (SELECT * FROM user_tags ut
                                    INNER JOIN event_tags et2
                                        ON et2.event_id = e.event_id
                                            AND et2.tag_id = ut.tag_id
                                    WHERE ut.user_id = %s))""",
            (
                user_id,
                user_id,
                user_id,
                start_date,
                end_date,
                approved,
                school_id,
                filter_query,
                filter_query,
                filter_query,
                filter_query,
                user_id,
            ),
        )
        result = cur.fetchall()
        if result is None:
            return {"error": "No events found", "status": 404}
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
                    "host": [
                        {"id": id_val, "name": name_val}
                        for id_val, name_val in zip(
                            [] if x[7] is None else x[7].split(","),
                            [] if x[8] is None else x[8].split(","),
                        )
                    ],
                    "rsvp": "" if x[9] is None else ("rsvp" if x[9] else "block"),
                    "tags": [] if x[10] is None else x[10].split(","),
                    "subscribed": True if x[11] == 1 else False,
                    "blocked": True if x[11] == 0 else False,
                    "image": {
                        "image": (
                            f"{x[12]},{base64.b64encode(x[13]).decode('utf-8')}"
                            if (x[12] is not None and x[13] is not None)
                            else None
                        ),
                        "id": x[14],
                    },
                    "genderRestriction": x[15],
                },
                result,
            )
        )
        cur.close()
        return {"events": final_result}
    except ValueError:
        return {"error": "Invalid date format", "status": 400}
    except Exception as e:
        print(f"Error fetching events: {e}")
        return {"error": "Failed to fetch events", "status": 500}


@events_bp.route("/event-photos", methods=["GET"])
def get_all_event_photos():
    """
    Retrieve all event photos.

    This endpoint fetches all event photos from the database.

    Returns:
        JSON response:
        - On successful retrieval:
            {
                "photos": [
                    {
                        "event_id": int,
                        "photo_id": int,
                        "image": str (base64 encoded),
                        "image_prefix": str
                    }
                ]
            }, 200 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
    """
    try:
        if not mysql.connection:
            return jsonify({"error": "Database connection error"}), 500

        cur = mysql.connection.cursor()
        cur.execute(
            """SELECT event_id, event_photo_id, image, image_prefix FROM event_photo"""
        )
        result = cur.fetchall()
        cur.close()

        photos = [
            {
                "event_id": row[0],
                "photo_id": row[1],
                "image": base64.b64encode(row[2]).decode("utf-8"),
                "image_prefix": row[3],
            }
            for row in result
        ]

        return jsonify({"photos": photos}), 200

    except Exception as e:
        print(f"Error fetching event photos: {e}")
        return jsonify({"error": "Failed to fetch event photos"}), 500


def send_faculty_approval_email(event_id):
    try:
        cur = mysql.connection.cursor()
        # Fetch event name
        cur.execute("SELECT event_name FROM event WHERE event_id = %s", (event_id,))
        event_name = cur.fetchone()[0]

        # Fetch club admins
        cur.execute(
            """SELECT c.club_name, u.email FROM event_host eh
               INNER JOIN club c ON c.club_id = eh.club_id
               INNER JOIN club_admin ca ON ca.club_id = c.club_id
               INNER JOIN users u ON u.email = ca.user_id
               WHERE eh.event_id = %s AND c.is_active = 1 AND eh.is_approved = 1""",
            (event_id,),
        )
        club_admins = cur.fetchall()
        cur.close()

        if not club_admins:
            print(f"No club admins found for event ID {event_id}")
            return

        for club_name, email in club_admins:
            subject = "Event Approved"
            body = f"Dear {club_name} Admin,\n\nGood news! Your event '{event_name}' has been approved by the faculty.\n\nBest regards,\nSHARC Team"
            send_email(email, subject, body)
            print(f"Approval email sent to {email}")

    except Exception as e:
        print(f"Error sending approval email: {e}")


def send_faculty_decline_email(event_id):
    try:
        cur = mysql.connection.cursor()
        # Fetch event name
        cur.execute("SELECT event_name FROM event WHERE event_id = %s", (event_id,))
        event_name = cur.fetchone()[0]

        # Fetch club admins
        cur.execute(
            """SELECT c.club_name, u.email FROM event_host eh
               INNER JOIN club c ON c.club_id = eh.club_id
               INNER JOIN club_admin ca ON ca.club_id = c.club_id
               INNER JOIN users u ON u.email = ca.user_id
               WHERE eh.event_id = %s AND c.is_active = 1 AND eh.is_approved = 1""",
            (event_id,),
        )
        club_admins = cur.fetchall()
        cur.close()

        if not club_admins:
            print(f"No club admins found for event ID {event_id}")
            return

        for club_name, email in club_admins:
            subject = "Event Declined"
            body = f"Dear {club_name} Admin,\n\nUnfortunately, your event '{event_name}' has been declined by the faculty.\n\nBest regards,\nSHARC Team"
            send_email(email, subject, body)
            print(f"Decline email sent to {email}")

    except Exception as e:
        print(f"Error sending decline email: {e}")


import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)


@events_bp.route("/approve_event", methods=["POST"])
def approve_event():
    """Approve an event by setting is_approved to 1"""
    data = request.json
    event_id = data.get("event_id")

    if not event_id:
        return jsonify({"error": "Missing event_id"}), 400

    try:
        cur = mysql.connection.cursor()
        cur.execute("UPDATE event SET is_approved = 1 WHERE event_id = %s", (event_id,))
        mysql.connection.commit()
        cur.close()

        # Send approval email
        send_faculty_approval_email(event_id)

        return jsonify({"message": "Event approved successfully"}), 200
    except Exception as e:
        logging.error(f"Error approving event: {e}")
        return jsonify({"error": str(e)}), 500


@events_bp.route("/decline_event", methods=["POST"])
def decline_event():
    """Decline an event by setting is_approved to 0 and is_active to 0"""
    data = request.json
    event_id = data.get("event_id")

    if not event_id:
        return jsonify({"error": "Missing event_id"}), 400

    try:
        cur = mysql.connection.cursor()
        cur.execute(
            "UPDATE event SET is_approved = 0, is_active = 0 WHERE event_id = %s",
            (event_id,),
        )
        mysql.connection.commit()
        cur.close()

        # Send decline email
        send_faculty_decline_email(event_id)

        return jsonify({"message": "Event declined successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@events_bp.route("/event/<event_id>", methods=["GET"])
def get_event(event_id):
    """
    Retrieve detailed information for a specific event.

    This endpoint fetches comprehensive event details including:
    - Basic event information
    - Hosting clubs
    - User's RSVP status
    - Event tags
    - Event images
    - Gender restriction
    Authentication is required to access this endpoint.

    Args:
        event_id (str): Unique identifier for the event

    Returns:
        JSON response:
        - On successful retrieval:
            {
                "event": {
                    "id": int,
                    "startTime": str,
                    "endTime": str,
                    "location": str,
                    "description": str,
                    "cost": float,
                    "title": str,
                    "host": [{"name": str, "id": int}],
                    "rsvp": str or None,
                    "tags": [str],
                    "images": [
                        {
                            "id": int,
                            "image": str (base64 encoded)
                        }
                    ],
                    "genderRestriction": str
                }
            }, 200 status
        - On unauthorized access:
            {"error": "Unauthorized"}, 403 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On event not found:
            {"error": "Event not found"}, 404 status

    Behavior:
    - Requires an active MySQL database connection
    - Fetches event details from multiple database tables
    - Converts timestamps to UTC
    - Retrieves event hosts, RSVP status, tags, and images
    - Handles cases where optional data might be missing
    """
    # Check if user is authenticated
    current_user = get_user_session_info()
    if not current_user["user_id"]:
        return jsonify({"error": "Unauthorized"}), 403

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
    cur = mysql.connection.cursor()

    school_id = session.get("school")
    user_id = current_user.get("user_id")

    cur.execute(
        """SELECT e.event_id, e.start_time, e.end_time, e.location, e.description, e.cost, e.event_name, e.gender_restriction, e.is_approved FROM event e
            LEFT JOIN users u
                ON u.email = %s
            WHERE e.event_id = %s
                AND e.is_active = 1
                AND (e.is_approved = 1 OR u.is_faculty = 1)
                AND e.school_id = %s
                AND (e.gender_restriction = u.gender 
                    OR e.gender_restriction IS NULL
                    OR u.is_faculty = 1)""",
        (user_id, event_id, school_id),
    )
    result = cur.fetchone()
    if result is None:
        return jsonify({"error": "Event not found"}), 404

    cur.execute(
        """SELECT c.club_name, c.club_id FROM event_host eh
                INNER JOIN club c 
                    ON c.club_id = eh.club_id
                WHERE eh.event_id = %s
                    AND c.is_active = 1
                    AND c.school_id = %s
                    AND eh.is_approved = 1""",
        (event_id, school_id),
    )
    result_2 = list(map(lambda x: {"name": x[0], "id": x[1]}, cur.fetchall()))

    # Get RSVP status
    cur.execute(
        """SELECT is_yes FROM rsvp
                WHERE event_id = %s
                    AND user_id = %s
                    AND is_active = 1""",
        (event_id, user_id),
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
        "genderRestriction": result[7],
        "isApproved": result[8],
    }
    cur.close()
    return jsonify({"event": final_result}), 200


@events_bp.route("/event/<int:event_id>/cancel", methods=["POST", "DELETE"])
def cancel_event(event_id):
    try:
        user = get_user_session_info()
        # Fetch user information (assuming session contains user info)
        user_id = user["user_id"]
        if not user_id:
            return jsonify({"error": "Unauthorized"}), 403

        # Get event details to verify if the user is the organizer
        cur = mysql.connection.cursor()

        cur.execute(
            """SELECT u.email, ca.club_id, eh.event_id FROM users u
                    INNER JOIN club_admin ca
                        ON u.email = ca.user_id
                    INNER JOIN event_host eh
                        ON ca.club_id = eh.club_id
                    WHERE u.email = %s
                        AND u.is_active = 1
                        AND eh.is_approved = 1
                        AND eh.event_id = %s""",
            (user_id, event_id),
        )

        result = cur.fetchone()
        if not result:
            cur.close()
            print(
                f"User with ID {user_id} is not the organizer of event with ID {event_id}"
            )
            return jsonify({"error": "Unauthorized"}), 403

        # Log the event_id being passed
        print(f"Canceling event with ID: {event_id}")

        # Query to get the event and organizer details
        cur.execute(
            """SELECT e.event_name, r.user_id 
                FROM event e
                LEFT JOIN rsvp r
                    ON e.event_id = r.event_id
                WHERE e.event_id = %s 
                    AND e.is_active = 1
                    AND (r.is_active = 1 OR r.is_active IS NULL)
                    AND (r.is_yes = 1 OR r.is_yes IS NULL)""",  # CHANGE TO ORGANIZER ID
            (event_id,),
        )

        # # Check if the execute call was successful
        print("Query executed successfully")

        event = cur.fetchall()  # Fetch result
        if not event:
            cur.close()  # Don't forget to close the cursor
            print(f"Event with ID {event_id} not found")
            return jsonify({"error": "Event not found"}), 404

        # Log event details for debugging
        print(f"Event found: {event}")

        # Update the event status to inactive (cancel the event)
        cur.execute("UPDATE event SET is_active = 0 WHERE event_id = %s", (event_id,))

        for rsvp in event:
            cur.execute(
                "UPDATE rsvp SET is_active = 0 WHERE event_id = %s AND user_id = %s",
                (event_id, rsvp[1]),
            )
            if rsvp[1] is not None:
                send_email(
                    rsvp[1],
                    f"{rsvp[0]} has been cancelled",
                    f"Dear User,\n\nUnfortunately, the event {rsvp[0]} has been cancelled.\n\nBest regards,\nSHARC Team",
                )

        # Check if the update was successful
        print(f"Event with ID {event_id} canceled successfully")

        mysql.connection.commit()

        # Close the cursor
        cur.close()

        return jsonify({"message": "Event successfully canceled"}), 200

    except Exception as e:
        # Log the error message with more details
        print(f"Error canceling event: {e}")
        return jsonify({"error": "Failed to cancel event"}), 500


@events_bp.route("/club-events/<club_id>", methods=["GET"])
def get_club_events(club_id):
    """
    Retrieve events for a specific club from a given start date.

    This endpoint fetches upcoming events for a club, limited to 10 events,
    and includes the user's RSVP status for each event.
    Authentication is required to access this endpoint.

    Args:
        club_id (str): Unique identifier for the club

    Query Parameters:
        start_date (str, optional): ISO format date to start fetching events from

    Returns:
        JSON response:
        - On successful retrieval:
            {
                "events": [
                    {
                        "id": int,
                        "startTime": str,
                        "endTime": str,
                        "title": str,
                        "rsvp": str or None
                    }
                ]
            }, 200 status
        - On unauthorized access:
            {"error": "Unauthorized"}, 403 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status

    Behavior:
    - Requires an active MySQL database connection
    - Fetches up to 10 upcoming events for the specified club
    - Converts timestamps to UTC
    - Retrieves user's RSVP status for each event
    - Supports filtering events from a specific start date
    - Limits result set to prevent overwhelming response
    """
    # Check if user is authenticated
    current_user = get_user_session_info()
    if not current_user["user_id"]:
        return jsonify({"error": "Unauthorized"}), 403

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500

    school_id = session.get("school")
    user_id = current_user.get("user_id")

    # Get start date from query parameters
    start_date = request.args.get("start_date", datetime.now(pytz.utc).isoformat())

    cur = mysql.connection.cursor()
    cur.execute(
        """SELECT e.event_id, e.start_time, e.end_time, e.event_name FROM event e
            INNER JOIN event_host eh
                ON eh.event_id = e.event_id
            LEFT JOIN users u
                ON u.email = %s
            WHERE eh.club_id = %s
                AND (e.gender_restriction IS NULL OR e.gender_restriction = u.gender)
                AND e.is_active = 1
                AND e.is_approved = 1
                AND e.start_time >= %s
                AND e.school_id = %s
                AND eh.is_approved = 1
            LIMIT 10""",
        (user_id, club_id, start_date, school_id),
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
                    AND e.school_id = %s
                    AND eh.club_id = %s
                    AND eh.is_approved = 1""",
        (user_id, school_id, club_id),
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
    """
    Retrieve events within a specified date range.

    This endpoint fetches events occurring between a start and end date,
    providing a comprehensive view of events within a given time period.
    Authentication is required to access this endpoint.

    Query Parameters:
        start_date (str): ISO format start date for event range
        end_date (str): ISO format end date for event range
        filter (str): Optional filter query to further refine event retrieval
            - 'Hosted by Subscribed Clubs' for events from clubs the user is subscribed to
            - 'Attending' for events the user has RSVP'd to
            - 'Suggested' for events that share tags with the user
        approved (bool): Optional flag to filter events by approval status (default: True)

    Returns:
        JSON response:
        - On successful retrieval:
            {
                "events": [
                    {
                        "id": int,
                        "startTime": str,
                        "endTime": str,
                        "location": str,
                        "description": str,
                        "cost": float,
                        "title": str,
                        "subscribed": bool,
                        "genderRestriction": str
                    }
                ]
            }, 200 status
        - On unauthorized access:
            {"error": "Unauthorized"}, 403 status
        - On missing date parameters:
            {"error": "Missing required date parameters"}, 400 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
    """
    # Check if user is authenticated
    current_user = get_user_session_info()
    school_id = session.get("school")

    if not current_user["user_id"]:
        return jsonify({"error": "Unauthorized"}), 403

    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    filter_query = request.args.get("filter")
    approved = request.args.get("approved")
    if not start_date or not end_date:
        return jsonify({"error": "Missing required date parameters"}), 400
    if not filter_query:
        filter_query = ""
    approved = (
        approved == "true" or approved == True or approved is None or approved == ""
    )

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
    cur = mysql.connection.cursor()

    result = get_events_by_date(
        cur,
        start_date,
        end_date,
        school_id,
        current_user["user_id"],
        filter_query,
        approved,
    )
    cur.close()
    if "error" in result:
        return jsonify(result["error"]), result.get("status", 500)
    return jsonify(result), 200


def validate_jwt(token):
    """
    Validate a JWT token for approving an event.

    Args:
        token (str): Encoded JWT token.

    Returns:
        dict: Decoded payload if the token is valid, None otherwise.
    """
    try:
        print(f"Decoding Token: {token}")  # Debugging: Print the token before decoding
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        print(f"Decoded Payload: {payload}")  # Debugging: Print the decoded payload
        return payload, None
    except jwt.ExpiredSignatureError:
        print("JWT Validation Error: Token has expired")
        return None, "Token has expired"
    except jwt.InvalidTokenError as e:
        print(f"JWT Validation Error: {str(e)}")  # Print actual error message
        return None, "Invalid token"
    except Exception as e:
        print(f"Unexpected Error: {str(e)}")  # Catch any unexpected errors
        return None, "Unexpected token error"


@events_bp.route("/api/validate_token", methods=["GET"])
def validate_token():
    token = request.args.get("token")
    if not token:
        return jsonify({"error": "Token is required"}), 400

    validation_result = validate_jwt(token)
    if isinstance(validation_result, tuple):  # If validation fails
        return jsonify(validation_result[0]), validation_result[1]

    return jsonify({"message": "Token is valid", "data": validation_result})


def generate_approval_token(club_id, event_id):
    """
    Generates a JWT token for approving an event.

    Args:
        club_id (int): ID of the club.
        event_id (int): ID of the event.

    Returns:
        str: Encoded JWT token.
    """
    payload = {
        "club_id": club_id,
        "event_id": event_id,
        "exp": datetime.now(timezone.utc) + timedelta(seconds=Config.JWT_EXPIRATION),
    }
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm="HS256")


def send_approval_email(
    email,
    club_id,
    event_id,
    club_name,
    cohost_name,
    event_name,
    event_description,
    event_start_date,
    event_end_date,
    event_location,
):
    """
    Send an approval email to the specified email address.

    Args:
        email (str): The recipient's email address.
        club_id (int): ID of the club hosting the event.
        event_id (int): ID of the event.

    Returns:
        bool: True if the email was sent successfully, False otherwise.

    Behavior:
    - Generates a JWT token for the collaboration approval
    - Constructs the approval link using the token
    - Sends the email using the send_email helper function
    """
    token = generate_approval_token(club_id, event_id)
    approval_link = f"{Config.API_URL_ROOT}/dashboard/CohostApproval?eventId={event_id}&clubId={club_id}&token={token}"

    # Define the local timezone
    local_tz = pytz.timezone("US/Eastern")

    # Parse the event start and end dates in UTC
    start_date_obj = datetime.strptime(
        event_start_date, "%Y-%m-%dT%H:%M:%S.%fZ"
    ).replace(tzinfo=pytz.utc)
    end_date_obj = datetime.strptime(event_end_date, "%Y-%m-%dT%H:%M:%S.%fZ").replace(
        tzinfo=pytz.utc
    )

    # Convert the dates to the local timezone
    local_start_date = start_date_obj.astimezone(local_tz)
    local_end_date = end_date_obj.astimezone(local_tz)

    # Format the dates to the desired format
    formatted_start_date = (
        local_start_date.strftime("%Y-%m-%d %-I:%M%p")
        .lower()
        .replace("pm", "p.m.")
        .replace("am", "a.m.")
    )
    formatted_end_date = (
        local_end_date.strftime("%Y-%m-%d %-I:%M%p")
        .lower()
        .replace("pm", "p.m.")
        .replace("am", "a.m.")
    )

    send_email(
        email,
        "Event Collaboration Approval Required",
        f"""<li>{cohost_name} has been invited to co-host an event with {club_name}.</li>
         <p> Event Details: </p>
         <ul>
            <li>Event Name: {event_name}</li>
            <li>Event Description: {event_description}</li>
            <li>Event Start Date: {formatted_start_date}</li>
            <li>Event End Date: {formatted_end_date}</li>
            <li>Event Location: {event_location}</li>
        </ul>
         <p>Please approve the collaboration by clicking the link below:</p>
         <p><a href={approval_link}>{approval_link}</a></p>
         <p>Best regards,<br>SHARC Team</p>
         """,
        True,
    )


def send_decline_email(event_id):
    """
    Send a decline email to the club admin.

    Args:
        event_id (int): ID of the event.

    Returns:
        bool: True if the email was sent successfully, False otherwise.

    Behavior:
    - Fetches the club admin email and event name from the database
    - Sends the email using the send_email helper function
    """
    cur = mysql.connection.cursor()
    cur.execute(
        """SELECT u.email, e.event_name FROM users u
            INNER JOIN club_admin ca ON u.email = ca.user_id
            INNER JOIN event_host eh ON ca.club_id = eh.club_id
            INNER JOIN event e ON eh.event_id = e.event_id
            WHERE eh.event_id = %s""",
        (event_id,),
    )
    result = cur.fetchone()
    email = result[0]
    event_name = result[1]

    send_email(
        email,
        "Event Collaboration Declined",
        f"Your collaboration request for the event '{event_name}' has been declined.",
        True,
    )

    cur.close()


@events_bp.route("/approve-collaboration", methods=["POST"])
def approve_collaboration():
    """
    Approve a collaboration for a specific event.

    This endpoint approves a collaboration by setting the `is_approved` flag to true
    for the specified club and event.

    Request JSON Parameters:
        eventId (int): ID of the event.
        clubId (int): ID of the club.

    Returns:
        JSON response:
        - On successful approval:
            {"message": "Collaboration approved successfully!"}, 200 status
        - On invalid or missing parameters:
            {"error": "Invalid or missing parameters"}, 400 status
        - On database update failure:
            {"error": "Failed to update collaboration approval: <error_message>"}, 500 status
    """
    token = request.headers.get("Authorization")

    if not token:
        return jsonify({"error": "Missing token"}), 403

    if token.startswith("Bearer "):
        token = token.split(" ")[1]  # Remove "Bearer " prefix

    payload, error = validate_jwt(token)

    if error:
        print(f"JWT Validation Error: {error}")
        return jsonify({"error": error}), 403

    event_id = request.json.get("eventId")
    club_id = request.json.get("clubId")

    print(
        f"Event ID from JWT: {payload['event_id']}, Event ID from request: {event_id}"
    )
    print(f"Club ID from JWT: {payload['club_id']}, Club ID from request: {club_id}")

    if int(event_id) != payload["event_id"] or int(club_id) != payload["club_id"]:
        print("Error: Token payload does not match request data")
        return jsonify({"error": "Invalid event or club ID"}), 403

    if not event_id or not club_id:
        return jsonify({"error": "Invalid or missing parameters"}), 400

    try:
        cur = mysql.connection.cursor()
        cur.execute(
            """UPDATE event_host SET is_approved = true
               WHERE event_id = %s AND club_id = %s""",
            (event_id, club_id),
        )
        mysql.connection.commit()
        cur.close()
        return jsonify({"message": "Collaboration approved successfully!"}), 200

    except Exception as e:
        return (
            jsonify({"error": f"Failed to update collaboration approval: {str(e)}"}),
            500,
        )


@events_bp.route("/decline-collaboration", methods=["POST"])
def decline_collaboration():
    """
    Decline a collaboration for a specific event.

    This endpoint declines a collaboration by setting the `is_active` flag to false
    for the specified event and sends a notification email to the club admin.

    Request JSON Parameters:
        eventId (int): ID of the event.

    Returns:
        JSON response:
        - On successful decline:
            {"message": "Collaboration declined successfully!"}, 200 status
        - On invalid or missing parameters:
            {"error": "Invalid or missing parameters"}, 400 status
        - On database update failure:
            {"error": "Failed to update collaboration decline: <error_message>"}, 500 status
    """
    token = request.headers.get("Authorization")

    if not token:
        return jsonify({"error": "Missing token"}), 403

    if token.startswith("Bearer "):
        token = token.split(" ")[1]  # Remove "Bearer " prefix

    payload, error = validate_jwt(token)

    if error:
        print(f"JWT Validation Error: {error}")
        return jsonify({"error": error}), 403

    event_id = request.json.get("eventId")
    club_id = request.json.get("clubId")

    print(
        f"Event ID from JWT: {payload['event_id']}, Event ID from request: {event_id}"
    )
    print(f"Club ID from JWT: {payload['club_id']}, Club ID from request: {club_id}")

    if int(event_id) != payload["event_id"] or int(club_id) != payload["club_id"]:
        print("Error: Token payload does not match request data")
        return jsonify({"error": "Invalid event or club ID"}), 403

    if not event_id or not club_id:
        return jsonify({"error": "Invalid or missing parameters"}), 400

    try:
        cur = mysql.connection.cursor()
        cur.execute(
            """UPDATE event SET is_active = 0
               WHERE event_id = %s""",
            (event_id,),
        )
        mysql.connection.commit()
        cur.close()

        # Send notification email to club admin
        send_decline_email(event_id)

        return jsonify({"message": "Collaboration declined successfully!"}), 200

    except Exception as e:
        return (
            jsonify({"error": f"Failed to update collaboration decline: {str(e)}"}),
            500,
        )


@events_bp.route("/new-event", methods=["POST"])
def create_event():
    """
    Create a new event for a specific club.

    This endpoint allows authenticated users to create a new event with
    comprehensive details, including optional photos and tags.

    Authentication:
    - Requires user to be logged in
    - User must be an admin for the club hosting the event

    Request Form Parameters:
        clubId (int): ID of the club hosting the event
        eventName (str): Title of the event
        description (str): Detailed description of the event
        startDate (str): ISO 8601 formatted start date and time (UTC)
        endDate (str): ISO 8601 formatted end date and time (UTC)
        location (str): Physical or virtual location of the event
        eventCost (float, optional): Cost to attend the event
        tags (str, optional): JSON array of tag IDs associated with the event
        coHosts (str, optional): JSON array of co-host IDs
        eventPhotos (file[], optional): List of image files to attach to the event

    Returns:
        JSON response:

        - On successful event creation:
            {
                "message": "Event created successfully",
                "event_id": int
            }, 201 status

        - On authentication failure:
            {"error": "User not logged in"}, 401 status

        - On validation failure:
            {"error": "Missing required fields"}, 400 status
            {"error": "Invalid event cost value"}, 400 status
            {"error": "Invalid tags format, should be a JSON array"}, 400 status

        - On database or server error:
            {"error": "Failed to create event"}, 500 status

    Behavior:
    - Validates all input parameters
    - Converts event cost to float or None
    - Handles multiple file uploads for event photos
    - Supports optional tags and event cost
    - Converts dates to UTC timezone
    - Generates a new event record in the database
    - Associates event with hosting club
    - Attaches tags and photos to the event
    - Logs event creation for audit purposes

    Security Considerations:
    - Checks user authentication before event creation
    - Validates file types for uploaded photos
    - Sanitizes input data to prevent injection
    """
    current_user = get_user_session_info()
    user_id = current_user["user_id"]
    school_id = session.get("school")

    if not user_id:
        return jsonify({"error": "User not logged in"}), 401

    # Get event data from the request
    club_id = request.form.get("clubId")
    event_name = request.form.get("eventName")
    description = request.form.get("description")
    start_date = request.form.get("startDate")
    end_date = request.form.get("endDate")
    location = request.form.get("location")
    event_cost = request.form.get("eventCost")
    co_hosts = request.form.get("coHosts")
    tags = request.form.get("tags")
    gender_restriction = request.form.get("genderRestriction")

    if gender_restriction not in ["male", "female", "none"]:
        return jsonify({"error": "Invalid gender restriction"}), 400

    # Validate club_id
    if not club_id or club_id == "undefined":
        return jsonify({"error": "Invalid club ID"}), 400
    try:
        club_id = int(club_id)
    except ValueError:
        return jsonify({"error": "Invalid club ID format"}), 400

    # Process optional fields
    tags = json.loads(tags) if tags else []
    co_hosts = json.loads(co_hosts) if co_hosts else []

    # Validate required fields
    if not all([event_name, description, start_date, end_date, location]):
        return jsonify({"error": "Missing required fields"}), 400
    try:
        event_cost = float(event_cost) if event_cost else None
    except ValueError:
        return jsonify({"error": "Invalid event cost value"}), 400

    # Handle file uploads
    event_photos = request.files.getlist("eventPhotos")
    saved_photos = []
    for photo in event_photos:
        if photo and allowed_file(photo.filename):
            # Reset file pointer before reading
            photo.seek(0)
            saved_photos.append((photo.read(), photo.content_type))

    try:
        # Parse dates
        try:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%dT%H:%M:%S.%fZ")
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%dT%H:%M:%S.%fZ")
        except ValueError:
            start_date_obj = datetime.strptime(start_date, "%Y-%m-%dT%H:%M:%SZ")
            end_date_obj = datetime.strptime(end_date, "%Y-%m-%dT%H:%M:%SZ")

        if not mysql.connection:
            return jsonify({"error": "Database connection error"}), 500
        cur = mysql.connection.cursor()

        # Fetch the club name
        cur.execute("""SELECT club_name FROM club WHERE club_id = %s""", (club_id,))
        club_data = cur.fetchone()
        if not club_data:
            return jsonify({"error": "Club not found"}), 400
        club_name = club_data[0]

        # Check if user is an admin for the club
        cur.execute(
            """SELECT * FROM club_admin WHERE club_id = %s AND user_id = %s""",
            (club_id, user_id),
        )
        if not cur.fetchone():
            return jsonify({"error": "Unauthorized"}), 403

        # Insert the event
        cur.execute(
            """INSERT INTO event (event_name, start_time, end_time, location, description, cost, school_id, is_approved, is_active, gender_restriction)
               VALUES (%s, %s, %s, %s, %s, %s, %s, 0, 1, %s)""",
            (
                event_name,
                start_date_obj,
                end_date_obj,
                location,
                description,
                event_cost,
                school_id,
                (
                    "M"
                    if gender_restriction == "male"
                    else ("F" if gender_restriction == "female" else None)
                ),
            ),
        )
        event_id = cur.lastrowid

        # Add tags
        for tag in tags:
            cur.execute(
                """INSERT INTO event_tags (event_id, tag_id) VALUES (%s, %s)""",
                (event_id, int(tag)),
            )

        # Add the main host
        cur.execute(
            """INSERT INTO event_host (club_id, event_id, is_approved) VALUES (%s, %s, true)""",
            (club_id, event_id),
        )

        # Process multiple co-hosts
        cohost_names = []
        for co_host in co_hosts:
            cur.execute("""SELECT club_name FROM club WHERE club_id = %s""", (co_host,))
            cohost_data = cur.fetchone()
            if cohost_data:
                cohost_names.append(cohost_data[0])

                # Add co-host to event with pending approval
                cur.execute(
                    """INSERT INTO event_host (club_id, event_id, is_approved) VALUES (%s, %s, false)""",
                    (co_host, event_id),
                )

                # Fetch co-host email
                cur.execute(
                    """SELECT user_id 
                        FROM club_admin 
                        WHERE club_id = %s
                            AND is_active = 1""",
                    (co_host,),
                )
                co_host_data = cur.fetchall()
                if co_host_data:
                    co_host_email = list(
                        emails[0] for emails in co_host_data
                    )  # USER_ID is the email
                    send_approval_email(
                        co_host_email,
                        co_host,
                        event_id,
                        club_name,
                        cohost_data[0],  # Use fetched co-host name
                        event_name,
                        description,
                        start_date,
                        end_date,
                        location,
                    )

        # Save photos
        for image_data, filename in saved_photos:
            cur.execute(
                """INSERT INTO event_photo (event_id, IMAGE, IMAGE_PREFIX) 
                   VALUES (%s, %s, %s)""",
                (event_id, image_data, filename),
            )

        # Fetch all club admin emails
        cur.execute(
            """SELECT user_id 
               FROM club_admin 
               WHERE club_id = %s
                 AND is_active = 1""",
            (club_id,),
        )
        admin_emails = [admin[0] for admin in cur.fetchall()]

        # Convert dates to local timezone and format them
        local_tz = pytz.timezone("US/Eastern")

        # Parse the event start and end dates in UTC
        start_date_obj = datetime.strptime(start_date, "%Y-%m-%dT%H:%M:%S.%fZ").replace(
            tzinfo=pytz.utc
        )
        end_date_obj = datetime.strptime(end_date, "%Y-%m-%dT%H:%M:%S.%fZ").replace(
            tzinfo=pytz.utc
        )

        local_start_date = start_date_obj.astimezone(local_tz)
        local_end_date = end_date_obj.astimezone(local_tz)
        formatted_start_date = (
            local_start_date.strftime("%Y-%m-%d %-I:%M%p")
            .lower()
            .replace("pm", "p.m.")
            .replace("am", "a.m.")
        )
        formatted_end_date = (
            local_end_date.strftime("%Y-%m-%d %-I:%M%p")
            .lower()
            .replace("pm", "p.m.")
            .replace("am", "a.m.")
        )

        # Send notification email to all club admins
        for email in admin_emails:
            send_email(
                email,
                "Event Pending Approval",
                f"Dear '{club_name}' admin,\n\n Your event '{event_name}' is pending approval by faculty. You will hear back about the approval results soon.\n\nEvent Details:\nName: {event_name}\nDescription: {description}\nStart Date: {formatted_start_date}\nEnd Date: {formatted_end_date}\nLocation: {location} \n\n Best regards,\nSHARC Team",
            )

        mysql.connection.commit()
        cur.close()
        return (
            jsonify({"message": "Event created successfully", "event_id": event_id}),
            201,
        )

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": f"Failed to create event: {str(e)}"}), 500


def sort_comments(comments):
    # Convert list to dictionary for quick lookup
    comment_dict = {comment["comment_id"]: comment for comment in comments}

    # Initialize dictionary of comment children
    comment_tree = {comment["comment_id"]: [] for comment in comments}

    # Organize comments into tree structure
    root_comments = []
    for comment in comments:
        parent_id = comment["parent"]
        if parent_id is None:  # Top-level comment
            root_comments.append(comment)
        else:
            if parent_id in comment_tree:
                comment_tree[parent_id].append(comment)

    # Flatten the tree into a sorted list
    def flatten_tree(comments):
        sorted_list = []
        for comment in comments:
            sorted_list.append(comment)  # Add parent first
            sorted_list.extend(
                flatten_tree(comment_tree[comment["comment_id"]])
            )  # Add replies
        return sorted_list

    return flatten_tree(root_comments)


@events_bp.route("/get-comments/<event_id>", methods=["GET"])
def get_comments(event_id):
    user = get_user_session_info()
    if not user["user_id"]:
        return jsonify({"error": "Unauthorized"}), 403
    cur = mysql.connection.cursor()
    try:
        cur.execute(
            """SELECT comment_id, user_id, is_flagged, is_deleted, content, posted_timestamp, parent, indent_level
                FROM comments
                WHERE event_id = %s""",
            (event_id,),
        )
        result = cur.fetchall()

        # Convert result to list of dictionairies
        comment_list = [
            {
                "comment_id": comment[0],
                "user_id": comment[1],
                "is_flagged": comment[2],
                "is_deleted": comment[3],
                "content": comment[4],
                "posted_timestamp": comment[5],
                "parent": comment[6],
                "indent_level": comment[7],
            }
            for comment in result
        ]
        return jsonify(sort_comments(comment_list)), 200

    except Exception as e:
        print(f"Error getting comments: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    finally:
        if cur is not None:
            cur.close()


@events_bp.route("/post-comment", methods=["POST"])
def post_comment():
    cur = None
    try:
        current_user = get_user_session_info()
        # Check if the user is logged in
        user_id = current_user.get("user_id")
        school_id = session.get("school")

        if not user_id:
            return jsonify({"error": "User not logged in"}), 401

        data = request.json
        print(data)

        # Establish database connection
        conn = mysql.connection
        cur = conn.cursor()

        # Query to add comment
        cur.execute(
            """INSERT INTO comments
                (event_id, user_id, content) VALUES (%s, %s, %s)""",
            (data["event_id"], user_id, data["comment"]),
        )
        conn.commit()

        return jsonify({"message": "Comment added successfully"}), 200

    except Exception as e:
        print(f"Error adding comment: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    finally:
        if cur is not None:
            cur.close()


@events_bp.route("/post-sub-comment", methods=["POST"])
def post_sub_comment():
    cur = None
    try:
        current_user = get_user_session_info()

        # Check if the user is logged in
        user_id = current_user.get("user_id")
        school_id = session.get("school")

        if not user_id:
            return jsonify({"error": "User not logged in"}), 401

        data = request.json

        # Establish database connection
        conn = mysql.connection
        cur = conn.cursor()

        # Query to add comment
        cur.execute(
            """INSERT INTO comments
                (event_id, user_id, content, parent, indent_level) values
                (%s, %s, %s, %s, %s)""",
            (
                data["event_id"],
                user_id,
                data["comment"],
                data["parent_id"],
                data["indent_level"],
            ),
        )
        conn.commit()

        return jsonify({"message": "Comment added successfully"}), 200

    except Exception as e:
        print(f"Error adding comment: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    finally:
        if cur is not None:
            cur.close()

@events_bp.route("/report-comment", methods=["POST"])
def report_comment():
    cur = None
    try:
        current_user = get_user_session_info()

        # Check if the user is logged in
        user_id = current_user.get("user_id")
        school_id = session.get("school")

        if not user_id:
            return jsonify({"error": "User not logged in"}), 401
        
        data = request.json

        # Establish database connection
        conn = mysql.connection
        cur = conn.cursor()

        # Query to set comment to reported
        cur.execute(
            """UPDATE comments
                SET is_flagged = 1
                WHERE comment_id = %s""",
            (data['commentId'],),
        )
        conn.commit()

        return jsonify({"message": "Comment reported successfully"}), 200
    
    except Exception as e:
        print(f"Error reporting comment: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    finally:
        if cur is not None:
            cur.close()