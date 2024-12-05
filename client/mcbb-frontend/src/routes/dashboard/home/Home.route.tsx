import { useLoaderData, useNavigate } from 'react-router';
import Day, { DayProps } from '../../../components/dashboard/Day.component';
import { EventType } from '../../../types/databaseTypes';
import { useMemo } from 'react';

const Home = () => {
  const { events } = useLoaderData() as { events: EventType[] };
  const navigate = useNavigate();

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
              handleDetailsClick: (id) => navigate(`/dashboard/event/${id}`),
              handleRSVPClick: (id) => navigate(`/dashboard/event/${id}`)
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
      <div className='flex flex-col gap-4 flex-1'>
        {eventsOnDays
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .map((day) => (
            <Day {...day} key={day.date.getTime()} /> // Ensure to add a unique key prop
          ))}
      </div>
    </div>
  );
};

export default Home;
