from flask import Blueprint, jsonify, session
from extensions import mysql


school_bp = Blueprint("school", __name__)


@school_bp.route("/", methods=["GET"])
def get_school():
    """
    Retrieve detailed information about a specific school.

    This endpoint fetches comprehensive school data based on the provided school identifier
    from the session.

    Returns:
        JSON response with school details, including:
        - name: Full name of the school
        - location: Geographic location of the school
        - type: Type of school (e.g., high school, college)
        - additional metadata

    Raises:
        404 Error: If the school with the given ID is not found
        500 Error: If there's a database connection or query error
    """
    try:
        school_id = session.get("school")
        if not mysql.connection:
            return jsonify({"error": "Database connection error"}), 500
        cursor = mysql.connection.cursor()
        query = "SELECT email_domain, school_name, school_logo, school_color FROM school WHERE school_id = %s"
        cursor.execute(query, (school_id if school_id else 0,))
        school = cursor.fetchone()
        cursor.close()

        if not school:
            return jsonify({"error": "School not found"}), 404

        return (
            jsonify(
                {
                    "emailDomain": school[0],
                    "name": school[1],
                    "logo": school[2],
                    "color": school[3],
                    "id": school_id,
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500


@school_bp.route("/all", methods=["GET"])
def get_all_schools():
    """
    Retrieve a list of all schools with their IDs and names.

    Returns:
        JSON response containing a list of schools with:
        - school_id: Unique identifier for each school
        - name: Name of the school
        - emailDomain: Email domain associated with the school
        - color: Color associated with the school

    Raises:
        500 Error: If there's a database connection or query error
    """
    try:
        if not mysql.connection:
            return jsonify({"error": "Database connection error"}), 500

        cursor = mysql.connection.cursor()
        query = "SELECT school_id, school_name, email_domain, school_color FROM school"
        cursor.execute(query)
        schools = cursor.fetchall()
        cursor.close()

        schools_list = [
            {
                "id": school[0],
                "name": school[1],
                "emailDomain": school[2],
                "color": school[3],
            }
            for school in schools
        ]

        return jsonify(schools_list), 200
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
