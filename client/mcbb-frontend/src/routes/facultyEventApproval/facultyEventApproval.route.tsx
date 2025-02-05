import { useLoaderData, Form, useSubmit } from 'react-router-dom';
import { EventType, UserType } from '../../types/databaseTypes';
import { useMemo, useEffect } from 'react';

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

  useEffect(() => {
    console.log(events);
  }, [events]);

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
                <li key={event.id} className="mb-4 p-4 border rounded">
                  <h3 className="text-xl font-bold">{event.title}</h3>
                  <p><strong>Hosting club(s):</strong> {event.host.map(h => h.name).join(', ')}</p>
                  <p><strong>Event Name:</strong> {event.title}</p>
                  <p><strong>Description:</strong> {event.description}</p>
                  <p><strong>Start Date:</strong> {new Date(event.startTime).toLocaleString()}</p>
                  <p><strong>End Date:</strong> {new Date(event.endTime).toLocaleString()}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                  <p><strong>Event Photos:</strong> {Array.isArray(event.images) && event.images.length > 0 ? event.images.map((img, index) => (
                    <img key={index} src={`data:image/jpeg;base64,${img.image}`} alt={event.title} className="w-32 h-32 object-cover" />
                  )) : 'No photos available'}</p>
                  <p><strong>Event Cost:</strong> {event.cost ? `$${event.cost}` : 'Free'}</p>
                  <p><strong>Event Tags:</strong> {event.tags.join(', ')}</p>
                  <p><strong>Gender Restriction:</strong> {event.genderRestriction || 'None'}</p>
                  <Form method="post" className="mt-2">
                    <input type="hidden" name="event_id" value={event.id} />
                    <button type="submit" name="action_type" value="approve_event" className="mr-2 p-2 bg-green-500 text-white rounded">
                      Approve
                    </button>
                    <button type="submit" name="action_type" value="decline_event" className="p-2 bg-red-500 text-white rounded">
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