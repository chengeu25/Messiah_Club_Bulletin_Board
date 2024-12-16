from flask import Blueprint, jsonify
from extensions import mysql


school_bp = Blueprint("school", __name__)


@school_bp.route("/<school_id>", methods=["GET"])
def get_school(school_id):
    """
    Retrieve detailed information about a specific school.

    This endpoint fetches comprehensive school data based on the provided school identifier.

    Path Parameters:
        school_id (str): Unique identifier for the school to retrieve

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
        if not mysql.connection:
            return jsonify({"error": "Database connection error"}), 500
        cursor = mysql.connection.cursor()
        query = "SELECT email_domain, school_name, school_logo, school_color FROM school WHERE school_id = %s"
        cursor.execute(query, (int(school_id),))
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
                }
            ),
            200,
        )
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
