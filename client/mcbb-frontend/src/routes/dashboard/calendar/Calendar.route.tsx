import { useEffect, useMemo } from 'react';
import { BiHome } from 'react-icons/bi';
import Button from '../../../components/formElements/Button.component';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import DatePicker from 'react-datepicker';
import { subtractDays } from '../../../helper/dateUtils';
import { useLoaderData, useSearchParams, useSubmit } from 'react-router-dom';
import { filterAsync } from '../../../helper/asyncWrappers';
import {
  passesFilter,
  passesSearch,
  sortEventsByDay
} from '../../../helper/eventHelpers';
import { EventType, UserType } from '../../../types/databaseTypes';
import Day, { DayProps } from '../../../components/dashboard/Day.component';
import useAsyncMemo from '../../../hooks/useAsyncMemo';

const Calendar = () => {
  const submit = useSubmit();

  const [searchParams, setSearchParams] = useSearchParams();
  const { events, user } = useLoaderData() as {
    events: EventType[];
    user: UserType;
  };

  const { startingDate, numOfDaysDisplayed } = useMemo(() => {
    const startingDate = searchParams.get('startingDate');
    const numDays = searchParams.get('numDays');
    return {
      startingDate: startingDate
        ? new Date(startingDate)
        : new Date(new Date().setHours(0, 0, 0, 0)),
      numOfDaysDisplayed: numDays ? parseInt(numDays) : 1
    };
  }, [searchParams]);

  const setStartingDate = (startingDate: Date) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('startingDate', startingDate.toISOString());
    setSearchParams(newSearchParams);
  };

  const setNumOfDaysDisplayed = (numDays: number) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('numDays', numDays.toString());
    setSearchParams(newSearchParams);
  };

  const datesDisplayed = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < numOfDaysDisplayed; i++) {
      dates.push(subtractDays(startingDate, -i));
    }
    return dates;
  }, [startingDate, numOfDaysDisplayed]);

  /**
   * Returns the filtered events by search and filter
   */
  const filteredEvents = useAsyncMemo(async () => {
    const filtered = await filterAsync(
      events,
      async (event) =>
        passesSearch(event, searchParams.get('search') ?? '') &&
        (await passesFilter(event, user, searchParams.get('filter') ?? ''))
    );
    return filtered;
  }, [events, searchParams]);

  const eventsOnDays = useMemo(
    sortEventsByDay(
      filteredEvents?.value ?? [],
      (id) => submit({ id: id, action: 'details' }, { method: 'post' }),
      (id, type) =>
        submit({ id: id, type: type, action: 'rsvp' }, { method: 'post' })
    ),
    [events]
  );

  const eventsOnDaysDisplayed: DayProps[] = useMemo(
    () =>
      datesDisplayed.map(
        (date) =>
          eventsOnDays.find(
            (day) => day.date.toLocaleDateString() === date.toLocaleDateString()
          ) ?? {
            date: date,
            events: [],
            handleDetailsClick: () => {},
            handleRSVPClick: () => {}
          }
      ),
    [eventsOnDays, datesDisplayed]
  );

  useEffect(() => {
    const handleResize = () => {
      const containerWidth =
        document.getElementById('calendar-container')?.clientWidth ||
        window.innerWidth;
      const daysToDisplay = Math.max(Math.floor(containerWidth / 400), 1);
      setNumOfDaysDisplayed(daysToDisplay);
    };

    const resizeObserver = new ResizeObserver(handleResize);

    const timeoutId = setTimeout(() => {
      handleResize();

      resizeObserver.observe(window.document.body);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      id='calendar-container'
      className='relative w-full flex flex-col h-full'
    >
      <div className='flex justify-center items-center p-2 w-full'>
        <div className='flex flex-row justify-center items-center gap-2'>
          <Button
            color='blue'
            icon={<BiHome />}
            onClick={() =>
              setStartingDate(new Date(new Date().setHours(0, 0, 0, 0)))
            }
          />
          <Button
            color='blue'
            icon={<IoChevronBack />}
            onClick={() => {
              setStartingDate(subtractDays(startingDate, numOfDaysDisplayed));
            }}
          />
          <DatePicker
            selected={startingDate}
            onChange={(value) => {
              setStartingDate(
                value !== null
                  ? new Date(value)
                  : new Date(new Date().setHours(0, 0, 0, 0))
              );
            }}
            className='bg-blue-950 border-none rounded-lg p-1 text-white'
          />
          <Button
            color='blue'
            icon={<IoChevronForward />}
            onClick={() =>
              setStartingDate(subtractDays(startingDate, -numOfDaysDisplayed))
            }
          />
        </div>
      </div>
      <div className='flex flex-row justify-center flex-1 items-center p-4 h-full'>
        {eventsOnDaysDisplayed.map((day, index) => (
          <div
            key={index}
            className={`flex flex-col flex-1 ${
              index !== 0 && 'border-l-[1px]'
            } p-4 border-blue-900 h-full justify-start gap-y-4 overflow-y-auto relative`}
          >
            <Day {...day} small={true} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
