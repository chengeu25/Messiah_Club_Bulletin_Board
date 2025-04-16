import base64
from flask import Blueprint, jsonify, request, session
from extensions import mysql
from helper.check_user import get_user_session_info
import traceback
import json
from helper.send_email import send_email


clubs_bp = Blueprint("clubs", __name__)


@clubs_bp.route("/clubs", methods=["GET"])
def get_clubs():
    """
    Retrieve a list of all active clubs with their details.

    This endpoint fetches all active clubs from the database (or inactive, if
    specified), including their ID, name, description, and logo. It also retrieves
    and attaches tags for each club. Authentication is required to access this endpoint.

    Query Parameters:
        - 'filter' (optional): Filter clubs by 'Subscribed', 'Suggested', or none
        - 'inactive' (optional): Filter clubs by being inactive, or not inactive (default)

    Returns:
        JSON response with the following structure:
        - On success:
            {
                "clubs": [
                    {
                        "id": int,
                        "name": str,
                        "description": str,
                        "tags": [str]
                    }
                ]
            }
        - On unauthorized access:
            {"error": "Unauthorized"}, 403 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On no clubs found:
            {"error": "No clubs found"}, 404 status

    Raises:
        TypeError: If there's an issue processing the database results
    """
    try:
        filter_query = request.args.get("filter")
        inactive_query = request.args.get("inactive")
        filter_query = filter_query if filter_query else ""
        inactive_query = "0" if inactive_query else "1"

        # Check if user is authenticated
        current_user = get_user_session_info()
        if not current_user["user_id"]:
            return jsonify({"error": "Unauthorized"}), 403

        if not mysql.connection:
            return jsonify({"error": "Database connection error"}), 500

        # Get current school id
        school = session.get("school")

        cur = mysql.connection.cursor()

        # First query to fetch club details without club_logo
        cur.execute(
            """SELECT c.club_id, 
                    c.club_name, 
                    c.description, 
                    COALESCE(us.subscribed_or_blocked, 0) AS subscribed_or_blocked,
                    GROUP_CONCAT(DISTINCT t.tag_name SEPARATOR ',') AS tags
                FROM club c
                LEFT JOIN user_subscription us
                    ON c.club_id = us.club_id
                    AND us.email = %s
                    AND us.is_active = 1
                LEFT JOIN club_tags ct
                    ON c.club_id = ct.club_id
                LEFT JOIN tag t
                    ON ct.tag_id = t.tag_id
                    AND t.school_id = %s
                WHERE c.is_active = %s
                    AND c.school_id = %s
                    AND ((us.subscribed_or_blocked = 1 
                            AND us.is_active = 1) 
                        OR (%s <> 'Subscribed'))
                    AND (%s <> 'Suggested' 
                        OR ((us.is_active = 1 
                            AND us.subscribed_or_blocked = 1)
                            OR (EXISTS (
                                SELECT * FROM user_tags ut
                                WHERE ut.user_id = %s
                                    AND ut.tag_id IN (SELECT tag_id FROM club_tags WHERE club_id = c.club_id)
                            ) AND (NOT (us.is_active = 1 AND us.subscribed_or_blocked = 0)
                                    OR us.email IS NULL))))
                GROUP BY c.club_id, c.club_name, c.description, subscribed_or_blocked""",
            (
                current_user["user_id"],
                school,
                inactive_query,
                school,
                filter_query,
                filter_query,
                current_user["user_id"],
            ),
        )
        clubs = cur.fetchall()

        if not clubs:
            return jsonify({"error": "No clubs found"}), 404

        result = [
            {
                "id": club[0],
                "name": club[1],
                "description": club[2],
                "subscribed": True if (club[3] == 1 or club[3] == True) else False,
                "tags": club[4].split(",") if club[4] else [],
            }
            for club in clubs
        ]

        cur.close()
        return jsonify(result), 200

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@clubs_bp.route("/images", methods=["POST"])
def get_images():
    """
    Retrieve images for specified clubs.

    This endpoint fetches images for specified clubs, returning a dictionary
    where the keys are club IDs and the values are the image paths.

    Request Body:
        club_ids (list): List of club IDs to fetch images for
        is_active (bool): Whether to fetch active or inactive clubs

    Returns:
        JSON response:
        - On successful image retrieval:
            {
                "images": [
                    {
                        id: int,
                        image: str
                    }
                ]
            }, 200 status
        - On unauthorized access:
            {"error": "Unauthorized"}, 403 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status

    Behavior:
    - Requires an active MySQL database connection
    - Fetches images for specified clubs
    - Converts timestamps to UTC
    """
    club_ids = request.json.get("club_ids")
    is_active = request.json.get("is_active")
    if not isinstance(club_ids, list):
        return jsonify({"error": "Invalid data provided"}), 400

    for club_id in club_ids:
        if not isinstance(club_id, int):
            return jsonify({"error": "Invalid data provided"}), 400

    current_user = get_user_session_info()
    if not current_user["user_id"]:
        return jsonify({"error": "Unauthorized"}), 403

    if is_active == False and not current_user["isFaculty"]:
        return jsonify({"error": "Unauthorized"}), 403

    try:
        if not mysql.connection:
            return jsonify({"error": "Database connection error"}), 500

        cur = mysql.connection.cursor()
        format_strings = ",".join(["%s"] * len(club_ids))
        cur.execute(
            f"""SELECT club_id, club_logo, logo_prefix
                FROM club
                WHERE club_id IN ({format_strings}) 
                    AND is_active = %s""",
            tuple(
                [*club_ids, 0 if ((not is_active) and current_user["isFaculty"]) else 1]
            ),
        )
        logos = cur.fetchall()
        logos_dict = {logo[0]: (logo[1], logo[2]) for logo in logos}

        result = [
            {
                "id": logo[0],
                "image": (
                    f"{logos_dict[logo[0]][1]},{base64.b64encode(logos_dict[logo[0]][0]).decode('utf-8')}"
                    if logo[0] in logos_dict and logos_dict[logo[0]][0]
                    else None
                ),
            }
            for logo in logos
        ]

        cur.close()
        return jsonify(result), 200

    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@clubs_bp.route("/club/<club_id>", methods=["GET"])
def get_club(club_id):
    """
    Retrieve detailed information about a specific club.

    This endpoint fetches comprehensive details for a club by its ID, including:
    - Basic club information (name, description, logo)
    - Active club administrators
    - Club images
    - Club tags
    Authentication is required to access this endpoint.

    Args:
        club_id (str): The unique identifier of the club to retrieve.

    Returns:
        JSON response with the following structure:
        {
            "id": int,
            "name": str,
            "description": str,
            "image": str (base64 encoded logo or None),
            "admins": [
                {
                    "user": str (email),
                    "id": int,
                    "name": str
                }
            ],
            "images": [
                {
                    "image": str (base64 encoded image),
                    "id": int
                }
            ],
            "tags": [
                {
                    "label": str,
                    "value": int
                }
            ]
            "isSubscribed": bool,
            "isBlocked": bool
        }

    Raises:
        - Returns 403 if user is not authenticated
        - Returns 404 if the club is not found
        - Returns 500 if there's a database connection error
    """

    school = session.get("school")

    # Check if user is authenticated
    current_user = get_user_session_info()
    if not current_user["user_id"]:
        return jsonify({"error": "Unauthorized"}), 403

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
    cur = mysql.connection.cursor()
    cur.execute(
        """SELECT club_id, club_name, description, club_logo, logo_prefix 
            FROM club 
            WHERE club_id = %s
                AND school_id = %s""",
        (club_id, school),
    )
    result = cur.fetchone()
    if result is None:
        return jsonify({"error": "The requested club was not found on the server"}), 404
    result = {
        "id": result[0],
        "name": result[1],
        "description": result[2],
        "image": (
            f"{result[4]},{base64.b64encode(result[3]).decode('utf-8')}"
            if result[3]
            else None
        ),
    }
    cur.execute(
        """SELECT a.user_id, a.club_admin_id, u.name 
            FROM club_admin a 
            INNER JOIN users u ON u.email = a.user_id
            WHERE club_id = %s
                AND a.is_active = 1
                AND u.school_id = %s""",
        (club_id, school),
    )
    result["admins"] = list(
        map(lambda x: {"user": x[0], "id": x[1], "name": x[2]}, cur.fetchall())
    )
    cur.execute(
        """SELECT image, club_photo_id, image_prefix FROM club_photo WHERE club_id = %s""",
        (club_id,),
    )
    result["images"] = list(
        map(
            lambda x: {
                "image": f"{x[2]},{base64.b64encode(x[0]).decode('utf-8')}",
                "id": x[1],
            },
            cur.fetchall(),
        )
    )
    cur.execute(
        """SELECT c.tag_id, t.tag_name 
            FROM club_tags c 
            INNER JOIN tag t 
                ON c.tag_id = t.tag_id 
            WHERE club_id = %s""",
        (club_id,),
    )
    result["tags"] = list(map(lambda x: {"label": x[1], "value": x[0]}, cur.fetchall()))
    cur.execute(
        """SELECT subscribed_or_blocked 
            FROM user_subscription
            WHERE email = %s 
                AND is_active = 1
                AND club_id = %s""",
        (current_user["user_id"], club_id),
    )
    sub_result = cur.fetchone()
    if sub_result is not None:
        if sub_result[0] == 1:
            result["isSubscribed"] = True
        else:
            result["isSubscribed"] = False
            if sub_result[0] == 0:
                result["isBlocked"] = True
            else:
                result["isBlocked"] = False
    cur.close()
    return jsonify(result), 200


@clubs_bp.route("/update-club", methods=["POST"])
def update_club():
    """
    Update an existing club's information.

    This endpoint allows updating a club's details, including:
    - Club name
    - Description
    - Logo/Image
    - Active status
    Only club administrators and faculty can update their respective clubs.

    Expects a JSON payload with the following structure:
    {
        "id": int,
        "name": str,
        "description": str,
        "image": str (optional, base64 encoded image)
        "images": [
            {
                "image": str (base64 encoded image),
                "id": int
            }
        ],
        "tags": [int]
        "admins": [str (email addresses)]
    }

    Returns:
        JSON response:
        - On successful update: Returns updated club details
        - On unauthorized access:
            {"error": "Unauthorized"}, 403 status
        - On validation error:
            {"error": "An active club with this name already exists."}, 400 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On update failure:
            {"error": "Failed to update the club"}, 400 status

    Raises:
        - Validates user is club administrator
        - Validates uniqueness of club name
        - Handles database transaction (commit/rollback)
        - Supports optional logo/image update
    """
    data = request.get_json()
    club_id = data.get("id")
    school_id = session.get("school")

    # Check if user is a club admin
    current_user = get_user_session_info()
    if not current_user["user_id"]:
        return jsonify({"error": "Unauthorized"}), 403

    # Check if user is admin of this specific club
    if (
        not current_user["clubAdmins"]
        or int(club_id) not in (int(club) for club in current_user["clubAdmins"])
    ) and not current_user["isFaculty"]:
        return jsonify({"error": "Unauthorized"}), 403

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
    cur = mysql.connection.cursor()

    # Check if the club is in the current school
    cur.execute(
        "SELECT COUNT(*) FROM club WHERE club_id = %s AND school_id = %s",
        (data["id"], school_id),
    )
    if cur.fetchone()[0] == 0:
        return jsonify({"error": "The requested club was not found on the server"}), 404

    cur.execute(
        "SELECT COUNT(*) FROM club WHERE club_name = %s AND club_id != %s AND school_id = %s",
        (data["name"], data["id"], school_id),
    )
    if not (cur.fetchone()[0] == 0):
        return jsonify({"error": "An active club with this name already exists."}), 400
    try:
        cur.execute(
            "UPDATE club SET club_name = %s, description = %s, last_updated = CURRENT_TIMESTAMP(), is_active = 1 WHERE club_id = %s",
            (data["name"], data["description"], data["id"]),
        )
    except Exception as e:
        print(e)
        mysql.connection.rollback()
        cur.close()
        return jsonify({"error": "Failed to update the club"}), 400
    try:
        if data["image"]:
            cur.execute(
                "UPDATE club SET club_logo = %s, logo_prefix = %s WHERE club_id = %s",
                (
                    base64.b64decode(data["image"].split(",")[1]),
                    data["image"].split(",")[0],
                    data["id"],
                ),
            )
    except Exception as e:
        print(e)
        mysql.connection.rollback()
        cur.close()
        return (
            jsonify(
                {
                    "error": "Failed to update the club, something may be wrong with the logo."
                }
            ),
            400,
        )
    if data["images"]:
        try:
            cur.execute(
                "DELETE FROM club_photo WHERE club_id = %s",
                (data["id"],),
            )
            for image in data["images"]:
                cur.execute(
                    "INSERT INTO club_photo (club_id, image, image_prefix) VALUES (%s, %s, %s)",
                    (
                        data["id"],
                        base64.b64decode(image["image"].split(",")[1]),
                        image["image"].split(",")[0],
                    ),
                )
        except Exception as e:
            print(e)
            mysql.connection.rollback()
            cur.close()
            return (
                jsonify(
                    {
                        "error": "Failed to update the club, something may be wrong with the images."
                    }
                ),
                400,
            )
    # Add the tags
    cur.execute("DELETE FROM club_tags WHERE club_id = %s", (data["id"],))
    for tag in data["tags"]:
        try:
            cur.execute(
                "INSERT INTO club_tags (club_id, tag_id) VALUES (%s, %s)",
                (data["id"], tag["value"]),
            )
        except Exception as e:
            print(e)
            mysql.connection.rollback()
            cur.close()
            return jsonify({"error": f"Tag {tag['label']} does not exist"}), 400
        if data["admins"]:
            try:
                # Fetch existing admin user_ids for the club
                cur.execute(
                    "SELECT user_id FROM club_admin WHERE club_id = %s",
                    (data["id"],),
                )
                existing_admins = {admin[0] for admin in cur.fetchall()}
            except Exception as e:
                print(e)
                mysql.connection.rollback()
                cur.close()
                return (
                    jsonify(
                        {
                            "error": "Failed to update the club, something may be wrong with the admin emails."
                        }
                    ),
                    400,
                )

            # Determine the new admins
            new_admins = {admin["user"] for admin in data["admins"]}

            try:
                # Set is_active to 0 for admins no longer in the list
                inactive_admins = existing_admins - new_admins
                if inactive_admins:
                    cur.execute(
                        "UPDATE club_admin SET is_active = 0 WHERE club_id = %s AND user_id IN %s",
                        (data["id"], tuple(inactive_admins)),
                    )

                # Reactivate admins who are inactive
                for admin in new_admins:
                    if admin in existing_admins:
                        cur.execute(
                            "UPDATE club_admin SET is_active = 1 WHERE club_id = %s AND user_id = %s",
                            (data["id"], admin),
                        )
                    else:
                        # Insert new admins
                        cur.execute(
                            "INSERT INTO club_admin (user_id, club_id, is_active) VALUES (%s, %s, 1)",
                            (admin, data["id"]),
                        )
            except Exception as e:
                print(e)
                mysql.connection.rollback()
                cur.close()
                return (
                    jsonify(
                        {
                            "error": "Failed to update the club, something may be wrong with the admin emails."
                        }
                    ),
                    400,
                )
    mysql.connection.commit()
    cur.close()
    return jsonify({"message": "Club updated successfully"}), 200


@clubs_bp.route("/delete-club/<club_id>", methods=["DELETE"])
def delete_club(club_id):
    """
    Soft delete a club by setting its active status to inactive.

    This endpoint marks a club as inactive in the database, effectively
    removing it from active listings without permanently deleting the record.
    Only faculty members can delete clubs.

    Args:
        club_id (str): The unique identifier of the club to be deleted.

    Returns:
        JSON response:
        - On successful deletion:
            {"message": "Club successfully deleted"}, 200 status
        - On unauthorized access (not faculty):
            {"error": "Unauthorized"}, 403 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On deletion failure:
            {"error": "Failed to delete the club"}, 400 status

    Raises:
        - Validates user has faculty privileges
        - Handles database transaction (commit/rollback)
        - Ensures database integrity during soft delete process
    """
    school = session.get("school")
    # Check if current user has faculty privileges
    current_user = get_user_session_info()
    if not current_user["isFaculty"]:
        return jsonify({"error": "Unauthorized"}), 403

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
    cur = mysql.connection.cursor()
    mysql.connection.rollback()
    # Check if the club is in the current school
    cur.execute(
        "SELECT COUNT(*) FROM club WHERE is_active = 1 AND club_id = %s AND school_id = %s",
        (int(club_id), school),
    )
    if cur.fetchone()[0] == 0:
        return jsonify({"error": "The requested club was not found on the server"}), 404
    try:
        cur.execute("UPDATE club SET is_active = 0 WHERE club_id = %s", (int(club_id),))
        cur.execute(
            "UPDATE club_admin SET is_active = 0 WHERE club_id = %s", (int(club_id),)
        )
    except Exception as e:
        print(e)
        mysql.connection.rollback()
        cur.close()
        return jsonify({"error": "Failed to delete the club"}), 400
    mysql.connection.commit()
    cur.close()
    return jsonify({"message": "Club deleted successfully"}), 200


@clubs_bp.route("/new-club", methods=["POST"])
def new_club():
    """
    Create a new club in the database.

    This endpoint handles the creation of a new club, including:
    - Validating club name uniqueness
    - Inserting club details
    - Handling optional logo/image upload
    - Managing club tags
    - Assigning initial club administrators
    Only faculty members can create new clubs.

    Expects a JSON payload with the following structure:
    {
        "name": str,
        "description": str,
        "image": str (optional, base64 encoded image),
        "tags": [int],
        "admins": [str (email addresses)],
        "images": [
            {
                "image": str (base64 encoded image),
                "id": int
            }
        ]
    }

    Returns:
        JSON response:
        - On successful creation:
            {
                "message": "Club created successfully",
                "club_id": int
            }, 201 status
        - On unauthorized access (not faculty):
            {"error": "Unauthorized"}, 403 status
        - On validation error:
            {"error": "A club with this name already exists"}, 400 status
        - On database connection error:
            {"error": "Database connection error"}, 500 status
        - On creation failure:
            {"error": "Failed to create the club"}, 400 status

    Raises:
        - Validates user has faculty privileges
        - Validates uniqueness of club name
        - Handles database transaction (commit/rollback)
        - Supports optional logo/image upload
        - Manages multiple club tags and administrators
    """
    # Check if current user has faculty privileges
    current_user = get_user_session_info()
    if not current_user["isFaculty"]:
        return jsonify({"error": "Unauthorized"}), 403

    school_id = session.get("school")

    data = request.json
    if data is None:
        return jsonify({"error": "No data provided"}), 400
    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
    cur = mysql.connection.cursor()

    # Check if a club with the same name already exists
    cur.execute(
        "SELECT COUNT(*) FROM club WHERE is_active = 1 AND club_name = %s AND school_id = %s",
        (data["name"], school_id),
    )
    if not (cur.fetchone()[0] == 0):
        return jsonify({"error": "An active club with this name already exists."}), 400

    # Create the new club instance
    base64_image = data["image"]

    try:
        base64_imagedata = base64_image.split(",")
        base64_image = base64_imagedata[1]
        prefix = base64_imagedata[0]

        image_data = base64.b64decode(base64_image)
    except Exception as e:
        return jsonify({"error": "Invalid image"}), 400
    try:
        cur.execute(
            "INSERT INTO club (club_name, is_active, description, last_updated, club_logo, logo_prefix, school_id) VALUES (%s, 1, %s, CURRENT_TIMESTAMP(), %s, %s, %s)",
            (data["name"], data["description"], image_data, prefix, school_id),
        )
    except Exception as e:
        print(e)
        mysql.connection.rollback()
        cur.close()
        return jsonify({"error": "Failed to create new club"}), 400

    # Now we need to get the ID of the new club for use in the other tables
    cur.execute(
        """SELECT club_id 
            FROM club 
            WHERE is_active = 1 
                AND club_name = %s 
                AND description = %s 
                AND club_logo = %s""",
        (data["name"], data["description"], image_data),
    )
    new_club_id = cur.fetchone()[0]

    # Add the admins
    for admin in data["admins"]:
        try:
            cur.execute(
                "INSERT INTO club_admin (user_id, club_id, is_active) VALUES (%s, %s, 1)",
                (admin["user"], new_club_id),
            )
        except Exception as e:
            print(e)
            mysql.connection.rollback()
            cur.close()
            return jsonify({"error": f"User {admin['user']} does not exist"}), 400

    # Add the photos
    for image in data["images"]:
        try:
            base64_imagedata = image["image"].split(",")
            base64_image = base64_imagedata[1]
            prefix = base64_imagedata[0]

            image_data = base64.b64decode(base64_image)
        except Exception as e:
            return jsonify({"error": "Invalid image"}), 400
        try:
            cur.execute(
                "INSERT INTO club_photo (image, club_id, image_prefix) VALUES (%s, %s, %s)",
                (image_data, new_club_id, prefix),
            )
        except Exception as e:
            print(e)
            mysql.connection.rollback()
            cur.close()
            return (
                jsonify({"error": "Failed to create new photo. It may be too large."}),
                400,
            )

    # Add the tags
    for tag in data["tags"]:
        try:
            cur.execute(
                "INSERT INTO club_tags (club_id, tag_id) VALUES (%s, %s)",
                (new_club_id, tag["value"]),
            )
        except Exception as e:
            print(e)
            mysql.connection.rollback()
            cur.close()
            return jsonify({"error": f"Tag {tag['label']} does not exist"}), 400

    # Commit the changes to the database
    mysql.connection.commit()
    cur.close()

    return jsonify({"id": int(new_club_id)}), 200


@clubs_bp.route("/club/<int:club_id>/sendEmail", methods=["POST"])
def send_email_to_club_members(club_id):
    """
    Send an email to all members of a specific club.
    """
    print(
        f"Request received to send email to club {club_id}!"
    )  # Logging the incoming request

    # Add more print statements to check where the request is failing
    # Get current user
    current_user = get_user_session_info()
    print(f"Current user session info: {current_user}")

    if not current_user["user_id"]:
        print("Unauthorized: No user session found")
        return jsonify({"error": "Unauthorized"}), 403

    # More logs for request data
    data = request.get_json()
    print(f"Received data: {data}")

    subject = data.get("subject")
    message = data.get("message")

    if not subject or not message:
        print(f"Missing required fields: subject={subject}, message={message}")
        return jsonify({"error": "Missing required fields (subject or message)"}), 400

    try:
        # Retrieve email addresses of club members
        with mysql.connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT u.email
                FROM users u
                JOIN user_subscription us ON u.email = us.EMAIL
                WHERE us.CLUB_ID = %s AND us.IS_ACTIVE = 1 AND us.SUBSCRIBED_OR_BLOCKED = 1
            """,
                (club_id,),
            )

            recipients = cursor.fetchall()

            if recipients is None:
                print(f"No recipients found for club {club_id}")
                return jsonify({"error": "No recipients found for this club"}), 404

            # Extract emails from the result
            recipients = [
                row[0] for row in recipients
            ]  # Ensure that we get just the emails

            print(f"Recipients for club {club_id}: {recipients}")  # Log recipients

        if not recipients:
            print(f"No recipients found for club {club_id}")
            return jsonify({"error": "No recipients found for this club"}), 404

        # Send email
        try:
            send_email(recipients, subject, message)
            print(f"Email sent successfully to {len(recipients)} recipients.")
        except Exception as e:
            print(f"Error in send_email: {e}")
            return jsonify({"error": f"Failed to send email: {str(e)}"}), 500

        return jsonify({"message": "Email sent successfully"}), 200
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": "An unexpected error occurred"}), 500
