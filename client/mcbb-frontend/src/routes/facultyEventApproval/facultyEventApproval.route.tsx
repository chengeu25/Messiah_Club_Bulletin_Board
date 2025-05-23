import {
  useLoaderData,
  Form,
  useActionData,
  useSubmit
} from 'react-router-dom';
import { EventType } from '../../types/databaseTypes';
import { useMemo, useEffect } from 'react';
import Button from '../../components/formElements/Button.component';
import { CgDetailsMore } from 'react-icons/cg';
import { FaCheck, FaTimes } from 'react-icons/fa';
import useLoading from '../../hooks/useLoading';
import Loading from '../../components/ui/Loading';
import { useNotification } from '../../contexts/NotificationContext';

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
  const { events } = useLoaderData() as {
    events: EventType[];
  };
  const { loading } = useLoading();
  const actionData = useActionData() as { success: boolean; message: string };
  const { addNotification } = useNotification();
  const submit = useSubmit();

  const groupedEvents = useMemo(() => {
    return (events || []).reduce(
      (acc: { [key: string]: EventType[] }, event: EventType) => {
        const date = new Date(event.startTime).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(event);
        return acc;
      },
      {}
    );
  }, [events]);

  useEffect(() => {
    if (actionData) {
      addNotification(
        actionData.message,
        actionData.success ? 'success' : 'error'
      );
    }
  }, [actionData]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const submitter = (e.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement;
    formData.append('action_type', submitter.value);

    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const action = formData.get('action_type') as
      | 'details'
      | 'approve_event'
      | 'decline_event';
    if (action === 'approve_event') {
      addNotification('Approval request sent to server', 'info');
      submit(formData, { method: 'post' });
    } else if (action === 'decline_event') {
      addNotification('Decline request sent to server', 'info');
      submit(formData, { method: 'post' });
    } else {
      submit(formData, { method: 'post' });
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <div className='container mx-auto p-4 h-full overflow-y-auto'>
      <h1 className='text-3xl font-bold mb-6'>Pending Event Approvals</h1>
      {Object.keys(groupedEvents).length === 0 ? (
        <p className='text-gray-500'>No pending approvals at the moment.</p>
      ) : (
        Object.keys(groupedEvents).map((date) => (
          <div key={date} className='mb-8'>
            <h2 className='text-2xl font-semibold mb-4'>
              {new Date(date).toLocaleDateString()}
            </h2>
            <ul>
              {groupedEvents[date].map((event) => (
                <li
                  key={event.id}
                  className='mb-6 p-6 border rounded-lg shadow-lg bg-white flex flex-col md:flex-row justify-between'
                >
                  <div className='md:w-2/3'>
                    <h3 className='text-xl font-bold mb-2'>{event.title}</h3>
                    <p className='mb-2'>
                      <strong>Hosting club(s):</strong>{' '}
                      {event.host.map((h) => h.name).join(', ')}
                    </p>
                    <p className='mb-2'>
                      <strong>Description:</strong> {event.description}
                    </p>
                    <p className='mb-2'>
                      <strong>Start Date:</strong>{' '}
                      {new Date(event.startTime).toLocaleString()}
                    </p>
                    <p className='mb-2'>
                      <strong>End Date:</strong>{' '}
                      {new Date(event.endTime).toLocaleString()}
                    </p>
                    <p className='mb-2'>
                      <strong>Location:</strong> {event.location}
                    </p>
                    <p className='mb-2'>
                      <strong>Event Cost:</strong>{' '}
                      {event.cost ? `$${event.cost}` : 'Free'}
                    </p>
                    <p className='mb-2'>
                      <strong>Event Tags:</strong> {event.tags.join(', ')}
                    </p>
                    <p className='mb-2'>
                      <strong>Only Allow Gender:</strong>{' '}
                      {event.genderRestriction === 'M'
                        ? 'Male'
                        : event.genderRestriction === 'F'
                        ? 'Female'
                        : 'No Restriction'}
                    </p>
                  </div>
                  <div className='mt-8 md:mt-8 md:w-1/3 flex flex-col items-center'>
                    <Form
                      method='post'
                      className='flex flex-col items-center w-full'
                      onSubmit={handleSubmit}
                    >
                      <input type='hidden' name='event_id' value={event.id} />
                      <Button
                        className='mb-2 p-4 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center w-full md:w-auto text-lg'
                        type='submit'
                        name='action_type'
                        value='details'
                      >
                        <CgDetailsMore className='mr-2' />
                        Details
                      </Button>
                      <Button
                        className='mb-2 p-4 bg-green-500 text-white rounded hover:bg-green-600 flex items-center w-full md:w-auto text-lg'
                        type='submit'
                        name='action_type'
                        value='approve_event'
                      >
                        <FaCheck className='mr-2' />
                        Approve
                      </Button>
                      <Button
                        className='p-4 bg-red-500 text-white rounded hover:bg-red-600 flex items-center w-full md:w-auto text-lg'
                        type='submit'
                        name='action_type'
                        value='decline_event'
                      >
                        <FaTimes className='mr-2' />
                        Decline
                      </Button>
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
