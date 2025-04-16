import { useEffect, useState } from 'react';
import { redirect, useLocation } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import { IoMdTime } from 'react-icons/io';
import { IoLocationOutline } from 'react-icons/io5';
import { RiAccountCircleLine } from 'react-icons/ri';
import { FaDollarSign, FaCheck, FaTimes } from 'react-icons/fa';
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
import { useSchool } from '../../../contexts/SchoolContext';
import { ImManWoman } from 'react-icons/im';
import useLoading from '../../../hooks/useLoading';
import { useNotification } from '../../../contexts/NotificationContext';

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
  const { event, user, comments } = useLoaderData() as {
    event: EventDetailType;
    user: UserType;
    comments: any[];
  };
  const submit = useSubmit();
  const { imageId } = useParams();
  const navigate = useNavigate();
  const { loading, setLoading } = useLoading();
  const { addNotification } = useNotification();

  if (!event) {
    return (
      <div className='flex items-center justify-center h-full'>
        <p className='text-xl font-semibold text-red-500'>
          Event details could not be loaded. Please try again later.
        </p>
      </div>
    );
  }

  // Function to handle event approval or decline
  const handleApproval = async (action: string) => {
    if (!confirm(`Are you sure you want to ${action} this event?`)) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/events/${action}_event`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ event_id: event.id })
        }
      );

      const result = await response.json();
      if (response.ok) {
        addNotification(`Event ${action}d successfully`, 'success');
        if (action === 'decline') {
          navigate('/dashboard/faculty/facultyEventApproval');
        } else {
          navigate(0); // Reload the page to reflect the changes
        }
      } else {
        addNotification(`Failed to ${action} event: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error(`Error ${action}ing event:`, error);
      if (error instanceof Error) {
        addNotification(`Error ${action}ing event: ${error.message}`, 'error');
      } else {
        addNotification(`Error ${action}ing event`, 'error');
      }
    }
  };

  const location = useLocation();
  const { currentSchool } = useSchool();
  const [commentInput, setCommentInput] = useState('');
  const eventID = event.id;

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const newError = searchParams.get('error');
    const newMessage = searchParams.get('message');

    if (newError || newMessage) {
      if (newError) {
        addNotification(decodeURIComponent(newError), 'error');
        searchParams.delete('error');
      }

      if (newMessage) {
        addNotification(decodeURIComponent(newMessage), 'info');
        searchParams.delete('message');
      }

      // Update URL without triggering page reload
      const newUrl = searchParams.toString()
        ? `${location.pathname}?${searchParams.toString()}`
        : location.pathname;

      window.history.replaceState({}, document.title, newUrl);
    }
  }, [location.search]);

  const handleSubmitComment = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const comment = formData.get('comment')?.toString() || '';
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;

    if (comment === '') {
      addNotification('Comment cannot be empty', 'error');
      return;
    } else {
      formData.append('schoolId', currentSchool?.id?.toString() ?? '');
      formData.append('action', action);

      try {
        // Assuming `submit` doesn't return a Response object:
        await submit(
          { id: eventID, comment: comment, action: 'comment' },
          { method: 'POST' }
        );

        // After successful submission:
        addNotification('Comment submitted successfully', 'success');
      } catch (error) {
        console.error('Error submitting comment:', error);
        addNotification('Error submitting comment', 'error');
      }
    }

    // Clear the input after successful submission
    setCommentInput('');
  };

  const handleSubmitSubComment = async (
    event: React.FormEvent<HTMLFormElement>,
    item: {
      comment_id: string;
      indent_level: number;
      event_id: number;
      commentInput: string;
    }
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const comment = formData.get('comment')?.toString() || '';
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;
    const indent = item.indent_level ?? 0;

    formData.append('action', action);
    formData.append('parentId', item.comment_id.toString());
    formData.append('eventId', eventID.toString());
    formData.append('indentLevel', indent.toString());

    if (action === 'report') {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/events/report-comment`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
              action: 'report',
              commentId: item.comment_id.toString()
            })
          }
        );
        if (!response.ok) {
          alert(
            `Something went wrong, comment not reported. Error: ${response.statusText}`
          );
          return null;
        }
        addNotification('Comment reported successfully', 'success');
      } catch (error) {
        console.error(error);
        return redirect(`dashboard/event/${item.comment_id.toString()}`);
      }
    } else {
      if (comment === '') {
        addNotification('Comment cannot be empty', 'error');
        return;
      }
      submit(
        {
          comment: comment,
          parentId: item.comment_id.toString(),
          eventId: eventID,
          action: 'subComment',
          indentLevel: (indent + 1).toString()
        },
        { method: 'POST' }
      );

      item.commentInput = '';
      setCommentInputs((prev) => ({
        ...prev,
        [item.comment_id]: ''
      }));
      setCommentInput('');
    }
  };

  // State to manage individual comment inputs
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>(
    {}
  );

  // Function to handle comment input change
  const handleCommentInputChange = (commentId: string, value: string) => {
    setCommentInputs((prev) => ({
      ...prev,
      [commentId]: value
    }));
  };

  return (
    <div className='flex flex-col p-4 sm:px-[5%] lg:px-[10%] items-center w-full h-full overflow-y-auto gap-4'>
      {/* Event title and RSVP section */}
      <Card
        color='gray-300'
        padding={4}
        className='w-full flex gap-2 relative flex-row justify-between items-center'
      >
        <h1 className='font-bold text-4xl flex-grow'>{event?.title}</h1>

        {/* Cancel Event Button */}
        {!loading && (
          <>
            <Form
              onSubmit={(e) => {
                if (!confirm('Are you sure you want to cancel this event?')) {
                  e.preventDefault(); // Prevent the form from submitting if the user cancels
                }
                setLoading(true);
              }}
              method='post'
              className='flex-shrink-0'
            >
              {(user.isFaculty ||
                user?.clubAdmins?.some((adminClubId) =>
                  event.host.some((host) => host.id === adminClubId)
                )) && (
                <Button
                  type='submit'
                  name='action'
                  value='cancel'
                  text='Cancel Event'
                  className='bg-gray-500 text-white rounded hover:bg-red-500 text-nowrap'
                />
              )}
              <input type='hidden' name='id' value={event.id} />
            </Form>
            <Form method='post'>
              {(user.isFaculty ||
                user?.clubAdmins?.some((adminClubId) =>
                  event.host.some((host) => host.id === adminClubId)
                )) && (
                <Button
                  type='submit'
                  name='action'
                  value='reports'
                  text='Reports'
                  className='bg-gray-500 text-white rounded text-nowrap'
                />
              )}
              <input type='hidden' name='id' value={event.id} />
            </Form>
          </>
        )}

        {/* RSVP Dropdown */}
        {!loading && (
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
        )}
      </Card>

      {/* Approve/Decline Buttons for Faculty */}
      {user?.isFaculty && !event?.isApproved && !loading && (
        <>
          <h2 className='text-2xl font-bold text-left w-full'>
            Event Approval
          </h2>
          <Card
            color='gray-300'
            padding={4}
            className='w-full flex gap-2 mt-4 justify-center'
          >
            <Button
              text=''
              className='bg-green-500 text-white rounded hover:bg-green-600 flex items-center px-4 py-2'
              onClick={() => handleApproval('approve')}
            >
              <FaCheck className='mr-2' />
              Approve
            </Button>
            <Button
              text=''
              className='bg-red-500 text-white rounded hover:bg-red-600 flex items-center px-4 py-2'
              onClick={() => handleApproval('decline')}
            >
              <FaTimes className='mr-2' />
              Decline
            </Button>
          </Card>
        </>
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
            {event?.cost ? `$${event.cost}` : 'FREE'}
          </p>
          <p className='flex flex-row gap-2 items-center'>
            <ImManWoman size={24} /> <strong>Gender Restriction:</strong>{' '}
            {event?.genderRestriction === 'M'
              ? 'Male'
              : event?.genderRestriction === 'F'
              ? 'Female'
              : 'None'}
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
        {event?.images?.map((image: ImageType, index: number) => {
          const [prefix, base64Image] = image?.image?.split(',') ?? ['', ''];
          return (
            <img
              key={index}
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
        <Form
          onSubmit={handleSubmitComment}
          className='flex flex-col gap-2 w-full'
        >
          <Input
            label='Add a Comment: '
            placeholder='Comment'
            name='comment'
            type='text'
            filled={false}
            value={commentInput}
            onChange={(e) =>
              setCommentInput((e.target as HTMLInputElement).value ?? '')
            }
            labelOnSameLine
          />
          <div className='flex-shrink-0'>
            <Button
              text='Comment'
              type='submit'
              filled={true}
              className='w-auto'
            />
          </div>
        </Form>
      </div>

      {/* Rendered comments */}
      <div className='w-full flex flex-col align-left gap-2'>
        {comments && comments.length > 0 ? (
          comments.map((item, index) => (
            <Form
              key={index}
              onSubmit={(e) => handleSubmitSubComment(e, item)}
              className='flex flex-col gap-2 w-full'
            >
              <Comment
                creator={item.user_id}
                content={item.content}
                lastModified={new Date(item.posted_timestamp)}
                indentLevel={item.indent_level}
                commentInput={commentInputs[item.comment_id] || ''} // Ensure commentInput is always defined
                isReported={item.is_flagged}
                isDeleted={item.is_deleted}
                onChange={(e) =>
                  handleCommentInputChange(
                    item.comment_id,
                    (e.target as HTMLInputElement).value
                  )
                }
              />
            </Form>
          ))
        ) : (
          <div>No comments yet</div>
        )}
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
