from datetime import datetime, timezone, timedelta
from flask import session
from extensions import mysql


def get_user_session_info():
    """
    Retrieve the current user's session information.

    This helper function checks the user's session status, verifies active session,
    and retrieves comprehensive user details from the database.

    Returns:
        dict: A dictionary containing user session information with the following keys:
        - user_id (str or None): User's email/identifier
        - name (str or None): User's full name
        - emailVerified (bool or None): Email verification status
        - isFaculty (bool or None): Faculty status
        - canDeleteFaculty (bool or None): Permission to delete faculty
        - clubAdmins (list or None): List of club IDs administered by the user
        - tags (list or None): List of user's interest tags

    Behavior:
    - Checks session last activity timestamp
    - Verifies user is still active in the database
    - Retrieves user details, club administrations, and tags
    - Returns a default dict if no active session or session expired
    - Handles potential database connection errors

    Security Considerations:
    - Validates session timestamp
    - Prevents unauthorized access to user information
    - Handles database connection errors gracefully
    """
    # Default return dictionary for no active session or errors
    default_return = {
        "user_id": None,
        "name": None,
        "emailVerified": None,
        "isFaculty": None,
        "canDeleteFaculty": None,
        "clubAdmins": None,
        "tags": None,
    }

    # Check session activity
    last_activity = session.get("last_activity")
    user_id = session.get("user_id")

    # Validate session
    if (
        user_id is None
        or last_activity is None
        or datetime.now(timezone.utc) - last_activity >= timedelta(minutes=15)
    ):
        return default_return

    # Check database connection
    if not mysql.connection:
        return default_return

    try:
        cur = mysql.connection.cursor()

        # Fetch user details
        cur.execute(
            """SELECT email, email_verified, name, is_faculty, can_delete_faculty
                FROM users 
                WHERE email = %s
                    AND is_active = 1
            """,
            (user_id,),
        )
        result = cur.fetchone()

        # If no user found, return default
        if result is None:
            cur.close()
            return default_return

        # Fetch club administrations
        cur.execute(
            """SELECT a.club_id 
            FROM club_admin a
            INNER JOIN users u ON u.email = a.user_id
            WHERE a.user_id = %s
                AND u.is_active = 1
                AND a.is_active = 1
            """,
            (user_id,),
        )
        result_2 = cur.fetchall()
        club_admins = list(map(lambda x: x[0], result_2)) if result_2 else None

        # Fetch user tags
        cur.execute(
            """SELECT tag_name 
            FROM tag t 
            INNER JOIN user_tags ut 
                ON t.tag_id = ut.tag_id 
            WHERE ut.user_id = %s""",
            (user_id,),
        )
        result_3 = cur.fetchall()
        tags = list(map(lambda x: x[0], result_3)) if result_3 else None

        cur.close()

        # Update last activity
        session["last_activity"] = datetime.now(timezone.utc)

        # Return user session information
        return {
            "user_id": user_id,
            "name": result[2],
            "emailVerified": result[1],
            "isFaculty": result[3],
            "canDeleteFaculty": result[4],
            "clubAdmins": club_admins,
            "tags": tags,
        }

    except Exception as e:
        print(e)
        return default_return
