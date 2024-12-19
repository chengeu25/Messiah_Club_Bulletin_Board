from flask import Blueprint, jsonify, request, session
from extensions import mysql
from helper.check_user import get_user_session_info


interests_bp = Blueprint("interests", __name__)


@interests_bp.route("/get-available-tags", methods=["GET"])
def get_avaliable_tags():
    """
    Retrieve all available tags from the database.

    This endpoint fetches a list of all tags with their unique identifiers.
    Authentication is required to access this endpoint.

    Returns:
        JSON response:
        - On successful retrieval:
            {
                "tags": [
                    {
                        "tag": str,      # Tag name
                        "tag_id": int    # Unique tag identifier
                    }
                ]
            }, 200 status
        - On unauthorized access:
            {"error": "Unauthorized"}, 403 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status

    Behavior:
    - Requires user authentication
    - Queries the tag table to retrieve all tag names and IDs
    - Transforms database results into a list of tag dictionaries
    - Supports dynamic tag management
    """
    # Check if user is authenticated
    current_user = get_user_session_info()
    if not current_user["user_id"]:
        return jsonify({"error": "Unauthorized"}), 403

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
    cur = mysql.connection.cursor()
    cur.execute(
        """SELECT tag_id, tag_name 
                FROM tag
                WHERE school_id = %s""",
        (session.get("school"),),
    )
    result = cur.fetchall()
    result = list(map(lambda x: {"tag": x[1], "tag_id": x[0]}, result))
    cur.close()
    return jsonify({"tags": result}), 200


@interests_bp.route("/get-current-user-interests", methods=["GET"])
def getinterests():
    """
    Fetch the current user's selected interests from the database.
    Authentication is required to access this endpoint.

    Returns:
        JSON response:
        - On successful retrieval:
            {
                "interests": [
                    {
                        "tag": str,      # Tag name
                        "tag_id": int    # Tag identifier
                    }
                ]
            }, 200 status
        - On unauthorized access:
            {"error": "Unauthorized"}, 403 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On retrieval failure:
            {"error": "Failed to fetch interests"}, 500 status

    Behavior:
    - Requires user authentication
    - Retrieves all tags associated with the current user
    - Returns tags with their IDs in a structured format
    """
    # Check if user is authenticated
    current_user = get_user_session_info()
    if not current_user["user_id"]:
        return jsonify({"error": "Unauthorized"}), 403

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
    cur = mysql.connection.cursor()
    try:
        cur.execute(
            """SELECT t.tag_name
                    FROM tag t
                    INNER JOIN user_tags ut ON t.tag_id = ut.tag_id
                    WHERE ut.user_id = %s
            """,
            (current_user["user_id"],),
        )
        result = cur.fetchall()
        interests = [row[0] for row in result]
        return jsonify({"interests": interests}), 200
    except Exception as e:
        print(f"Error fetching interests: {e}")
        return jsonify({"error": "Failed to fetch interests"}), 500
    finally:
        cur.close()


@interests_bp.route("/get-available-interest-names", methods=["GET"])
def getallinterests():
    """
    Fetch all available interest names from the database.
    Authentication is required to access this endpoint.

    Returns:
        JSON response:
        - On successful retrieval:
            {
                "interests": [str]  # List of all tag names
            }, 200 status
        - On unauthorized access:
            {"error": "Unauthorized"}, 403 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On retrieval failure:
            {"error": "Failed to fetch all interests"}, 500 status

    Behavior:
    - Requires user authentication
    - Queries the tag table to retrieve all tag names
    - Returns a simple list of all available interest names
    """
    # Check if user is authenticated
    current_user = get_user_session_info()
    if not current_user["user_id"]:
        return jsonify({"error": "Unauthorized"}), 403

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
    cur = mysql.connection.cursor()
    try:
        cur.execute(
            "SELECT tag_name FROM tag WHERE school_id = %s", (session.get("school"),)
        )
        result = cur.fetchall()
        all_interests = [row[0] for row in result]
        return jsonify({"interests": all_interests}), 200
    except Exception as e:
        print(f"Error fetching all interests: {e}")
        return jsonify({"error": "Failed to fetch all interests"}), 500
    finally:
        cur.close()


@interests_bp.route("/edit-interests", methods=["POST"])
def editinterestpage():
    """
    Update the current user's interests.
    Authentication is required to access this endpoint.

    Request JSON Parameters:
        interests (list): A list of interest names to be associated with the user

    Returns:
        JSON response:
        - On successful update:
            {"message": "Interests updated successfully"}, 200 status
        - On unauthorized access:
            {"error": "Unauthorized"}, 403 status
        - On invalid input:
            {"error": "Invalid data provided"}, 400 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On update failure:
            {"error": str}, 500 status

    Behavior:
    - Requires user authentication
    - Validates input data structure
    - Replaces all existing user interests with the new list
    - Uses database transactions for data integrity
    """
    # Check if user is authenticated
    current_user = get_user_session_info()
    if not current_user["user_id"]:
        return jsonify({"error": "Unauthorized"}), 403

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500

    if not request.is_json:
        return jsonify({"error": "Invalid data provided"}), 400

    data = request.get_json()
    if not data or "interests" not in data:
        return jsonify({"error": "Invalid data provided"}), 400

    interests = data["interests"]
    if not isinstance(interests, list):
        return jsonify({"error": "Invalid data provided"}), 400

    cur = mysql.connection.cursor()
    try:
        # Start transaction
        cur.execute("START TRANSACTION")

        # Remove existing interests
        cur.execute(
            "DELETE FROM user_tags WHERE user_id = %s",
            (current_user["user_id"],),
        )

        # Insert new interests
        for interest in interests:
            cur.execute(
                """INSERT INTO user_tags (user_id, tag_id)
                    SELECT %s, tag_id FROM tag WHERE tag_name = %s""",
                (current_user["user_id"], interest),
            )

        # Commit transaction
        mysql.connection.commit()
        cur.close()
        return jsonify({"message": "Interests updated successfully"}), 200

    except Exception as e:
        # Rollback on error
        mysql.connection.rollback()
        cur.close()
        print(f"Error updating interests: {e}")
        return jsonify({"error": "Failed to update interests"}), 500


@interests_bp.route("/add-tag", methods=["POST"])
def add_tag():
    """
    Add a new tag (interest) to the system.
    Faculty authentication is required to access this endpoint.

    Request JSON Parameters:
        tag_name (str): Name of the new tag to be added

    Returns:
        JSON response:
        - On successful tag creation:
            {"message": f"Interest '{tag_name}' added successfully!"}, 201 status
        - On unauthorized access:
            {"error": "Unauthorized"}, 403 status
        - On insufficient privileges:
            {"error": "Faculty privileges required"}, 403 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On invalid input:
            {"error": "No data provided"}, 400 status
            {"error": "Tag name is required"}, 400 status
        - On duplicate tag:
            {"error": f"Interest '{tag_name}' already exists."}, 400 status

    Behavior:
    - Requires faculty authentication
    - Validates input data
    - Prevents duplicate tag creation
    - Adds new tag to the database
    """

    # Check if user is authenticated and has faculty privileges
    current_user = get_user_session_info()
    if not current_user["user_id"]:
        return jsonify({"error": "Unauthorized"}), 403
    if not current_user["isFaculty"]:
        return jsonify({"error": "Faculty privileges required"}), 403

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500

    if not request.is_json:
        return jsonify({"error": "No data provided"}), 400

    data = request.get_json()
    if not data or "tag_name" not in data:
        return jsonify({"error": "Tag name is required"}), 400

    tag_name = data["tag_name"].strip()
    if not tag_name:
        return jsonify({"error": "Tag name is required"}), 400

    cur = mysql.connection.cursor()
    try:
        # Check if tag already exists
        cur.execute(
            "SELECT tag_id FROM tag WHERE tag_name = %s AND school_id = %s",
            (tag_name, session.get("school")),
        )
        if cur.fetchone():
            cur.close()
            return jsonify({"error": f"Interest '{tag_name}' already exists."}), 400

        # Add new tag
        cur.execute(
            "INSERT INTO tag (tag_name, school_id) VALUES (%s, %s)",
            (tag_name, session.get("school")),
        )
        mysql.connection.commit()
        cur.close()
        return jsonify({"message": f"Interest '{tag_name}' added successfully!"}), 201

    except Exception as e:
        print(e)
        mysql.connection.rollback()
        cur.close()
        return jsonify({"error": "Failed to add interest"}), 500


@interests_bp.route("/remove-tag", methods=["DELETE"])
def remove_tag():
    """
    Remove an existing tag (interest) from the system.
    Faculty authentication is required to access this endpoint.

    Request JSON Parameters:
        tag_name (str): Name of the tag to be removed

    Returns:
        JSON response:
        - On successful tag deletion:
            {"message": f"Interest '{tag_name}' removed successfully!"}, 200 status
        - On unauthorized access:
            {"error": "Unauthorized"}, 403 status
        - On insufficient privileges:
            {"error": "Faculty privileges required"}, 403 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On invalid input:
            {"error": "No data provided"}, 400 status
            {"error": "Tag name is required"}, 400 status
        - On non-existent tag:
            {"error": f"Interest '{tag_name}' does not exist."}, 404 status

    Behavior:
    - Requires faculty authentication
    - Validates input data
    - Verifies tag existence before deletion
    - Removes tag from the database
    """

    # Check if user is authenticated and has faculty privileges
    current_user = get_user_session_info()
    if not current_user["user_id"]:
        return jsonify({"error": "Unauthorized"}), 403
    if not current_user["isFaculty"]:
        return jsonify({"error": "Faculty privileges required"}), 403

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500

    if not request.is_json:
        return jsonify({"error": "No data provided"}), 400

    data = request.get_json()
    if not data or "tag_name" not in data:
        return jsonify({"error": "Tag name is required"}), 400

    tag_name = data["tag_name"].strip()
    if not tag_name:
        return jsonify({"error": "Tag name is required"}), 400

    cur = mysql.connection.cursor()
    try:
        # Check if tag exists
        cur.execute(
            "SELECT tag_id FROM tag WHERE tag_name = %s AND school_id = %s",
            (tag_name, session.get("school")),
        )
        if not cur.fetchone():
            cur.close()
            return jsonify({"error": f"Interest '{tag_name}' does not exist."}), 404

        # Remove tag
        cur.execute(
            "DELETE FROM tag WHERE tag_name = %s AND school_id = %s",
            (tag_name, session.get("school")),
        )
        mysql.connection.commit()
        cur.close()
        return jsonify({"message": f"Interest '{tag_name}' removed successfully!"}), 200

    except Exception as e:
        mysql.connection.rollback()
        cur.close()
        return jsonify({"error": "Failed to remove interest"}), 500
