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
        },
        {
            "name": "Subscriptions and RSVPs by Tag",
            "query": """
                WITH rsvp_counts AS
                (
                SELECT
                    et.tag_id,
                    COUNT(DISTINCT r.rsvp_id) AS rsvp_count
                FROM rsvp r
                JOIN event_tags et ON r.event_id = et.event_id
                WHERE r.is_yes = 1
                    AND r.is_active = 1
                GROUP BY et.tag_id
                ), club_counts AS
                (
                SELECT
                    ct.tag_id,
                    COUNT(DISTINCT us.subscription_id) AS club_count
                FROM user_subscription us
                JOIN club_tags ct ON us.club_id = ct.club_id
                WHERE us.is_active = 1
                    AND us.subscribed_or_blocked = 1
                GROUP BY ct.tag_id
                )
                SELECT 
                    t.tag_name, 
                    COALESCE(rc.rsvp_count, 0) AS events_rsvpd, 
                    COALESCE(cc.club_count, 0) AS clubs_subscribed
                FROM tag t
                LEFT JOIN rsvp_counts rc ON t.tag_id = rc.tag_id
                LEFT JOIN club_counts cc ON t.tag_id = cc.tag_id
                WHERE t.school_id = %s
                GROUP BY t.tag_name, rc.rsvp_count, cc.club_count;
            """,
            "queryParams": ["School"],
            "accessControl": "Faculty",
        },
        {
            "name": "Frequency of Tag Use",
            "query": """
                WITH user_tag_counts AS (
                    SELECT 
                        t.tag_name, 
                        COUNT(ut.user_id) AS usage_count
                    FROM user_tags ut
                    JOIN tag t ON ut.tag_id = t.tag_id
                    WHERE t.school_id = %s
                    GROUP BY t.tag_name
                ),
                club_tag_counts AS (
                    SELECT 
                        t.tag_name, 
                        COUNT(ct.club_id) AS usage_count
                    FROM club_tags ct
                    JOIN tag t ON ct.tag_id = t.tag_id
                    WHERE t.school_id = %s
                    GROUP BY t.tag_name
                ),
                event_tag_counts AS (
                    SELECT 
                        t.tag_name, 
                        COUNT(et.event_id) AS usage_count
                    FROM event_tags et
                    JOIN tag t ON et.tag_id = t.tag_id
                    WHERE t.school_id = %s
                    GROUP BY t.tag_name
                )
                SELECT 
                    t.tag_name, 
                    COALESCE(utc.usage_count, 0) + COALESCE(ctc.usage_count, 0) + COALESCE(etc.usage_count, 0) AS total_usage_count
                FROM tag t
                LEFT JOIN user_tag_counts utc ON t.tag_name = utc.tag_name
                LEFT JOIN club_tag_counts ctc ON t.tag_name = ctc.tag_name
                LEFT JOIN event_tag_counts etc ON t.tag_name = etc.tag_name
                WHERE t.school_id = %s
                GROUP BY t.tag_name;
            """,
            "queryParams": ["School", "School", "School", "School"],
            "accessControl": "Faculty",
        },
        {
            "name": "Clubs Created This Year",
            "query": """
                SELECT 
                    c.club_name, 
                    c.creation_date
                FROM club c
                WHERE c.school_id = %s;
            """,
            "queryParams": ["School"],
            "accessControl": "Faculty",
        },
    ],
    "CLUB": [
        {
            "name": "List of Club Subscribers",
            "query": """
                SELECT 
                    u.email, 
                    u.name,
                    u.gender,
                    CASE 
                        WHEN MONTH(CURDATE()) < 7 THEN  -- Current semester is Spring
                            (YEAR(CURDATE()) - YEAR_STARTED) * 2 + 
                            (CASE 
                                WHEN SEMESTER_STARTED = 'Fall' THEN 0  -- Started in Fall
                                ELSE 1  -- Started in Spring
                            END)
                        ELSE  -- Current semester is Fall
                            (YEAR(CURDATE()) - YEAR_STARTED) * 2 + 
                            (CASE 
                                WHEN SEMESTER_STARTED = 'Fall' THEN 1  -- Started in Fall
                                ELSE 2  -- Started in Spring
                            END)
                    END AS semesters_completed
                FROM user_subscription us
                JOIN users u ON us.email = u.email
                WHERE us.club_id = %s
                    AND us.is_active = 1
                    AND us.subscribed_or_blocked = 1;
            """,
            "queryParams": ["ID"],
            "accessControl": "Club Admin",
        },
        {
            "name": "Club Events and RSVPs",
            "query": """
                SELECT 
                    e.event_name, 
                    e.start_time AS event_date,
                    COUNT(r.rsvp_id) AS total_rsvps
                FROM event e
                JOIN event_tags et ON e.event_id = et.event_id
                JOIN club_tags ct ON et.tag_id = ct.tag_id
                LEFT JOIN rsvp r ON e.event_id = r.event_id 
                    AND r.is_active = 1 
                    AND r.is_yes = 1
                WHERE ct.club_id = %s  -- Filtering only by the specific club ID
                GROUP BY e.event_id, e.event_name, e.start_time;
            """,
            "queryParams": ["ID"],
            "accessControl": "Club Admin",
        },
        {
            "name": "Number of Events, Subscriptions, and RSVPs",
            "query": """
                SELECT
                    count(eh.event_id) as Events,
                    count(distinct us.subscription_id) as Subscriptions,
                    count(r.rsvp_id) as RSVPs
                FROM user_subscription us
                JOIN club c on us.club_id = c.club_id
                JOIN event_host eh on c.club_id = eh.club_id
                LEFT JOIN rsvp r on eh.event_id = r.event_id
                WHERE c.club_id = %s;
            """,
            "queryParams": ["ID"],
            "accessControl": "Faculty",
        },
    ],
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
        {
            "name": "List of Comments Created by a Given User",
            "query": """
                SELECT 
                    u.name AS user_name,
                    c.content, 
                    c.posted_timestamp
                FROM comments c
                JOIN users u ON c.user_id = u.email
                WHERE c.user_id = %s;
            """,
            "queryParams": ["ID"],
            "accessControl": "Faculty",
        },
        {
            "name": "User RSVP History",
            "query": """
                SELECT
                    user_id,
                    event_id,
                    is_active,
                    is_yes
                FROM rsvp
                WHERE user_id = %s;
            """,
            "queryParams": ["ID"],
            "accessControl": "Faculty",
        },
    ],
    "EVENT": [
        {
            "name": "Users RSVPd",
            "query": """
                SELECT 
                    e.event_name,
                    u.email,
                    u.name,
                    u.gender,
                    CASE 
                        WHEN MONTH(CURDATE()) < 7 THEN  -- Current semester is Spring
                            (YEAR(CURDATE()) - YEAR_STARTED) * 2 + 
                            (CASE 
                                WHEN SEMESTER_STARTED = 'Fall' THEN 0  -- Started in Fall
                                ELSE 1  -- Started in Spring
                            END)
                        ELSE  -- Current semester is Fall
                            (YEAR(CURDATE()) - YEAR_STARTED) * 2 + 
                            (CASE 
                                WHEN SEMESTER_STARTED = 'Fall' THEN 1  -- Started in Fall
                                ELSE 2  -- Started in Spring
                            END)
                    END AS semesters_completed
                FROM rsvp r
                INNER JOIN users u ON r.user_id = u.email
                INNER JOIN event e ON r.event_id = e.event_id
                WHERE r.event_id = %s
                    AND r.is_active = 1
                    AND r.is_yes = 1;
            """,
            "queryParams": ["ID"],
            "accessControl": "Faculty",
        }
    ],
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
