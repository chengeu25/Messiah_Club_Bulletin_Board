import threading
import time
from datetime import datetime, timezone, timedelta
import schedule
from collections import defaultdict
import atexit

from flask import current_app, Flask
from extensions import mysql
from helper.send_email import send_email
from routes.events import get_events_by_date
from config import Config

stop_event = threading.Event()


def filter_events(user, events):
    """
    Filter events based on user's email event type preferences.

    Args:
        user (dict): User information containing email preferences and tags
        events (list): List of events to filter

    Returns:
        list: Filtered list of events matching user's preferences

    Filtering logic:
    - 'Suggested': Events with shared tags and not blocked
    - 'Hosted by Subscribed Clubs': Events from subscribed clubs
    - 'Attending': Events the user has RSVP'd to
    """
    if user["email_event_type"] == "Suggested":
        return list(
            filter(
                lambda x: x["rsvp"] != "block"  # Not rsvp'd no
                and len(list(set(x["tags"]) & set(user["tags"]))) > 0,  # Shared tags
                events,
            )
        )
    elif user["email_event_type"] == "Hosted by Subscribed Clubs":
        return list(
            filter(
                lambda x: x["subscribed"],
                events,
            )
        )
    elif user["email_event_type"] == "Attending":
        return list(
            filter(
                lambda x: x["rsvp"] == "rsvp",
                events,
            )
        )

    # If no matching event type, return all events
    return events


def convert_times(event):
    """
    Convert event start and end times to a human-readable format.

    Args:
        event (dict): Event dictionary containing start and end times

    Returns:
        dict: Event dictionary with converted start and end times
    """
    start = datetime.fromisoformat(event["startTime"])
    end = datetime.fromisoformat(event["endTime"])
    event.update(
        {
            "startTime": start.strftime("%I:%M %p"),
            "endTime": end.strftime("%I:%M %p"),
        }
    )
    return event


def sort_events(events):
    """
    Sort events by date.

    Args:
        events (list): List of event dictionaries

    Returns:
        list: List of tuples containing the date and corresponding events
    """
    # Dictionary to hold events grouped by date
    events_by_date = defaultdict(list)

    # Iterate through the events and group them by date
    for event in events:
        # Parse the startTime to get the date
        date_str = event["startTime"][:10]  # Get the date part (YYYY-MM-DD)
        date_obj = datetime.strptime(date_str, "%Y-%m-%d")  # Convert to datetime object
        formatted_date = date_obj.strftime("%A, %B %d")  # Format the date
        convert_times(event)
        events_by_date[formatted_date].append(event)

    # Convert the dictionary to a list of tuples
    return [(date, events) for date, events in events_by_date.items()]


def send_email_notifications():
    """
    Send personalized email notifications to users about upcoming events.

    Workflow:
    1. Create a Flask application context
    2. Fetch active, non-banned users with email preferences
    3. Retrieve user-specific tags
    4. Fetch events for each user based on their preferences
    5. Filter and compose personalized email notifications
    6. Send emails to users with relevant events

    The function handles both daily and weekly email frequencies,
    filtering events based on user's preferences such as:
    - Suggested events with shared tags
    - Events from subscribed clubs
    - Events the user is attending
    """
    # Create an application context without importing main.py
    app = Flask(__name__)
    app.config.from_object(Config)
    mysql.init_app(app)

    with app.app_context():
        try:
            with mysql.connection.cursor() as cursor:
                # Fetch active, non-banned users with email preferences
                cursor.execute(
                    """SELECT u.email, u.email_frequency, u.email_event_type, u.school_id, s.school_name 
                        FROM users u
                        INNER JOIN school s 
                            ON s.school_id = u.school_id
                        WHERE 
                            email_frequency != 'Never' AND
                            is_active = 1 AND 
                            is_banned = 0
                """
                )
                initial_users = list(map(lambda x: list(x), cursor.fetchall()))
                for u in initial_users:
                    cursor.execute(
                        """SELECT t.tag_name 
                            FROM user_tags ut 
                            INNER JOIN tag t 
                                ON ut.tag_id = t.tag_id 
                            WHERE user_id = %s""",
                        (u[0],),
                    )
                    tags = list(map(lambda x: x[0], cursor.fetchall()))
                    u.append(tags)
                users = list(
                    map(
                        lambda user: (
                            {
                                "email": user[0],
                                "email_frequency": user[1],
                                "email_event_type": user[2],
                                "school_id": user[3],
                                "school_name": user[4],
                                "tags": user[5],
                            }
                        ),
                        initial_users,
                    )
                )

                for user in users:
                    if user["email_frequency"] == "Daily":
                        current_date = datetime.now(timezone.utc)
                        one_day_later = current_date + timedelta(days=1)
                        cd_iso = current_date.isoformat()
                        odl_iso = one_day_later.isoformat()
                        events = get_events_by_date(
                            cursor, cd_iso, odl_iso, user["school_id"], user["email"]
                        )
                        if "events" in events:
                            events = events["events"]
                            events = filter_events(user, events)
                            email_body = compose_event_email(events)
                            send_email(
                                user["email"],
                                f"Today at {user['school_name']}",
                                email_body,
                                True,
                            )
                    elif user["email_frequency"] == "Weekly":
                        current_date = datetime.now(timezone.utc)
                        one_week_later = current_date + timedelta(weeks=1)
                        if not current_date.weekday() == 0:
                            return
                        cd_iso = current_date.isoformat()
                        owl_iso = one_week_later.isoformat()
                        events = get_events_by_date(
                            cursor, cd_iso, owl_iso, user["school_id"], user["email"]
                        )
                        if "events" in events:
                            events = events["events"]
                            events = filter_events(user, events)
                            email_body = compose_event_email(events)
                            send_email(
                                user["email"],
                                f"This Week at {user['school_name']}",
                                email_body,
                                True,
                            )

        except Exception as e:
            current_app.logger.error(f"Error in email notification job: {e}")


def compose_event_email(events):
    """
    Compose a formatted email body from a list of events.

    Args:
        events (list): List of event dictionaries containing event details

    Returns:
        str: Formatted email body with event information

    The email body includes:
    - Event title
    - Event start time
    - Event hosts
    - Event description
    """
    email_body = "<h1>Upcoming Events:</h1>"
    for day in sort_events(events):
        email_body += f"<h2>{day[0]}</h2><ul>"
        for event in day[1]:
            host_names = [host["name"] for host in event["host"]]
            cost = event["cost"]
            email_body += (
                f"<li><h3>{event['title']} from {event['startTime']} to {event['endTime']}</h3><ul>"
                f"<li>Hosted by: {', '.join(host_names)}</li>"
                f"<li>Location: {event['location']}</li>"
                f"<li>Cost: {f'${cost}' if cost is not None else 'Free'}</li>"
                f"<li>Interests: {', '.join(event['tags'])}</li>"
                f"<li>Description: {event['description']}</li></ul></li>"
            )
        email_body += "</ul>"
    return email_body


def run_scheduler():
    """
    Run the email notification scheduler.

    This function sets up scheduled tasks for sending email notifications:
    - Daily emails at 7 AM
    - Weekly emails every Monday at 7 AM

    The scheduler runs continuously, checking and executing
    pending scheduled tasks.
    """
    # Schedule daily emails at 7 AM
    schedule.every().day.at("07:00").do(send_email_notifications)

    # Schedule weekly emails every Monday at 7 AM
    schedule.every().monday.at("07:00").do(send_email_notifications)

    while not stop_event.is_set():
        schedule.run_pending()
        time.sleep(1)


def start_email_scheduler():
    """
    Start the email scheduler in a separate thread.

    Creates and starts a daemon thread that runs the email notification
    scheduler. The thread will continue running in the background,
    executing scheduled email notification tasks.

    Returns:
        threading.Thread: The scheduler thread
    """
    scheduler_thread = threading.Thread(target=run_scheduler)
    scheduler_thread.daemon = (
        True  # Allow the thread to be killed when the main program exits
    )
    scheduler_thread.start()
    return scheduler_thread


def stop_email_scheduler():
    """
    Stop the email scheduler by setting the stop event.
    """
    stop_event.set()


# Register the stop_email_scheduler function to be called on program exit
atexit.register(stop_email_scheduler)
