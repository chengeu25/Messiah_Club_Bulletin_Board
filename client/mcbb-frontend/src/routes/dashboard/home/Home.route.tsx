import Day, { DayProps } from '../../../components/dashboard/Day.component';
import { EventType, UserType } from '../../../types/databaseTypes';
import { useMemo } from 'react';
import {
  Form,
  useSubmit,
  useLoaderData,
  useSearchParams
} from 'react-router-dom';

const Home = () => {
  const { user, events } = useLoaderData() as {
    events: EventType[];
    user: UserType;
  };
  const submit = useSubmit();
  const [params] = useSearchParams();

  /**
   * Checks if the event passes the search query
   * Passes if the name includes the search query or if any of the words in the search query
   * include a tag of the event
   * @param event The event to check
   * @returns True if the club passes the search query
   */
  const passesSearch = (event: EventType) =>
    event.title
      .toLowerCase()
      .includes(params.get('search')?.toLowerCase() ?? '') ||
    params
      .get('search')
      ?.toLowerCase()
      .split(' ')
      .some((tag) =>
        event.tags?.some((eventTag) => tag.includes(eventTag.toLowerCase()))
      );

  /**
   * Checks if the event passes the filter
   * Passes if the event is suggested
   * @param event The event to check
   * @returns True if the event passes the filter
   */
  const passesFilter = (event: EventType) =>
    params.get('filter') === 'Suggested'
      ? event.tags.some((tag) => user.tags.includes(tag))
      : params.get('filter') === 'Attending'
      ? event.rsvp === 'rsvp'
      : true;

  /**
   * Returns the filtered events by search and filter
   */
  const filteredEvents = useMemo(
    () => events.filter((event) => passesSearch(event) && passesFilter(event)),
    [events, params]
  );

  /**
   * Returns the (filtered) events on each day
   */
  const eventsOnDays = useMemo(
    () =>
      Object.entries(
        filteredEvents.reduce((acc, event) => {
          const localDate = new Date(event.startTime);
          const dateKey = localDate.toLocaleDateString('en-CA'); // ISO format yyyy-MM-dd

          if (!acc[dateKey]) {
            acc[dateKey] = {
              date: localDate,
              events: [],
              handleDetailsClick: (id) =>
                submit({ id: id, action: 'details' }, { method: 'post' }),
              handleRSVPClick: (id, type) =>
                submit(
                  { id: id, type: type, action: 'rsvp' },
                  { method: 'post' }
                )
            };
          }

          acc[dateKey].events.push({
            ...event,
            startTime: localDate,
            endTime: new Date(event.endTime)
          });

          return acc;
        }, {} as Record<string, DayProps>)
      ).map(([, value]) => value),
    [filteredEvents]
  );

  return (
    <div className='flex flex-col p-4 sm:px-[15%] items-center w-full h-full overflow-y-scroll'>
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
