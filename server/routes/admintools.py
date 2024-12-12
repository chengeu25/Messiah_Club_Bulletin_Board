from flask import Blueprint, jsonify, request
from extensions import mysql

admintools_bp = Blueprint("admintools", __name__)


@admintools_bp.route("/assign-faculty", methods=["POST"])
def assign_faculty():
    """
    Assign faculty privileges to a verified user.

    This endpoint allows assigning faculty status to an active, verified user.
    It validates the user's existence, email verification, and sets faculty privileges.

    Expected JSON payload:
    {
        "email": str,
        "can_delete_faculty": bool
    }

    Returns:
        JSON response:
        - On successful assignment:
            {
                "name": str,
                "email": str,
                "can_delete_faculty": bool
            }, 200 status
        - On invalid input:
            {"error": "Invalid input"}, 400 status
        - On non-existent email:
            {"error": "Invalid email"}, 404 status
        - On unverified email:
            {"error": "Email not verified"}, 403 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On unexpected error:
            {"error": "An unexpected error occurred"}, 500 status

    Validation steps:
    - Checks if email exists in active users
    - Verifies email is verified
    - Sets faculty status and optional deletion privileges
    """
    data = request.get_json()

    # Validate input
    email = data.get("email")
    can_delete = data.get("can_delete_faculty")

    if not email or not isinstance(can_delete, bool):
        return jsonify({"error": "Invalid input"}), 400

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500

    cur = None

    try:
        cur = mysql.connection.cursor()

        # Check if user exists and email is verified
        cur.execute(
            """SELECT name, email_verified
               FROM users
               WHERE email = %s
                 AND is_active = 1""",
            (email,),
        )
        result = cur.fetchone()

        # If no matching email is found, return an error
        if result is None:
            return jsonify({"error": "Invalid email"}), 404

        # Check if email is verified
        is_email_verified = result[1]
        if not is_email_verified:
            return jsonify({"error": "Email not verified"}), 403

        # Update faculty status
        cur.execute(
            """UPDATE users
               SET is_faculty = 1,
                   can_delete_faculty = %s
               WHERE email = %s""",
            (can_delete, email),
        )
        mysql.connection.commit()
        return (
            jsonify(
                {"name": result[0], "email": email, "can_delete_faculty": can_delete}
            ),
            200,
        )
        # return jsonify({"message": "Faculty assigned successfully"}), 200

    except Exception as e:
        # Log the error and return an internal server error
        print(f"Error assigning faculty: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

    finally:
        if cur is not None:
            cur.close()


@admintools_bp.route("/get-faculty-data", methods=["GET"])
def get_faculty_data():
    """
    Retrieve a list of all faculty members and their privileges.

    This endpoint fetches comprehensive data about users with faculty status,
    including their names, email addresses, and deletion privileges.

    Returns:
        JSON response:
        - On successful retrieval:
            [
                {
                    "name": str,
                    "email": str,
                    "can_delete_faculty": bool
                },
                ...
            ], 200 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On unexpected error:
            {"error": "An unexpected error occurred"}, 500 status

    Data retrieval details:
    - Queries users table for faculty members
    - Returns a list of faculty with their current privileges
    - Handles potential database connection and query errors
    """
    cur = None

    try:
        if not mysql.connection:
            return jsonify({"error": "Database connection error"}), 500

        # Connect to the database
        cur = mysql.connection.cursor()

        # Query to fetch faculty data
        cur.execute(
            """
            SELECT name, email, can_delete_faculty 
            FROM users
            WHERE is_faculty = 1
        """
        )
        result = cur.fetchall()

        # Convert result into a list of dictionaries
        faculty_list = [
            {"name": row[0], "email": row[1], "can_delete_faculty": bool(row[2])}
            for row in result
        ]

        # Return the data as JSON
        return jsonify(faculty_list), 200

    except Exception as e:
        print(f"Error fetching faculty data: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

    finally:
        if "cur" in locals() and cur:
            cur.close()


@admintools_bp.route("/remove-faculty", methods=["POST"])
def remove_faculty():
    """
    Remove faculty privileges from a user.

    This endpoint revokes faculty status and related deletion privileges
    for a specified user by their email address.

    Expected JSON payload:
    {
        "email": str
    }

    Returns:
        JSON response:
        - On successful removal:
            {"message": "Faculty privileges removed"}, 200 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On unexpected error:
            {"error": "An unexpected error occurred"}, 500 status

    Privilege removal details:
    - Sets is_faculty flag to 0
    - Sets can_delete_faculty flag to 0
    - Handles database transaction and potential errors
    """
    data = request.get_json()
    cur = None

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500

    try:
        # connect to the database
        cur = mysql.connection.cursor()

        # Query to remove faculty privileges
        cur.execute(
            """
            UPDATE users
            SET is_faculty = 0,
                can_delete_faculty = 0
            WHERE email = %s""",
            (data["email"],),
        )
        mysql.connection.commit()
        return jsonify({"message": "Faculty privileges removed"}), 200

    except Exception as e:
        # Log the error and return an internal server error
        print(f"Error removing faculty: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

    finally:
        if cur is not None:
            cur.close()


@admintools_bp.route("/assign-delete", methods=["POST"])
def assign_delete():
    """
    Modify a user's faculty deletion privileges.

    This endpoint allows changing a faculty member's ability to delete
    other faculty members by updating the can_delete_faculty flag.

    Expected JSON payload:
    {
        "email": str,
        "cdf": bool  # can_delete_faculty
    }

    Returns:
        JSON response:
        - On successful modification:
            {"message": "Deletion abilities removed"}, 200 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On unexpected error:
            {"error": "An unexpected error occurred"}, 500 status

    Privilege modification details:
    - Updates can_delete_faculty flag for a specific user
    - Handles database transaction and potential errors
    - Allows granular control of faculty deletion privileges
    """
    data = request.get_json()

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500

    cur = None

    try:
        # Connect to the database
        cur = mysql.connection.cursor()

        # Query to change deletion abilities
        cur.execute(
            """UPDATE users
                SET can_delete_faculty = %s
                WHERE email = %s""",
            (
                data["cdf"],
                data["email"],
            ),
        )
        mysql.connection.commit()
        return jsonify({"message": "Deletion abilities removed"}), 200

    except Exception as e:
        # Log the error and return an internal server error
        print(f"Error removing faculty: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

    finally:
        if cur is not None:
            cur.close()
