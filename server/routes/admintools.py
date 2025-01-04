from flask import Blueprint, jsonify, request, session
from extensions import mysql
from helper.check_user import get_user_session_info

admintools_bp = Blueprint("admintools", __name__)


@admintools_bp.route("/assign-faculty", methods=["POST"])
def assign_faculty():
    """
    Assign faculty privileges to a verified user.

    This endpoint allows assigning faculty status to an active, verified user.
    It validates the user's existence, email verification, and sets faculty privileges.
    Only existing faculty members can assign faculty privileges.

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
        - On unauthorized access:
            {"error": "Unauthorized"}, 403 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On unexpected error:
            {"error": "An unexpected error occurred"}, 500 status

    Validation steps:
    - Checks if current user has faculty privileges
    - Checks if email exists in active users
    - Verifies email is verified
    - Sets faculty status and optional deletion privileges
    """
    cur = None
    try:
        # Check if current user has faculty privileges
        current_user = get_user_session_info()
        if not current_user["isFaculty"]:
            return jsonify({"error": "Unauthorized"}), 403

        data = request.get_json()

        # Validate input
        email = data.get("email")
        can_delete = data.get("can_delete_faculty")

        if not email or not isinstance(can_delete, bool):
            return jsonify({"error": "Invalid input"}), 400

        # Establish database connection
        conn = mysql.connection
        cur = conn.cursor()

        # Check if user exists and email is verified
        cur.execute(
            """SELECT name, email_verified
               FROM users
               WHERE email = %s
                 AND is_active = 1
                 AND school_id = %s""",
            (email, session.get("school")),
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
               WHERE email = %s
                AND school_id = %s""",
            (can_delete, email, session.get("school")),
        )
        conn.commit()
        return (
            jsonify(
                {"name": result[0], "email": email, "can_delete_faculty": can_delete}
            ),
            200,
        )

    except Exception as e:
        # Log the actual error for debugging
        print(f"Error assigning faculty: {str(e)}")
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
    Only faculty members can access this endpoint.

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
        - On unauthorized access:
            {"error": "Unauthorized"}, 403 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On unexpected error:
            {"error": "An unexpected error occurred"}, 500 status

    Data retrieval details:
    - Verifies current user has faculty privileges
    - Queries users table for faculty members
    - Returns a list of faculty with their current privileges
    - Handles potential database connection and query errors
    """
    cur = None
    try:
        # Check if current user has faculty privileges
        current_user = get_user_session_info()
        print(current_user)
        if not current_user["isFaculty"]:
            return jsonify({"error": "Unauthorized"}), 403

        # Establish database connection
        conn = mysql.connection
        cur = conn.cursor()

        # Query to fetch faculty data
        cur.execute(
            """SELECT name, email, can_delete_faculty 
                    FROM users
                    WHERE is_faculty = 1
                        AND is_active = 1
                        AND school_id = %s""",
            (session.get("school"),),
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
        # Log the actual error for debugging
        print(f"Error fetching faculty data: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    finally:
        if cur is not None:
            cur.close()


@admintools_bp.route("/remove-faculty", methods=["POST"])
def remove_faculty():
    """
    Remove faculty privileges from a user.

    This endpoint revokes faculty status and related deletion privileges
    for a specified user by their email address. Only faculty members with
    deletion privileges (can_delete_faculty = true) can access this endpoint.

    Expected JSON payload:
    {
        "email": str
    }

    Returns:
        JSON response:
        - On successful removal:
            {"message": "Faculty privileges removed"}, 200 status
        - On unauthorized access (not faculty):
            {"error": "Unauthorized"}, 403 status
        - On insufficient privileges (can't delete faculty):
            {"error": "Insufficient privileges"}, 403 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On unexpected error:
            {"error": "An unexpected error occurred"}, 500 status

    Validation steps:
    - Verifies current user has faculty privileges
    - Verifies current user has faculty deletion privileges
    - Removes faculty status and related privileges from target user
    - Handles database transaction and potential errors
    """
    cur = None
    try:
        # Check if current user has faculty privileges and can delete faculty
        current_user = get_user_session_info()
        if not current_user["isFaculty"]:
            return jsonify({"error": "Unauthorized"}), 403
        if not current_user["canDeleteFaculty"]:
            return jsonify({"error": "Insufficient privileges"}), 403

        data = request.get_json()

        # Establish database connection
        conn = mysql.connection
        cur = conn.cursor()

        # Query to remove faculty privileges
        cur.execute(
            """UPDATE users
                    SET is_faculty = 0,
                        can_delete_faculty = 0
                    WHERE email = %s
                        AND school_id = %s""",
            (data["email"], session.get("school")),
        )
        conn.commit()
        return jsonify({"message": "Faculty privileges removed"}), 200

    except Exception as e:
        # Log the actual error for debugging
        print(f"Error removing faculty: {str(e)}")
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
    Only faculty members with deletion privileges (can_delete_faculty = true)
    can access this endpoint.

    Expected JSON payload:
    {
        "email": str,
        "cdf": bool  # can_delete_faculty
    }

    Returns:
        JSON response:
        - On successful modification:
            {"message": "Deletion abilities updated"}, 200 status
        - On unauthorized access (not faculty):
            {"error": "Unauthorized"}, 403 status
        - On insufficient privileges (can't delete faculty):
            {"error": "Insufficient privileges"}, 403 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On unexpected error:
            {"error": "An unexpected error occurred"}, 500 status

    Validation steps:
    - Verifies current user has faculty privileges
    - Verifies current user has faculty deletion privileges
    - Updates can_delete_faculty flag for target user
    - Handles database transaction and potential errors
    """
    cur = None
    try:
        # Check if current user has faculty privileges and can delete faculty
        current_user = get_user_session_info()
        if not current_user["isFaculty"]:
            return jsonify({"error": "Unauthorized"}), 403
        if not current_user["canDeleteFaculty"]:
            return jsonify({"error": "Insufficient privileges"}), 403

        data = request.get_json()

        # Establish database connection
        conn = mysql.connection
        cur = conn.cursor()

        # Query to change deletion abilities
        cur.execute(
            """UPDATE users
                SET can_delete_faculty = %s
                WHERE email = %s
                    AND school_id = %s""",
            (
                data["cdf"],
                data["email"],
                session.get("school"),
            ),
        )
        conn.commit()
        return jsonify({"message": "Deletion abilities updated"}), 200

    except Exception as e:
        # Log the actual error for debugging
        print(f"Error changing faculty deletion abilities: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    finally:
        if cur is not None:
            cur.close()


@admintools_bp.route("/update-user/<string:email>", methods=["POST"])
def update_user(email):
    """
    Update user information by their email.

    This endpoint allows faculty members to update a user's name or email.
    Only faculty members can access this endpoint.

    URL Parameters:
    - email (string): The email of the user to update

    JSON Payload:
    {
        "name": str (optional),
        "new_email": str (optional)
    }

    Returns:
        JSON response:
        - On successful update:
            {"message": "User updated successfully"}, 200 status
        - On unauthorized access (not faculty):
            {"error": "Unauthorized"}, 403 status
        - On non-existent user:
            {"error": "User not found"}, 404 status
        - On invalid input:
            {"error": "Invalid input"}, 400 status
        - On email already in use:
            {"error": "Email already in use"}, 409 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On unexpected error:
            {"error": "An unexpected error occurred"}, 500 status

    Validation steps:
    - Verifies current user has faculty privileges
    - Checks if the target user exists
    - Validates and updates name/email
    - Checks for email uniqueness
    - Handles database transaction and potential errors
    """
    cur = None
    try:
        # Check if current user has faculty privileges
        current_user = get_user_session_info()
        if not current_user or not current_user.get("isFaculty"):
            return jsonify({"error": "Unauthorized"}), 403

        # Get request data
        data = request.get_json()
        name = data.get("name")
        new_email = data.get("new_email")

        # Validate input
        if not name and not new_email:
            return jsonify({"error": "At least one field must be updated"}), 400

        # Establish database connection
        conn = mysql.connection
        cur = conn.cursor()

        # Check if user exists
        cur.execute(
            "SELECT * FROM users WHERE email = %s AND school_id = %s",
            (email, session.get("school")),
        )
        user = cur.fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 404

        # Prepare update query
        update_fields = []
        params = []

        if name:
            update_fields.append("name = %s")
            params.append(name)

        if new_email:
            # Check email uniqueness
            cur.execute(
                "SELECT * FROM users WHERE email = %s AND school_id = %s",
                (new_email, session.get("school")),
            )
            existing_email = cur.fetchone()

            if existing_email:
                return jsonify({"error": "Email already in use"}), 409

            update_fields.append("email = %s")
            params.append(new_email)

        # Add school_id and original email to params
        params.extend([session.get("school"), email])

        # Construct and execute update query
        if update_fields:
            update_query = f"""
                UPDATE users 
                SET {', '.join(update_fields)} 
                WHERE school_id = %s AND email = %s
            """
            cur.execute(update_query, params)
            conn.commit()

        return jsonify({"message": "User updated successfully"}), 200

    except Exception as e:
        # Rollback in case of error and log the actual error for debugging
        if cur:
            conn.rollback()
        print(f"Error in update_user: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    finally:
        if cur is not None:
            cur.close()


@admintools_bp.route("/toggle-user-status/<string:email>", methods=["POST"])
def toggle_user_status(email):
    """
    Toggle a user's is_active and is_banned status.

    This endpoint allows faculty members to modify a user's account status.
    Only faculty members can access this endpoint.

    URL Parameters:
    - email (string): The email of the user to update

    JSON Payload:
    {
        "is_active": bool (optional),
        "is_banned": bool (optional)
    }

    Returns:
        JSON response:
        - On successful update:
            {
                "message": "User status updated successfully",
                "is_active": bool,
                "is_banned": bool
            }, 200 status
        - On unauthorized access (not faculty):
            {"error": "Unauthorized"}, 403 status
        - On non-existent user:
            {"error": "User not found"}, 404 status
        - On invalid input:
            {"error": "Invalid input"}, 400 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On unexpected error:
            {"error": "An unexpected error occurred"}, 500 status

    Validation steps:
    - Verifies current user has faculty privileges
    - Checks if the target user exists
    - Updates is_active and is_banned flags
    - Handles database transaction and potential errors
    """
    cur = None
    try:
        # Check if current user has faculty privileges
        current_user = get_user_session_info()
        if not current_user or not current_user.get("isFaculty"):
            return jsonify({"error": "Unauthorized"}), 403

        # Check if the user is trying to modify their own status
        if email == current_user.get("user_id"):
            return jsonify({"error": "Cannot modify your own user status"}), 403

        # Get request data
        data = request.get_json()
        is_active = data.get("is_active")
        is_banned = data.get("is_banned")

        # Validate input
        if is_active is None and is_banned is None:
            return jsonify({"error": "At least one status must be updated"}), 400

        # Establish database connection
        conn = mysql.connection
        cur = conn.cursor()

        # Check if user exists
        cur.execute(
            "SELECT is_active, is_banned FROM users WHERE email = %s AND school_id = %s",
            (email, session.get("school")),
        )
        user = cur.fetchone()

        if not user:
            return jsonify({"error": "User not found"}), 404

        # Prepare update query
        update_fields = []
        params = []

        # Use current values if not specified in the request
        current_is_active = user[0]
        current_is_banned = user[1]

        if is_active is not None:
            update_fields.append("is_active = %s")
            params.append(is_active)
        else:
            is_active = current_is_active

        if is_banned is not None:
            update_fields.append("is_banned = %s")
            params.append(is_banned)
        else:
            is_banned = current_is_banned

        # Add school_id and email to params
        params.extend([session.get("school"), email])

        # Construct and execute update query
        if update_fields:
            update_query = f"""
                UPDATE users 
                SET {', '.join(update_fields)} 
                WHERE school_id = %s AND email = %s
            """
            cur.execute(update_query, params)
            conn.commit()

        return (
            jsonify(
                {
                    "message": "User status updated successfully",
                    "is_active": is_active,
                    "is_banned": is_banned,
                }
            ),
            200,
        )

    except Exception as e:
        # Rollback in case of error and log the actual error for debugging
        if cur:
            conn.rollback()
        print(f"Error in toggle_user_status: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    finally:
        if cur is not None:
            cur.close()


@admintools_bp.route("/get-users", methods=["GET"])
def get_users():
    """
    Retrieve users based on optional search query.

    This endpoint allows faculty members to fetch user information.
    Supports optional search filtering by name or email.

    Query Parameters:
    - search (optional): Search term to filter users by name or email

    Returns:
        JSON response:
        - On successful retrieval:
            [
                {
                    "name": str,
                    "email": str,
                    "is_active": bool,
                    "is_banned": bool,
                    "is_faculty": bool
                },
                ...
            ], 200 status
        - On unauthorized access (not faculty):
            {"error": "Unauthorized"}, 403 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On unexpected error:
            {"error": "An unexpected error occurred"}, 500 status

    Validation steps:
    - Verifies current user has faculty privileges
    - Applies optional search filtering
    - Returns user information excluding sensitive data
    """
    cur = None
    try:
        # Check if current user has faculty privileges
        current_user = get_user_session_info()
        if not current_user or not current_user.get("isFaculty"):
            return jsonify({"error": "Unauthorized"}), 403

        # Get search query
        search_query = request.args.get("search", "").strip()

        # Establish database connection
        conn = mysql.connection
        cur = conn.cursor()

        # Prepare base query with optional search filtering
        query = """
            SELECT name, email, is_active, is_banned, is_faculty 
            FROM users 
            WHERE school_id = %s
        """
        params = [session.get("school")]

        if search_query:
            query += " AND (name LIKE %s OR email LIKE %s)"
            search_param = f"%{search_query}%"
            params.extend([search_param, search_param])

        cur.execute(query, params)
        users = cur.fetchall()

        # Convert results to list of dictionaries
        user_list = [
            {
                "name": user[0],
                "email": user[1],
                "is_active": bool(user[2]),
                "is_banned": bool(user[3]),
                "is_faculty": bool(user[4]),
            }
            for user in users
        ]

        return jsonify(user_list), 200

    except Exception as e:
        # Log the actual error for debugging
        print(f"Error in get_users: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500
    finally:
        if cur is not None:
            cur.close()
