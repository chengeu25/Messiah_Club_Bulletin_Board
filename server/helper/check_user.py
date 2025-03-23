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
    session_id = session.get("session_id")
    school_id = session.get("school")

    # Check for explicit logout flag
    if session.get("is_logged_out", False):
        print("GET_USER_SESSION_INFO: Session explicitly logged out")
        session.clear()
        return default_return

    # Validate session
    if (
        session_id is None
        or last_activity is None
        or datetime.now(timezone.utc) - last_activity
        >= timedelta(minutes=60)  # Extend session timeout to 60 minutes
    ):
        print("GET_USER_SESSION_INFO: Invalid session - clearing")
        session.clear()
        return default_return

    # Establish database connection
    try:
        conn = mysql.connection
        cur = conn.cursor()
    except Exception as e:
        print(f"GET_USER_SESSION_INFO: Database connection error: {e}")
        session.clear()
        return default_return

    try:
        # Retrieve user email and session details using the session token
        cur.execute(
            """SELECT sm.user_email, sm.expires_at
               FROM session_mapping sm
               WHERE sm.session_id = %s""",
            (session_id,),
        )
        session_data = cur.fetchone()

        # If no session data is found, clear the session
        if not session_data:
            print("GET_USER_SESSION_INFO: Session not found")
            session.clear()
            return default_return

        user_email, expires_at = session_data

        # Ensure `expires_at` is timezone-aware
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        # Compare with the current UTC time
        if datetime.now(timezone.utc) > expires_at:
            print("GET_USER_SESSION_INFO: Session expired")
            cur.execute(
                "DELETE FROM session_mapping WHERE session_id = %s", (session_id,)
            )
            conn.commit()
            session.clear()
            return default_return

        # Fetch user details
        cur.execute(
            """SELECT email, email_verified, name, is_faculty, can_delete_faculty, is_banned, gender
               FROM users 
               WHERE email = %s
                 AND is_active = 1
                 AND school_id = %s""",
            (user_email, school_id),
        )
        result = cur.fetchone()

        # If no user found or user is banned, return default
        if result is None or result[5] == 1:
            print("GET_USER_SESSION_INFO: No user found or user is banned")
            cur.close()
            session.clear()
            return default_return

        # Fetch club admins
        cur.execute(
            """SELECT a.club_id 
               FROM club_admin a
               INNER JOIN users u ON u.email = a.user_id
               WHERE a.user_id = %s
                 AND u.is_active = 1
                 AND a.is_active = 1""",
            (user_email,),
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
            (user_email,),
        )
        result_3 = cur.fetchall()
        tags = list(map(lambda x: x[0], result_3)) if result_3 else None

        cur.close()

        # Update last activity
        session["last_activity"] = datetime.now(timezone.utc)

        # Construct and return user info
        return {
            "user_id": user_email,
            "name": result[2],
            "emailVerified": result[1],
            "isFaculty": result[3],
            "canDeleteFaculty": result[4],
            "clubAdmins": club_admins,
            "tags": tags,
            "gender": result[6],
        }

    except Exception as e:
        print(f"GET_USER_SESSION_INFO: Session validation error: {e}")
        session.clear()
        return default_return
