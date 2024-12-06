import Day, { DayProps } from '../../../components/dashboard/Day.component';
import { EventType } from '../../../types/databaseTypes';
import { useMemo } from 'react';
import { Form, useSubmit, useLoaderData } from 'react-router-dom';

const Home = () => {
  const { events } = useLoaderData() as { events: EventType[] };
  const submit = useSubmit();

  const eventsOnDays = useMemo(
    () =>
      Object.entries(
        events.reduce((acc, event) => {
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
    [events]
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
          <div className='text-2xl font-bold'>No events this week yet.</div>
        )}
      </Form>
    </div>
  );
};

export default Home;
