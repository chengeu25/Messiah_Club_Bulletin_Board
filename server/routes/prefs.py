from flask import Blueprint, jsonify, request
from helper.check_user import get_user_session_info
from extensions import mysql

prefs_bp = Blueprint("prefs", __name__)


@prefs_bp.route("/<page>", methods=["GET"])
def get_prefs(page):
    """
    Retrieve the current user's preferences for a specific page.

    This endpoint allows authenticated users to fetch their current filter preferences
    for specific pages (home, calendar, or clubs).

    Args:
        page (str): The page for which to retrieve preferences.
                    Must be one of: 'home', 'calendar', or 'clubs'.

    Returns:
        JSON response with one of the following:
        - 200: Success, returns the current filter value for the specified page
        - 401: User session is invalid or expired
        - 400: Invalid page filter
        - 404: User preferences not found
        - 500: Database connection or other server-side error

    Raises:
        Exception: Captures and returns any unexpected server-side errors
    """
    user = get_user_session_info()
    if not user:
        return jsonify({"error": "User session is invalid or expired"}), 401

    # Whitelist of allowed page filters
    allowed_pages = ["home", "calendar", "clubs"]
    if page not in allowed_pages:
        return jsonify({"error": "Invalid page filter"}), 400

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500

    try:
        cursor = mysql.connection.cursor()
        cursor.execute(
            "SELECT `{}_filter` FROM `users` WHERE `email` = %s".format(page),
            (user["user_id"],),
        )
        result = cursor.fetchone()
        value = result[0]
        cursor.close()
        if not result:
            return jsonify({"error": "User preferences not found"}), 404
        return jsonify({"value": value}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@prefs_bp.route("/<page>", methods=["POST"])
def update_prefs(page):
    """
    Update the current user's preferences for a specific page.

    This endpoint allows authenticated users to update their filter preferences
    for specific pages (home, calendar, or clubs).

    Args:
        page (str): The page for which to update preferences.
                    Must be one of: 'home', 'calendar', or 'clubs'.

    JSON Body:
        value (str): The new filter value to set. Must be one of the predefined
                     valid filter values for the specified page.

    Returns:
        JSON response with one of the following:
        - 200: Success, preferences updated successfully
        - 401: User session is invalid or expired
        - 400: Invalid page filter or invalid filter value
        - 500: Database connection or other server-side error

    Raises:
        Exception: Captures and returns any unexpected server-side errors
    """
    user = get_user_session_info()
    if not user:
        return jsonify({"error": "User session is invalid or expired"}), 401

    # Whitelist of allowed page filters
    allowed_pages = ["home", "calendar", "clubs"]
    if page not in allowed_pages:
        return jsonify({"error": "Invalid page filter"}), 400

    # Get the new filter value from the request JSON
    data = request.get_json()
    if not data or "value" not in data:
        return jsonify({"error": "Missing filter value"}), 400

    # Validate the filter value based on the page
    valid_filters = {
        "home": ["All Events", "Suggested", "Hosted by Subscribed Clubs", "Attending"],
        "calendar": [
            "All Events",
            "Suggested",
            "Hosted by Subscribed Clubs",
            "Attending",
        ],
        "clubs": ["All Clubs", "Suggested", "Subscribed"],
    }

    if data["value"] not in valid_filters[page]:
        return jsonify({"error": f"Invalid filter value for {page} page"}), 400

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500

    try:
        cursor = mysql.connection.cursor()
        cursor.execute(
            f"UPDATE `users` SET `{page}_filter` = %s WHERE `email` = %s",
            (data["value"], user["user_id"]),
        )
        mysql.connection.commit()
        cursor.close()
        return (
            jsonify({"message": f"{page.capitalize()} filter updated successfully"}),
            200,
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500
