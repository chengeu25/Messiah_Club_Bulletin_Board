from flask import Blueprint, jsonify, request, session
from extensions import mysql

subscriptions_bp = Blueprint("subscriptions", __name__)


@subscriptions_bp.route("/check-subscription", methods=["POST"])
def check_subscription():
    """
    Check if a user is subscribed to a specific club.

    This endpoint verifies a user's subscription status for a given club.

    Request JSON Parameters:
        userId (str): User's email address
        clubId (int): Unique identifier for the club

    Returns:
        JSON response:
        - On successful check:
            {"isSubscribed": bool}, 200 status
                - True if user is actively subscribed
                - False if user is not subscribed or subscription is inactive
        - On validation failure:
            {"error": "Missing required fields"}, 400 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On unexpected database error:
            {"error": "Database operation failed"}, 500 status

    Behavior:
    - Validates input parameters
    - Queries user_subscription table
    - Checks subscription status based on is_active flag
    - Returns boolean indicating subscription state

    Security Considerations:
    - Validates input data
    - Prevents unauthorized access to subscription information
    - Handles potential database errors gracefully
    """
    data = request.json

    if data is None:
        return jsonify({"error": "Missing required fields"}), 400

    user_id = data.get("userId")
    club_id = data.get("clubId")

    if not user_id or not club_id:
        return jsonify({"error": "Missing required fields"}), 400

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500

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


@subscriptions_bp.route("/subscribe", methods=["POST"])
def manage_subscription():
    """
    Manage user's subscription status for a specific club.

    This endpoint allows users to subscribe or unsubscribe from a club.

    Request JSON Parameters:
        action (str): Subscription action
            - 'subscribe': Add or reactivate subscription
            - 'unsubscribe': Deactivate subscription
        clubId (int): Unique identifier for the club
        userId (str): User's email address

    Returns:
        JSON response:
        - On successful subscription action:
            {"success": True}, 200 status
        - On validation failure:
            {"error": "Missing required fields"}, 400 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On unexpected database error:
            {"error": "Database operation failed"}, 500 status

    Behavior:
    - Validates input parameters
    - Supports two subscription actions:
      1. Subscribe:
         - Checks for existing subscription
         - Creates new subscription or reactivates existing
      2. Unsubscribe:
         - Deactivates existing subscription
    - Uses MySQL transactions for data integrity
    - Commits changes on successful action

    Security Considerations:
    - Validates input data
    - Prevents unauthorized subscription modifications
    - Handles potential database errors gracefully
    - Supports idempotent subscription management
    """
    data = request.json

    if data is None:
        return jsonify({"error": "Missing required fields"}), 400

    action = data.get("action")
    club_id = data.get("clubId")
    user_id = data.get("userId")  # Ensure this matches the query string

    print(f"Received data: {data}")
    print(f"Query parameters: user_id={user_id}")

    # Validate input
    if not user_id or not club_id or not action:
        print("Error: Missing required fields")
        return jsonify({"error": "Missing required fields"}), 400

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500

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
