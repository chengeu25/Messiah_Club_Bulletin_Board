import Day from '../../../components/dashboard/Day.component';
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

const Home = () => {
  const { user, events } = useLoaderData() as {
    events: EventType[];
    user: UserType;
  };
  const submit = useSubmit();
  const [params] = useSearchParams();

  /**
   * Returns the filtered events by search and filter
   */
  const filteredEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          passesSearch(event, params.get('search') ?? '') &&
          passesFilter(event, user, params.get('filter') ?? '')
      ),
    [events, params]
  );

  /**
   * Returns the (filtered) events on each day
   */
  const eventsOnDays = useMemo(
    sortEventsByDay(
      filteredEvents,
      (id) => submit({ id: id, action: 'details' }, { method: 'post' }),
      (id, type) =>
        submit({ id: id, type: type, action: 'rsvp' }, { method: 'post' })
    ),
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
