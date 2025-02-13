import React, { useState } from 'react';
import Card from '../../../components/ui/Card';
import { IoMdTime } from 'react-icons/io';
import { IoLocationOutline } from 'react-icons/io5';
import { RiAccountCircleLine } from 'react-icons/ri';
import { FaDollarSign } from 'react-icons/fa6';
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useParams,
  useSubmit,
  useNavigate
} from 'react-router-dom';
import Button from '../../../components/formElements/Button.component';
import Input from '../../../components/formElements/Input.component';
import Comment from '../../../components/forums/Comment.component';
import {
  EventDetailType,
  ImageType,
  UserType
} from '../../../types/databaseTypes';
import { format } from 'date-fns';
import RSVPDropdown from '../../../components/specialDropdowns/RSVPDropdown.component';

/**
 * Event details page component.
 *
 * @component Event
 * @description Renders a comprehensive view of an event's details
 *
 * @returns {JSX.Element} Fully rendered event details page
 *
 * @workflow
 * 1. Retrieve event details from loader data
 * 2. Display event information in structured cards
 * 3. Show event metadata (time, location, organizers, cost)
 * 4. Render event description and tags
 * 5. Display event images
 * 6. Provide comment section with placeholder comments
 *
 * @features
 * - RSVP dropdown for event interaction
 * - Dynamic event information rendering
 * - Responsive design with card-based layout
 * - Placeholder comment section
 */
const Event = () => {
  // Retrieve event details from loader
  const { event, user } = useLoaderData() as {
    event: EventDetailType;
    user: UserType;
  };
  const submit = useSubmit();
  const { imageId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);

  if (!event) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-xl font-semibold text-red-500'>
          Event details could not be loaded. Please try again later.
        </p>
      </div>
    );
  }

  const handleApproval = async (action: string) => {
    if (!confirm(`Are you sure you want to ${action} this event?`)) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events/${action}_event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ event_id: event.id })
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(`Event ${action}d successfully`);
      } else {
        setMessage(`Failed to ${action} event: ${result.error}`);
      }

      navigate(0); // Reload the page to reflect the changes
    } catch (error) {
      console.error(`Error ${action}ing event:`, error);
      if (error instanceof Error) {
        setMessage(`Error ${action}ing event: ${error.message}`);
      } else {
        setMessage(`Error ${action}ing event`);
      }
    }
  };

  return (
    <div className='flex flex-col p-4 sm:px-[5%] lg:px-[10%] items-center w-full h-full overflow-y-auto gap-4'>
      {/* Display success or failure message */}
      {message && (
        <div className={`p-4 rounded mb-4 ${message.includes('successfully') ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
          <strong>{message}</strong>
        </div>
      )}

      {/* Event title and RSVP section */}
      <Card
        color='gray-300'
        padding={4}
        className='w-full flex gap-2 relative flex-row justify-between items-center'
      >
        <h1 className='font-bold text-4xl flex-grow'>{event?.title}</h1>

        {/* Cancel Event Button */}
        <Form
          onSubmit={(e) => {
            if (!confirm('Are you sure you want to cancel this event?')) {
              e.preventDefault(); // Prevent the form from submitting if the user cancels
            }
          }}
          method='post'
          className='flex-shrink-0'
        >
          {user?.clubAdmins?.some((adminClubId) =>
            event.host.some((host) => host.id === adminClubId)
          ) && (
            <Button
              type='submit'
              name='action'
              value='cancel'
              text='Cancel Event'
              className='bg-gray-500 text-white rounded hover:bg-red-500'
            />
          )}
          <input type='hidden' name='id' value={event.id} />
        </Form>

        {/* RSVP Dropdown */}
        <Form className='flex-shrink-0 flex'>
          <RSVPDropdown
            handleRSVPClick={(type) =>
              submit(
                { id: event.id, type: type, action: 'rsvp' },
                { method: 'post' }
              )
            }
            initialValue={event?.rsvp}
          />
        </Form>
      </Card>

      {/* Approve/Decline Buttons for Faculty */}
      {user?.isFaculty && !event?.isApproved && (
        <div className='flex gap-2 mt-4'>
          <Button
            text='Approve Event'
            className='bg-green-500 text-white rounded hover:bg-green-600'
            onClick={() => handleApproval('approve')}
          />
          <Button
            text='Decline Event'
            className='bg-red-500 text-white rounded hover:bg-red-600'
            onClick={() => handleApproval('decline')}
          />
        </div>
      )}

      {/* Event metadata section */}
      <div className='flex flex-col w-full gap-4 m-2'>
        <Card color='gray-300' padding={4} className='flex-col gap-2 w-full'>
          <p className='flex flex-row gap-2 items-center flex-wrap'>
            <IoMdTime size={24} /> <strong>Time:</strong>{' '}
            {format(new Date(event?.startTime), 'MM/dd/yyyy HH:mm')} -{' '}
            {format(new Date(event?.endTime), 'MM/dd/yyyy HH:mm')}
          </p>
          <p className='flex flex-row gap-2 items-center flex-wrap'>
            <IoLocationOutline size={24} /> <strong>Location:</strong>{' '}
            {event?.location}
          </p>
          <p className='flex flex-row gap-2 items-center flex-wrap'>
            <RiAccountCircleLine size={24} /> <strong>Organizer(s):</strong>{' '}
            {event?.host.map((h) => (
              <Link
                to={`/dashboard/club/${h.id}`}
                key={h.id}
                className={'underline text-blue-600'}
              >
                {h.name}
              </Link>
            ))}
          </p>
          <p className='flex flex-row gap-2 items-center'>
            <FaDollarSign size={24} /> <strong>Cost:</strong>{' '}
            {event?.cost ?? 'FREE'}
          </p>
        </Card>
      </div>

      {/* Event description */}
      <Card color='gray-300' padding={4} className='w-full flex-col gap-2'>
        <p>{event?.description}</p>
      </Card>

      {/* Event tags */}
      {(event?.tags?.length ?? 0) > 0 && (
        <div className='inline-flex flex-row w-full gap-2 items-center flex-wrap'>
          {event?.tags?.map((tag: string, index: number) => (
            <Card
              key={index}
              color='gray-300'
              padding={4}
              className='w-min text-nowrap'
            >
              {tag}
            </Card>
          ))}
        </div>
      )}

      {/* Event images */}
      <div className='flex flex-row w-full gap-4 overflow-x-auto min-h-48 mt-2'>
        {event?.images?.map((image: ImageType) => {
          const [prefix, base64Image] = image?.image?.split(',') ?? ['', ''];
          return (
            <img
              src={`data:image/${prefix};base64,${base64Image}`}
              alt={event.title}
              className='w-auto h-full object-contain rounded-lg'
              tabIndex={0}
              onClick={() =>
                navigate(`/dashboard/event/${event.id}/images/${image.id}`)
              }
            />
          );
        })}
      </div>

      {/* Comment section */}
      <hr className='border-2 border-black w-full mt-2' />
      <h1 className='text-3xl font-bold text-left w-full'>Discuss</h1>
      <div className='flex flex-row w-full gap-2 items-center'>
        <Input
          label='Add a Comment: '
          placeholder='Comment'
          name='comment'
          type='text'
          filled={false}
          labelOnSameLine
        />
        <div className='flex-shrink-0'>
          <Button text='Comment' filled={true} className='w-auto' />
        </div>
      </div>

      {/* Placeholder comments */}
      <div className='w-full flex flex-col align-left gap-2'>
        <Comment
          creator='User'
          content='Comment Lorem ipsum dolor sit amet, consectetur adipiscing
          elit, sed do eiusmod tempor incididunt ut labore et dolore magna
          aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
          laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
          in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.'
          lastModified={new Date()}
        />
        <Comment
          creator='User'
          content='Comment Lorem ipsum dolor sit amet, consectetur adipiscing
          elit, sed do eiusmod tempor incididunt ut labore et dolore magna
          aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
          laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
          in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.'
          lastModified={new Date()}
          indentLevel={1}
        />
        <Comment
          creator='User'
          content='Comment Lorem ipsum dolor sit amet, consectetur adipiscing
          elit, sed do eiusmod tempor incididunt ut labore et dolore magna
          aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
          laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
          in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.'
          lastModified={new Date()}
        />
      </div>
      {imageId !== null && imageId !== '' && imageId !== undefined && (
        <div className='w-full h-full absolute top-0 left-0 bg-black/50'>
          <Outlet />
        </div>
      )}
    </div>
  );
};

export default Event;