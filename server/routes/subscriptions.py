from flask import Blueprint, jsonify, request
from extensions import mysql
from helper.check_user import get_user_session_info

subscriptions_bp = Blueprint("subscriptions", __name__)


@subscriptions_bp.route("/subscribe", methods=["POST"])
def manage_subscription():
    """
    Manage user's subscription status for a specific club.

    This endpoint allows users to subscribe from,
    unsubscribe from, block, or unblock a club.

    Request JSON Parameters:
        action (str): Subscription action
            - 'subscribe': Add or reactivate subscription
            - 'unsubscribe': Deactivate subscription
            - 'block': Block club
            - 'unblock': Unblock club
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
    # Check user authentication
    user_info = get_user_session_info()
    if not user_info["user_id"]:
        return jsonify({"error": "Authentication required"}), 401

    data = request.json

    if data is None:
        return jsonify({"error": "Missing required fields"}), 400

    user_id = data.get("userId")
    club_id = data.get("clubId")
    action = data.get("action")

    bool_val = "subscribe" in action

    # Ensure the authenticated user matches the requested user
    if user_id != user_info["user_id"]:
        return jsonify({"error": "Unauthorized access"}), 403

    if not all([user_id, club_id, action]):
        return jsonify({"error": "Missing required fields"}), 400

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500

    try:
        cur = mysql.connection.cursor()

        if action == "subscribe" or action == "block":

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

                    SET is_active = 1, subscribed_or_blocked = %s

                    WHERE email = %s AND club_id = %s
                    """,
                    (bool_val, user_id, club_id),
                )
            else:
                # Insert new subscription
                cur.execute(
                    """
                    INSERT INTO user_subscription (email, club_id, is_active, subscribed_or_blocked)
                    VALUES (%s, %s, 1, %s)
                    """,
                    (user_id, club_id, bool_val),
                )

        elif action == "unsubscribe" or action == "unblock":

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
