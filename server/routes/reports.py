from flask import Blueprint, jsonify, request, session
from extensions import mysql
from helper.check_user import get_user_session_info

reports_bp = Blueprint("reports", __name__)


def resolve_params(params, id):
    return_val = []
    for param in params:
        if param == "ID":
            return_val.append(id)
        elif param == "School":
            return_val.append(session.get("school"))
        else:
            return_val.append(param)
    return return_val


@reports_bp.route("/", methods=["POST"])
def get_report():
    # Get the report name and parameters from the request
    request_json = request.json if request.json is not None else {}
    obj_id = request_json.get("objId")
    query = request_json.get("query")
    club_id = request_json.get("clubId") if "clubId" in request_json else obj_id
    params = request_json.get("params")
    if params is None:
        params = []
    access = request_json.get("access")

    # Connect to the MySQL database
    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500

    # Check user access
    user = get_user_session_info()
    if (
        not user["user_id"]  # User is not authenticated
        or (
            (not user["isFaculty"]) and access == "Faculty"
        )  # User is not a faculty member and report access is faculty-only
        or (
            ((club_id not in user["clubAdmins"]) and access == "Club Admin")
            if (club_id is not None)
            else False
        )  # User is not a club admin and report access is club admin-only
    ):
        return jsonify({"error": "Unauthorized"}), 403

    if not mysql.connection:
        return jsonify({"error": "Database connection error"}), 500

    # Create a cursor to execute the report query
    cursor = mysql.connection.cursor()

    # Execute the report query
    try:
        print(query)
        print(tuple(resolve_params(params, obj_id)))
        cursor.execute(query, tuple(resolve_params(params, obj_id)))
        report = cursor.fetchall()
        column_titles = [desc[0] for desc in cursor.description]
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

    # Close the cursor and connection
    cursor.close()

    # Return the report data as JSON
    return jsonify({"report": report, "columns": column_titles}), 200
