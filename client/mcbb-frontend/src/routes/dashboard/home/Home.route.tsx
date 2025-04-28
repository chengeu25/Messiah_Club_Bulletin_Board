import Day from '../../../components/dashboard/Day.component';
import { useNotification } from '../../../contexts/NotificationContext';
import { useSchool } from '../../../contexts/SchoolContext';
import {
  eventPassesSearch,
  sortEventsByDay
} from '../../../helper/eventHelpers';
import { EventType, ImageType } from '../../../types/databaseTypes';
import { useEffect, useMemo, useState } from 'react';
import {
  Form,
  useSubmit,
  useLoaderData,
  useSearchParams
} from 'react-router-dom';

/**
 * Home dashboard component displaying events for the current week.
 *
 * @component
 * @description Renders a list of events filtered by search and user preferences:
 * - Displays events grouped by day
 * - Supports filtering and searching events
 * - Shows a message when no events match the current filters
 *
 * @returns {React.ReactElement} Rendered home dashboard with events
 */
const Home = () => {
  const { events, images } = useLoaderData() as {
    events: EventType[];
    images: Promise<ImageType[]>;
  };
  const submit = useSubmit();
  const [params] = useSearchParams();
  const { currentSchool } = useSchool();
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();

  // State to store merged events with images
  const [mergedEvents, setMergedEvents] = useState<EventType[]>(events);

  // Load images and merge with events
  useEffect(() => {
    let isMounted = true; // To prevent state updates if the component unmounts
    try {
      images
        .then((loadedImages) => {
          if (isMounted) {
            const eventsWithImages = (events as EventType[]).map((event) => ({
              ...event,
              image: loadedImages.find((img) => img.id === event.id) || null
            }));
            setMergedEvents(eventsWithImages as EventType[]);
          }
        })
        .catch((error) => {
          console.error('Failed to load images:', error);
        });
    } catch (error) {
      addNotification(
        'Image loading failed, please refresh the page.',
        'error'
      );
    }

    return () => {
      isMounted = false;
    };
  }, [events, images]);

  // Effect to update loading state
  useEffect(() => {
    setLoading(false);
  }, [mergedEvents]);

  /**
   * Memoized function to filter events based on search query and user filters.
   *
   * @function filteredEvents
   * @type {EventType[]}
   *
   * @description Filters events by:
   * - Matching search query in event title or tags
   * - Applying user-specific filters (e.g., suggested events)
   *
   * @returns {EventType[]} Array of events that pass the search and filter criteria
   */
  const filteredEvents = useMemo(
    () =>
      mergedEvents.filter((event: EventType) =>
        eventPassesSearch(event, params.get('search') ?? '')
      ),
    [mergedEvents, params]
  );

  /**
   * Memoized function to organize filtered events by day.
   *
   * @function eventsOnDays
   * @type {DayProps[]}
   *
   * @description Transforms filtered events into a day-based structure with:
   * - Events sorted by date
   * - Handlers for event details and RSVP actions
   *
   * @returns {DayProps[]} Array of day objects containing events
   */
  const eventsOnDays = useMemo(
    sortEventsByDay(
      filteredEvents,
      (id) => submit({ id: id, action: 'details' }, { method: 'post' }),
      (id, type) =>
        submit({ id: id, type: type, action: 'rsvp' }, { method: 'post' })
    ),
    [filteredEvents, submit]
  );

  return (
    <div className='flex flex-col p-4 sm:px-[15%] items-center w-full h-full overflow-y-auto'>
      <h1 className='text-3xl font-bold'>This Week at {currentSchool?.name}</h1>
      <Form className='flex flex-col gap-4 flex-1 w-full'>
        {loading ? (
          <div>Loading events...</div>
        ) : eventsOnDays.length > 0 ? (
          eventsOnDays
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((day) => (
              <Day {...day} key={day.date.getTime()} /> // Ensure to add a unique key prop
            ))
        ) : (
          <div className='text-2xl font-bold text-center'>
            No events this week that match the specified filters.
          </div>
        )}
      </Form>
    </div>
  );
};

export default Home;
