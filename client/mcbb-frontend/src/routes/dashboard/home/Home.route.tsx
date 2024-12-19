import Day from '../../../components/dashboard/Day.component';
import { useSchool } from '../../../contexts/SchoolContext';
import {
  passesFilter,
  passesSearch,
  sortEventsByDay
} from '../../../helper/eventHelpers';
import { EventType, UserType } from '../../../types/databaseTypes';
import { useMemo } from 'react';
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
  const { user, events } = useLoaderData() as {
    events: EventType[];
    user: UserType;
  };
  const submit = useSubmit();
  const [params] = useSearchParams();
  const { currentSchool } = useSchool();

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
      events.filter(
        (event: EventType) =>
          passesSearch(event, params.get('search') ?? '') &&
          passesFilter(event, user, params.get('filter') ?? '')
      ),
    [events, params]
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
    <div className='flex flex-col p-4 sm:px-[15%] items-center w-full h-full overflow-y-scroll'>
      <h1 className='text-3xl font-bold'>This Week at {currentSchool?.name}</h1>
      <Form className='flex flex-col gap-4 flex-1 w-full'>
        {eventsOnDays.length > 0 ? (
          eventsOnDays
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((day) => (
              <Day {...day} key={day.date.getTime()} /> // Ensure to add a unique key prop
            ))
        ) : (
          <div className='text-2xl font-bold'>
            No events this week that match the specified filters.
          </div>
        )}
      </Form>
    </div>
  );
};

export default Home;
