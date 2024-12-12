from flask import Blueprint, jsonify, request, session
from extensions import mysql

rsvp_bp = Blueprint("rsvp", __name__)


@rsvp_bp.route("/rsvp", methods=["POST"])
def RSVP():
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
