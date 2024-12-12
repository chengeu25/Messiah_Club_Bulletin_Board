import base64
from flask import Blueprint, jsonify, request
from extensions import mysql


clubs_bp = Blueprint("clubs", __name__)


@clubs_bp.route("/clubs", methods=["GET"])
def get_clubs():
    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
    cur = mysql.connection.cursor()
    cur.execute(
        "SELECT club_id, club_name, description, club_logo, logo_prefix FROM club WHERE is_active = 1"
    )
    result = None
    try:
        result = cur.fetchall()
        result = list(
            map(
                lambda x: {
                    "id": x[0],
                    "name": x[1],
                    "description": x[2],
                    "image": (
                        f"{x[4]},{base64.b64encode(x[3]).decode('utf-8')}"
                        if x[3]
                        else None
                    ),
                },
                result,
            )
        )
    except TypeError as e:
        print(e)
        result = None
    if result is None:
        return jsonify({"error": "No clubs found"}), 404
    try:
        cur.execute(
            """SELECT c.club_id, t.tag_name 
                FROM club_tags c 
                INNER JOIN tag t 
                    ON c.tag_id = t.tag_id""",
        )
        tags = cur.fetchall()
        tags = list(map(lambda x: {"tag": x[1], "club_id": x[0]}, tags))
        result = list(
            map(
                lambda x: {
                    **x,
                    "tags": list(
                        map(
                            lambda y: y["tag"],
                            filter(lambda y: y["club_id"] == x["id"], tags),
                        )
                    ),
                },
                result,
            )
        )
    except TypeError as e:
        print(e)
    cur.close()
    return jsonify(result), 200


@clubs_bp.route("/inactive-clubs", methods=["GET"])
def get_inactive_clubs():
    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
    cur = mysql.connection.cursor()
    cur.execute(
        "SELECT club_id, club_name, description, club_logo, logo_prefix FROM club WHERE is_active = 0"
    )
    result = None
    try:
        result = cur.fetchall()
        result = list(
            map(
                lambda x: {
                    "id": x[0],
                    "name": x[1],
                    "description": x[2],
                    "image": (
                        f"{x[4]},{base64.b64encode(x[3]).decode('utf-8')}"
                        if x[3]
                        else None
                    ),
                },
                result,
            )
        )
    except TypeError as e:
        print(e)
        result = None
    if result is None:
        return jsonify({"error": "No clubs found"}), 404
    try:
        cur.execute(
            """SELECT c.club_id, t.tag_name 
                FROM club_tags c 
                INNER JOIN tag t 
                    ON c.tag_id = t.tag_id""",
        )
        tags = cur.fetchall()
        tags = list(map(lambda x: {"tag": x[1], "club_id": x[0]}, tags))
        result = list(
            map(
                lambda x: {
                    **x,
                    "tags": list(
                        map(
                            lambda y: y["tag"],
                            filter(lambda y: y["club_id"] == x["id"], tags),
                        )
                    ),
                },
                result,
            )
        )
    except TypeError as e:
        print(e)
    cur.close()
    return jsonify(result), 200


@clubs_bp.route("/club/<club_id>", methods=["GET"])
def get_club(club_id):
    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
    cur = mysql.connection.cursor()
    cur.execute(
        """SELECT club_id, club_name, description, club_logo, logo_prefix 
            FROM club 
            WHERE club_id = %s""",
        (club_id,),
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
                AND a.is_active = 1""",
        (club_id,),
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
    cur.close()
    return jsonify(result), 200


@clubs_bp.route("/update-club", methods=["PUT"])
def update_club():
    data = request.json
    if data is None:
        return jsonify({"error": "No data provided"}), 400
    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
    cur = mysql.connection.cursor()
    cur.execute(
        "SELECT COUNT(*) FROM club WHERE is_active = 1 AND club_name = %s AND club_id != %s",
        (data["name"], data["id"]),
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
    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
    cur = mysql.connection.cursor()
    mysql.connection.rollback()
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
    data = request.json
    if data is None:
        return jsonify({"error": "No data provided"}), 400
    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500
    cur = mysql.connection.cursor()

    # Check if a club with the same name already exists
    cur.execute(
        "SELECT COUNT(*) FROM club WHERE is_active = 1 AND club_name = %s",
        (data["name"],),
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
            "INSERT INTO club (club_name, is_active, description, last_updated, club_logo, logo_prefix) VALUES (%s, 1, %s, CURRENT_TIMESTAMP(), %s, %s)",
            (data["name"], data["description"], image_data, prefix),
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
