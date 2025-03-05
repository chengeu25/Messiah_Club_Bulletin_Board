from flask import Blueprint, jsonify, request, session
from extensions import mysql
from helper.check_user import get_user_session_info
from typing import List, Literal, TypedDict

AccessControl = Literal["Club Admin", "Faculty"]
QueryParam = Literal["School", "ID"]


class Report(TypedDict):
    name: str
    query: str
    queryParams: List[QueryParam]
    accessControl: AccessControl


class ReportObject(TypedDict):
    SCHOOL_WIDE: List[Report]
    CLUB: List[Report]
    USER: List[Report]
    EVENT: List[Report]


REPORTS: ReportObject = {
    "SCHOOL_WIDE": [
        {
            "name": "User Activity Summary",
            "query": """
                WITH rsvp_counts AS (
                    SELECT 
                        user_id, 
                        COUNT(rsvp_id) AS events_rsvpd
                    FROM rsvp
                    WHERE is_active = 1
                        AND is_yes = 1
                    GROUP BY user_id
                ),
                subscription_counts AS (
                    SELECT 
                        email, 
                        COUNT(subscription_id) AS clubs_subscribed
                    FROM user_subscription
                    WHERE is_active = 1
                        AND subscribed_or_blocked = 1
                    GROUP BY email
                ),
                tag_groups AS (
                    SELECT 
                        ut.user_id, 
                        GROUP_CONCAT(t.tag_name SEPARATOR ', ') AS interests
                    FROM user_tags ut
                    JOIN tag t ON ut.tag_id = t.tag_id
                    GROUP BY ut.user_id
                )
                SELECT 
                    u.email, 
                    u.name, 
                    COALESCE(r.events_rsvpd, 0) AS events_rsvpd, 
                    COALESCE(us.clubs_subscribed, 0) AS clubs_subscribed,
                    COALESCE(t.interests, '') AS interests
                FROM users u
                LEFT JOIN rsvp_counts r ON u.email = r.user_id
                LEFT JOIN subscription_counts us ON u.email = us.email
                LEFT JOIN tag_groups t ON u.email = t.user_id
                WHERE u.school_id = %s
                GROUP BY u.email, u.name;
            """,
            "queryParams": ["School"],
            "accessControl": "Faculty",
        }
    ],
    "CLUB": [],
    "USER": [
        {
            "name": "User Subscription History",
            "query": """
            SELECT 
                email, 
                club_id, 
                subscribed_or_blocked, 
                is_active
            FROM user_subscription
            WHERE email = %s;
        """,
            "queryParams": ["ID"],
            "accessControl": "Faculty",
        },
    ],
    "EVENT": [],
}

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
    category = request_json.get("category")
    obj_id = request_json.get("objId")
    if category is None:
        return jsonify({"error": "Missing report category"}), 400
    name = request_json.get("name")
    if name is None:
        return jsonify({"error": "Missing report name"}), 400
    report = next(
        (item for item in REPORTS.get(category) if item["name"] == name), None
    )
    if report is None:
        return jsonify({"error": "Report not found"}), 404
    query = report.get("query")
    club_id = report.get("clubId") if "clubId" in request_json else obj_id
    params = report.get("queryParams")
    if params is None:
        params = []
    access = request_json.get("accessControl")

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
        print(e)
        return jsonify({"error": f"Database error: {str(e)}"}), 500

    # Close the cursor and connection
    cursor.close()

    # Return the report data as JSON
    return jsonify({"report": report, "columns": column_titles}), 200


@reports_bp.route("/names/<category>", methods=["GET"])
def get_report_names(category):
    if category not in REPORTS:
        return jsonify({"error": "Invalid report category"}), 400
    return (
        jsonify({"names": list(map(lambda report: report["name"], REPORTS[category]))}),
        200,
    )
