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
    <div className="container mx-auto p-4 h-screen overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6">Pending Event Approvals</h1>
      {Object.keys(groupedEvents).length === 0 ? (
        <p className="text-gray-500">No pending approvals at the moment.</p>
      ) : (
        Object.keys(groupedEvents).map((date) => (
          <div key={date} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{new Date(date).toLocaleDateString()}</h2>
            <ul>
              {groupedEvents[date].map((event) => (
                <li key={event.id} className="mb-6 p-6 border rounded-lg shadow-lg">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-2/3">
                      <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                      <p className="mb-2"><strong>Hosting club(s):</strong> {event.host.map(h => h.name).join(', ')}</p>
                      <p className="mb-2"><strong>Description:</strong> {event.description}</p>
                      <p className="mb-2"><strong>Start Date:</strong> {new Date(event.startTime).toLocaleString()}</p>
                      <p className="mb-2"><strong>End Date:</strong> {new Date(event.endTime).toLocaleString()}</p>
                      <p className="mb-2"><strong>Location:</strong> {event.location}</p>
                      <p className="mb-2"><strong>Event Cost:</strong> {event.cost ? `$${event.cost}` : 'Free'}</p>
                      <p className="mb-2"><strong>Event Tags:</strong> {event.tags.join(', ')}</p>
                      <p className="mb-2"><strong>Gender Restriction:</strong> {event.genderRestriction || 'None'}</p>
                    </div>
                    <div className="md:w-1/3 md:pl-4">
                      <p className="mb-2"><strong>Event Photos:</strong></p>
                      <div className="flex flex-wrap">
                        {Array.isArray(event.images) && event.images.length > 0 ? event.images.map((img, index) => (
                          <img key={index} src={`data:image/jpeg;base64,${img.image}`} alt={event.title} className="w-32 h-32 object-cover m-1" />
                        )) : <p>No photos available</p>}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Form method="post" className="flex">
                      <input type="hidden" name="event_id" value={event.id} />
                      <button type="submit" name="action_type" value="approve_event" className="mr-2 p-2 bg-green-500 text-white rounded hover:bg-green-600">
                        Approve
                      </button>
                      <button type="submit" name="action_type" value="decline_event" className="p-2 bg-red-500 text-white rounded hover:bg-red-600">
                        Decline
                      </button>
                    </Form>
                  </div>
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