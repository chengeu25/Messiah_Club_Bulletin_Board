from flask import Blueprint, jsonify, request, session
from extensions import mysql
from helper.check_user import get_user_session_info

rsvp_bp = Blueprint("rsvp", __name__)


@rsvp_bp.route("/rsvp", methods=["POST"])
def RSVP():
    """
    Manage user's RSVP status for a specific event.

    This endpoint allows users to set, update, or cancel their RSVP for an event.

    Query Parameters:
        event_id (str): Unique identifier for the event
        type (str): RSVP action type
            - 'block': Mark event as blocked/not attending
            - 'rsvp': Mark event as attending
            - 'cancel': Cancel existing RSVP

    Authentication:
    - Requires user to be logged in via session

    Returns:
        JSON response:
        - On successful RSVP action:
            {"message": "RSVP set to 'block'"}, 200 status
            {"message": "RSVP set to 'rsvp'"}, 200 status
            {"message": "RSVP deleted"}, 200 status
        - On validation failure:
            {"error": "Missing event_id, user_id, or type parameter"}, 400 status
            {"error": "Invalid user_id"}, 400 status
            {"error": "Invalid type parameter"}, 400 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On unexpected error:
            {"error": str}, 500 status

    Behavior:
    - Validates user authentication and input parameters
    - Checks user existence in the database
    - Supports three RSVP actions:
      1. Block: Set is_yes to False
      2. RSVP: Set is_yes to True
      3. Cancel: Set is_active to False
    - Uses MySQL's ON DUPLICATE KEY UPDATE for efficient handling
    - Commits transaction on successful action
    - Rolls back transaction on error

    Security Considerations:
    - Validates user session and user existence
    - Prevents unauthorized RSVP modifications
    - Handles database errors gracefully
    - Sanitizes and validates input parameters
    """
    # Check user authentication
    user_info = get_user_session_info()
    if not user_info["user_id"]:
        return jsonify({"error": "Authentication required"}), 401

    event_id = request.args.get("event_id")  # Event ID
    print(event_id)
    user_id = session.get("user_id")
    typeofRSVP = request.args.get("type")  # Type parameter

    # Validate input parameters
    if not event_id or not user_id or not typeofRSVP:
        return jsonify({"error": "Missing event_id, user_id, or type parameter"}), 400

    cur = None

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500

    try:
        cur = mysql.connection.cursor()

        # Check if the user_id exists
        cur.execute("SELECT COUNT(*) FROM users WHERE email = %s", (user_id,))
        user_exists = cur.fetchone()[0]

        if not user_exists:
            return jsonify({"error": "Invalid user_id"}), 400

        # Block if gender restriction is invalid
        cur.execute(
            """SELECT COUNT(*) FROM event e
                 LEFT JOIN users u ON u.email = %s
                 WHERE e.event_id = %s 
                    AND (e.gender_restriction IS NULL OR e.gender_restriction = u.gender)
                    AND e.is_active = 1 
                    AND e.is_approved = 1 
                    AND e.school_id = %s""",
            (user_id, event_id, session.get("school")),
        )

        if cur.fetchone()[0] == 0:
            return jsonify({"error": "Gender restriction is invalid"}), 400

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
        if cur is not None:
            cur.close()
