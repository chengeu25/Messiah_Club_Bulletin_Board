from flask import Blueprint, request, jsonify
from extensions import mysql
from helper.check_user import get_user_session_info

emails_bp = Blueprint("emails", __name__)


@emails_bp.route("/email-preferences", methods=["POST"])
def update_email_preferences():
    """
    Update the current user's email preferences.

    Request JSON Parameters:
        email_frequency (str): Frequency of email notifications
        email_event_type (str): Types of events to receive email notifications for

    Returns:
        JSON response:
        - On successful update:
            {"message": "Email preferences updated successfully"}, 200 status
        - On unauthorized access:
            {"error": "Unauthorized"}, 403 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On update failure:
            {"error": str}, 400 status
    """

    # Get current user
    current_user = get_user_session_info()
    if not current_user["user_id"]:
        return jsonify({"error": "Unauthorized"}), 403

    # Get request data
    data = request.get_json()
    email_frequency = data.get("email_frequency")
    email_event_type = data.get("email_event_type")

    # Validate input
    if not email_frequency or not email_event_type:
        return jsonify({"error": "Missing email_frequency or email_event_type"}), 400

    try:
        # Update user's email preferences in the database
        with mysql.connection.cursor() as cursor:
            update_query = """UPDATE users 
                                SET email_frequency = %s, email_event_type = %s 
                                WHERE email = %s"""
            cursor.execute(
                update_query,
                (email_frequency, email_event_type, current_user["user_id"]),
            )
            mysql.connection.commit()

        return jsonify({"message": "Email preferences updated successfully"}), 200

    except Exception as e:
        mysql.connection.rollback()
        print(e)
        return jsonify({"error": str(e)}), 500


@emails_bp.route("/email-preferences", methods=["GET"])
def get_email_preferences():
    """
    Retrieve the current user's email preferences.

    Returns:
        JSON response:
        - On successful retrieval:
            {
                "email_frequency": str,
                "email_event_type": str
            }, 200 status
        - On unauthorized access:
            {"error": "Unauthorized"}, 403 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On retrieval failure:
            {"error": str}, 500 status
    """

    # Get current user
    current_user = get_user_session_info()
    if not current_user["user_id"]:
        return jsonify({"error": "Unauthorized"}), 403

    try:
        # Fetch user's email preferences from the database
        with mysql.connection.cursor() as cursor:
            query = """SELECT email_frequency, email_event_type 
                        FROM users 
                        WHERE email = %s
            """
            cursor.execute(query, (current_user["user_id"],))
            result = cursor.fetchone()

        if not result:
            return jsonify({"error": "User not found"}), 404

        return (
            jsonify({"email_frequency": result[0], "email_event_type": result[1]}),
            200,
        )

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500
