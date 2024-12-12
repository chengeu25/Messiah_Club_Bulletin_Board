from flask import Blueprint, jsonify, request, session
from extensions import mysql


interests_bp = Blueprint("interests", __name__)


@interests_bp.route("/get-available-tags", methods=["GET"])
def get_avaliable_tags():
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
    """Fetch the current user's selected interests from the database."""
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
    """Fetch all available interests."""
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
    """Update the current users interests"""
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
