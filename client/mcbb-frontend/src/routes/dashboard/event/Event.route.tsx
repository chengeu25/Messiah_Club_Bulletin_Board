import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Card from '../../../components/ui/Card';
import { IoMdTime } from 'react-icons/io';
import { IoLocationOutline } from 'react-icons/io5';
import { RiAccountCircleLine } from 'react-icons/ri';
import { FaDollarSign } from 'react-icons/fa6';
import { Form, Link, useLoaderData, useSubmit } from 'react-router-dom';
import Button from '../../../components/formElements/Button.component';
import Input from '../../../components/formElements/Input.component';
import Comment from '../../../components/forums/Comment.component';
import { EventDetailType, ImageType } from '../../../types/databaseTypes';
import { format } from 'date-fns';
import RSVPDropdown from '../../../components/specialDropdowns/RSVPDropdown.component';
import checkUser from '../../../helper/checkUser';
import { UserType as User } from '../../../types/databaseTypes';
import { useSchool } from '../../../contexts/SchoolContext';

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
  const submit = useSubmit();
  const location = useLocation();
  const { event } = useLoaderData() as { event: EventDetailType };
  const { currentSchool } = useSchool();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [commentData, setCommentData] = useState<any[] | null>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");

  const eventID = event.id;

  const fetchComment = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL
        }/api/events/get-comments/${eventID}`,
        {
          method: 'GET',
          credentials: 'include'
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const commentData = await response.json();
      setCommentData(commentData);
      await fetchComment();
      // console.log('commentData afterwards: ', commentData);

    } catch (error) {
      setError('Failed to fetch comments');
      console.error('Error fetching comments: ', error);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const newError = searchParams.get('error');
    const newMessage = searchParams.get('message');

    if (newError || newMessage) {
      if (newError) {
        setError(decodeURIComponent(newError));
        searchParams.delete('error');
      }

      if (newMessage) {
        setMessage(decodeURIComponent(newMessage));
        searchParams.delete('message');
      }

      // Update URL without triggering page reload
      const newUrl = searchParams.toString()
        ? `${location.pathname}?${searchParams.toString()}`
        : location.pathname;
      
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await checkUser();
        setUserEmail((user as User).email);
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    setError(null);
    setMessage(null);
    // Fetch comment data from the API
    /*const fetchComment = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL
          }/api/events/get-comments/${eventID}`,
          {
            method: 'GET',
            credentials: 'include'
          }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        const commentData = await response.json();
        setCommentData(commentData);
        
      } catch (error) {
        setError('Failed to fetch comments');
        console.error('Error fetching comments: ', error);
      }
    };*/
  
    fetchComment();
  }, []);

  const handleSubmitComment = async (event: React.FormEvent<HTMLFormElement>) => {
    setError(null);
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const comment = formData.get('comment')?.toString() || '';
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;

    if (comment === '') {
      return;
    } else {
      formData.append('schoolId', currentSchool?.id?.toString() ?? '');
      formData.append('action', action);
      //console.log("path name: ", location);
      //console.log("form data: ", formData);
      submit(
        { id: eventID, comment: comment, action: 'comment' },
        { method: 'POST' }
      )
    }

    setCommentInput("");

    //console.log('commentData: ', commentData);
    // Update the comment section with new comments dynamically
    /*const fetchComment = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL
          }/api/events/get-comments/${eventID}`,
          {
            method: 'GET',
            credentials: 'include'
          }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        const commentData = await response.json();
        setCommentData(commentData);
        await fetchComment();
        console.log('commentData afterwards: ', commentData);
        
      } catch (error) {
        setError('Failed to fetch comments');
        console.error('Error fetching comments: ', error);
      }
    };*/

    fetchComment();
  };

  const handleSubmitSubComment = async (
    event: React.FormEvent<HTMLFormElement>,
    item: {
      comment_id: String,
      indent_level: number,
      event_id: number,
      commentInput: string
    }
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const comment = formData.get('comment')?.toString() || '';
    const action = (
      (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement
    ).name;
    const indent = (item.indent_level ?? 0);

    if (comment === '') {
      return;
    } else {
      formData.append('action', action);
      formData.append('parentId', item.comment_id.toString());
      formData.append('eventId', eventID.toString());
      formData.append('indentLevel', indent.toString());
    }

    submit(
      {
        comment: comment,
        parentId: item.comment_id.toString(),
        eventId: eventID,
        action: 'subComment',
        indentLevel: (indent + 1).toString()
      },
      {method: 'POST'}
    )

    item.commentInput = "";
    setCommentInput("");

    fetchComment();
  };
  /**
     * Handles URL-based error and success messages.
     *
     * @function
     * @description Updates error and success messages from URL parameters
     */
    useEffect(() => {
      const searchParams = new URLSearchParams(location.search);
      const newError = searchParams.get('error');
      const newMessage = searchParams.get('message');
  
      if (newError || newMessage) {
        if (newError) {
          setError(decodeURIComponent(newError));
          searchParams.delete('error');
        }
  
        if (newMessage) {
          setMessage(decodeURIComponent(newMessage));
          searchParams.delete('message');
        }
  
        // Update URL without triggering a page reload
        const newUrl = searchParams.toString()
          ? `${location.pathname}?${searchParams.toString()}`
          : location.pathname;
  
        window.history.replaceState({}, document.title, newUrl);
      }
    }, [location.search]);
  
  return (
    <div className='flex flex-col p-4 sm:px-[5%] lg:px-[10%] items-center w-full h-full overflow-y-scroll gap-2'>
      {/* Event title and RSVP section */}
      <Card
        color='gray-300'
        padding={4}
        className='w-full flex gap-2 relative flex-row justify-between items-center'
      >
        <h1 className='font-bold text-4xl flex-grow'>{event?.title}</h1>
        <Form className='flex-shrink-0 flex'>
          {error && <div className='text-red-500'>{error}</div>}
          {message && <p className='text-green-500'>{message}</p>}
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

      {/* Event metadata section */}
      <div className='flex flex-col w-full gap-4 m-2'>
        <Card color='gray-300' padding={4} className='flex-col gap-2'>
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
      <div className='flex flex-row w-full gap-4 overflow-x-scroll min-h-48 mt-2'>
        {event?.images?.map((image: ImageType, index: number) => (
          <img
            key={index}
            src={image.image}
            alt={event.title}
            style={{ objectFit: 'cover' }}
            className='h-[200px] w-[200px] bg-gray-800 rounded-lg'
          />
        ))}
      </div>

      {/* Comment section */}
      <hr className='border-2 border-black w-full mt-2' />
      <h1 className='text-3xl font-bold text-left w-full'>Discuss</h1>
      <div className='flex flex-row w-full gap-2 items-center'>
        <Form onSubmit={handleSubmitComment} className='flex flex-col gap-2 w-full'>
          <Input
            label='Add a Comment: '
            placeholder='Comment'
            name='comment'
            type='text'
            filled={false}
            value={commentInput}
            onChange={(e) => setCommentInput((e.target as HTMLInputElement).value)}
            labelOnSameLine
          />
          <div className='flex-shrink-0'>
            <Button
              text='Comment'
              type='submit'
              filled={true}
              className='w-auto' />
          </div>
        </Form>
      </div>

      {/* Rendered comments */}
      <div className='w-full flex flex-col align-left gap-2'>
        {commentData && commentData.length > 0 ? (
          commentData.map((item, index) => (
            <Form key={index} onSubmit={(e) => handleSubmitSubComment(e, item)} className='flex flex-col gap-2 w-full'>
              <Comment
                creator={item.user_id}
                content={item.content}
                lastModified={new Date(item.posted_timestamp)}
                commentId={item.comment_id}
                indentLevel={item.indent_level}
                commentInput={item.commentInput}
                onChange={(e) => setCommentInput((e.target as HTMLInputElement).value)}
                submitHandler={(e) => handleSubmitSubComment(e, item)}
              />
            </Form>
          ))
        ) : (
            <div>
             No comments yet
            </div>
        )}
      </div>
    </div>
  );
};

export default Event;
