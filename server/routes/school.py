from flask import Blueprint, jsonify, session, request
from extensions import mysql
import base64

school_bp = Blueprint("school", __name__)

@school_bp.route("/", methods=["GET"])
def get_school():
    """
    Retrieve detailed information about a specific school.
    """
    try:
        school_id = session.get("school")
        print(f"Retrieved school_id from session: {school_id}")

        if not school_id:
            return jsonify({"error": "School ID not found in session"}), 404

        if not mysql.connection:
            return jsonify({"error": "Database connection error"}), 500

        cursor = mysql.connection.cursor()
        query = "SELECT school_name, school_logo, school_color FROM school WHERE school_id = %s"
        cursor.execute(query, (school_id,))
        school = cursor.fetchone()
        cursor.close()

        if not school:
            return jsonify({"error": "School not found"}), 404

        # Convert the school_logo to a base64-encoded string
        school_logo_base64 = base64.b64encode(school[1]).decode('utf-8') if school[1] else None

        return jsonify({
            "name": school[0],
            "logo": school_logo_base64,
            "color": school[2],
            "id": school_id,
        }), 200
    except Exception as e:
        print(e)
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@school_bp.route("/all", methods=["GET"])
def get_all_schools():
    """
    Retrieve a list of all schools with their IDs and names.
    """
    try:
        if not mysql.connection:
            return jsonify({"error": "Database connection error"}), 500

        cursor = mysql.connection.cursor()
        query = "SELECT school_id, school_name, school_color FROM school"
        cursor.execute(query)
        schools = cursor.fetchall()
        cursor.close()

        schools_list = [
            {
                "id": school[0],
                "name": school[1],
                "color": school[2],
            }
            for school in schools
        ]

        return jsonify(schools_list), 200
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@school_bp.route("/update", methods=["PUT"])
def update_school():
    """
    Update detailed information about a specific school.
    """
    try:
        school_id = session.get("school")
        print(f"Retrieved school_id from session: {school_id}")
        if not school_id:
            return jsonify({"error": "School not found"}), 404

        data = request.get_json()
        name = data.get("name")
        color = data.get("color")
        logo = data.get("logo")

        # Log the values being passed to the query
        print(f"Updating school with ID {school_id}:")
        print(f"Name: {name}")
        print(f"Color: {color}")
        print(f"Logo: {logo}")

        if not mysql.connection:
            return jsonify({"error": "Database connection error"}), 500
        cursor = mysql.connection.cursor()
        query = """
            UPDATE school
            SET school_name = %s, school_color = %s, school_logo = %s
            WHERE school_id = %s
        """
        if logo:
            logo_data = logo.split(',')[1] if ',' in logo else logo
            cursor.execute(query, (name, color, base64.b64decode(logo_data), school_id))
        else:
            cursor.execute(query, (name, color, None, school_id))
        mysql.connection.commit()
        cursor.close()

        return jsonify({"message": "School updated successfully"}), 200
    except Exception as e:
        print(e)
        return jsonify({"error": f"Database error: {str(e)}"}), 500