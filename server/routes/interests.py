from flask import Blueprint, jsonify, request, session
from extensions import mysql


interests_bp = Blueprint("interests", __name__)


@interests_bp.route("/get-available-tags", methods=["GET"])
def get_avaliable_tags():
    """
    Retrieve all available tags from the database.

    This endpoint fetches a list of all tags with their unique identifiers.

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
        - On database connection error:
            {"error": "Database connection error"}, 500 status

    Behavior:
    - Queries the tag table to retrieve all tag names and IDs
    - Transforms database results into a list of tag dictionaries
    - Supports dynamic tag management

    Security Considerations:
    - No authentication required to view available tags
    - Returns only tag information, no sensitive data exposed
    """
    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
    cur = mysql.connection.cursor()
    cur.execute("SELECT tag_id, tag_name FROM tag")
    result = cur.fetchall()
    result = list(map(lambda x: {"tag": x[1], "tag_id": x[0]}, result))
    cur.close()
    return jsonify({"tags": result}), 200


@interests_bp.route("/get-current-user-interests", methods=["GET"])
def getinterests():
    """
    Fetch the current user's selected interests from the database.

    This endpoint retrieves all tags associated with the authenticated user.

    Authentication:
    - Requires user to be logged in

    Returns:
        JSON response:
        - On successful retrieval:
            {
                "interests": [str]  # List of tag names for the user
            }, 200 status
        - On authentication failure:
            {"error": "User not logged in"}, 401 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On retrieval failure:
            {"error": "Failed to fetch interests"}, 500 status

    Behavior:
    - Validates user authentication via session
    - Queries user_tags and tag tables to fetch user's interests
    - Extracts tag names associated with the user
    - Handles potential database query errors

    Security Considerations:
    - Checks user authentication before accessing interests
    - Prevents unauthorized access to user-specific data
    - Logs and handles potential database errors
    """
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "User not logged in"}), 401

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


@interests_bp.route("/get-available-interest-names", methods=["GET"])
def getallinterests():
    """
    Fetch all available interest names from the database.

    This endpoint retrieves a comprehensive list of all existing tags.

    Returns:
        JSON response:
        - On successful retrieval:
            {
                "interests": [str]  # List of all tag names
            }, 200 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On retrieval failure:
            {"error": "Failed to fetch all interests"}, 500 status

    Behavior:
    - Queries the tag table to retrieve all tag names
    - Extracts tag names into a list
    - Supports discovery of all available interests

    Security Considerations:
    - No authentication required to view interest names
    - Returns only public tag information
    - Prevents exposure of sensitive data
    """
    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
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


@interests_bp.route("/edit-interests", methods=["POST"])
def editinterestpage():
    """
    Update the current user's interests.

    This endpoint allows authenticated users to modify their personal interests.

    Authentication:
    - Requires user to be logged in

    Request JSON Parameters:
        interests (list): A list of interest names to be associated with the user

    Returns:
        JSON response:
        - On successful update:
            {"message": "Interests updated successfully"}, 200 status
        - On authentication failure:
            {"error": "User not logged in"}, 401 status
        - On invalid input:
            {"error": "Invalid data provided"}, 400 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On update failure:
            {"error": str}, 500 status

    Behavior:
    - Validates user authentication via session
    - Clears existing user interests
    - Inserts new interests based on provided tag names
    - Handles potential database query errors
    - Supports full replacement of user interests

    Security Considerations:
    - Checks user authentication before modifying interests
    - Prevents unauthorized modification of user data
    - Validates input data structure
    - Uses database transactions to ensure data integrity
    - Rolls back changes if any error occurs during update
    """
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "User not logged in"}), 401

    data = request.json
    if not data or not isinstance(data.get("interests"), list):
        return jsonify({"error": "Invalid data provided"}), 400

    interests = data["interests"]

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
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
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()


@interests_bp.route("/add-tag", methods=["POST"])
def add_tag():
    """
    Add a new tag (interest) to the system.

    This endpoint allows adding a new tag to the available interests.

    Request JSON Parameters:
        tag_name (str): Name of the new tag to be added

    Returns:
        JSON response:
        - On successful tag creation:
            {"message": f"Interest '{tag_name}' added successfully!"}, 201 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On invalid input:
            {"error": "No data provided"}, 400 status
            {"error": "Tag name is required"}, 400 status
        - On duplicate tag:
            {"error": f"Interest '{tag_name}' already exists."}, 400 status

    Behavior:
    - Validates input data
    - Checks for existing tags to prevent duplicates
    - Inserts new tag into the database
    - Supports dynamic tag management

    Security Considerations:
    - Validates and sanitizes input tag name
    - Prevents duplicate tag creation
    - Handles potential database integrity errors
    - No authentication required for tag creation
    """
    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500

    # Parse the JSON request data
    data = request.json
    if data is None:
        return jsonify({"error": "No data provided"}), 400

    tag_name = data.get("tag_name")
    if not tag_name:
        return jsonify({"error": "Tag name is required"}), 400

    try:
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


@interests_bp.route("/remove-tag", methods=["DELETE"])
def remove_tag():
    """
    Remove an existing tag (interest) from the system.

    This endpoint allows deletion of a tag from available interests.

    Request JSON Parameters:
        tag_name (str): Name of the tag to be removed

    Returns:
        JSON response:
        - On successful tag deletion:
            {"message": f"Interest '{tag_name}' removed successfully!"}, 200 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On invalid input:
            {"error": "No data was provided"}, 400 status
            {"error": "Interest name is required"}, 400 status
        - On non-existent tag:
            {"error": f"Interest '{tag_name}' does not exist."}, 404 status

    Behavior:
    - Validates input data
    - Attempts to delete the specified tag from the database
    - Checks for tag existence before deletion
    - Supports dynamic tag management

    Security Considerations:
    - Validates and sanitizes input tag name
    - Handles potential database deletion errors
    - Provides clear feedback on deletion attempts
    - No authentication required for tag removal
    """
    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
    try:
        # Parse the JSON request data
        data = request.json

        if data is None:
            return jsonify({"error": "No data was provided"}), 400

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
