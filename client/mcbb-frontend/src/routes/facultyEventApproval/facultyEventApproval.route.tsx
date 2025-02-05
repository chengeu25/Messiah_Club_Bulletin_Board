import { useLoaderData, Form, useSubmit } from 'react-router-dom';
import { EventType, UserType } from '../../types/databaseTypes';
import { useMemo } from 'react';

/**
 * Faculty Event Approval component displaying unapproved events.
 *
 * @component
 * @description Renders a list of unapproved events with approve and decline buttons:
 * - Displays events grouped by day
 * - Supports approving and declining events
 * - Shows a message when no unapproved events are found
 *
 * @returns {React.ReactElement} Rendered faculty event approval dashboard with events
 */
const FacultyEventApproval = () => {
  const { events, user } = useLoaderData() as {
    events: EventType[];
    user: UserType;
  };
  const submit = useSubmit();

  const groupedEvents = useMemo(() => {
    return (events || []).reduce((acc: { [key: string]: EventType[] }, event: EventType) => {
      const date = new Date(event.startTime).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    }, {});
  }, [events]);

  return (
    <div className='flex flex-col p-4 sm:px-[15%] items-center w-full h-full overflow-y-auto'>
      <h1 className='text-3xl font-bold'>Unapproved Events</h1>
      {Object.keys(groupedEvents).length === 0 ? (
        <p>No unapproved events found.</p>
      ) : (
        Object.keys(groupedEvents).map((date) => (
          <div key={date}>
            <h2>{date}</h2>
            <ul>
              {groupedEvents[date].map((event) => (
                <li key={event.id}>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <Form method="post">
                    <input type="hidden" name="event_id" value={event.id} />
                    <button type="submit" name="action_type" value="details">
                      Event Details
                    </button>
                    <button type="submit" name="action_type" value="approve">
                      Approve
                    </button>
                    <button type="submit" name="action_type" value="decline">
                      Decline
                    </button>
                  </Form>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default FacultyEventApproval;