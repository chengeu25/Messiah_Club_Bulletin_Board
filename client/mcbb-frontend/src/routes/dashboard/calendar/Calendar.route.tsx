import { useEffect, useMemo } from 'react';
import { BiHome } from 'react-icons/bi';
import Button from '../../../components/formElements/Button.component';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import DatePicker from 'react-datepicker';
import { subtractDays } from '../../../helper/dateUtils';
import { useLoaderData, useSearchParams, useSubmit } from 'react-router-dom';
import {
  passesFilter,
  eventPassesSearch,
  sortEventsByDay
} from '../../../helper/eventHelpers';
import { EventType, UserType } from '../../../types/databaseTypes';
import Day, { DayProps } from '../../../components/dashboard/Day.component';

/**
 * Calendar dashboard component for displaying and navigating events.
 *
 * @component
 * @description Provides functionality to:
 * - Display events across multiple days
 * - Navigate between dates
 * - Filter and search events
 * - Dynamically adjust displayed days based on screen size
 *
 * @returns {React.ReactElement} Rendered calendar dashboard
 */
const Calendar = () => {
  const submit = useSubmit();

  const [searchParams, setSearchParams] = useSearchParams();
  const { events, user } = useLoaderData() as {
    events: EventType[];
    user: UserType;
  };

  /**
   * Calculates the starting date and number of days to display.
   *
   * @function
   * @returns {Object} Starting date and number of days
   *
   * @description Retrieves date parameters from URL search params
   * - Uses current date if no starting date is specified
   * - Defaults to 1 day if no number of days is specified
   */
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

  /**
   * Updates the starting date in URL search parameters.
   *
   * @function setStartingDate
   * @param {Date} startingDate - New starting date to set
   *
   * @description Modifies URL search parameters to reflect the new starting date
   */
  const setStartingDate = (startingDate: Date) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('startingDate', startingDate.toISOString());
    setSearchParams(newSearchParams);
  };

  /**
   * Updates the number of days displayed in URL search parameters.
   *
   * @function setNumOfDaysDisplayed
   * @param {number} numDays - Number of days to display
   *
   * @description Modifies URL search parameters to reflect the new number of days
   */
  const setNumOfDaysDisplayed = (numDays: number) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('numDays', numDays.toString());
    setSearchParams(newSearchParams);
  };

  /**
   * Generates an array of dates to be displayed.
   *
   * @function
   * @returns {Date[]} Array of dates to display
   *
   * @description Creates an array of consecutive dates based on:
   * - Starting date
   * - Number of days to display
   */
  const datesDisplayed = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < numOfDaysDisplayed; i++) {
      dates.push(subtractDays(startingDate, -i));
    }
    return dates;
  }, [startingDate, numOfDaysDisplayed]);

  /**
   * Filters events based on search query and user filters.
   *
   * @function
   * @returns {EventType[]} Filtered events
   *
   * @description Applies search and filter criteria to events:
   * - Matches search query in event details
   * - Applies user-specific filters
   */
  const filteredEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          eventPassesSearch(event, searchParams.get('search') ?? '') &&
          passesFilter(event, user, searchParams.get('filter') ?? '')
      ),
    [events, searchParams]
  );

  /**
   * Organizes filtered events by day with interaction handlers.
   *
   * @function
   * @returns {DayProps[]} Events sorted and organized by day
   *
   * @description Transforms filtered events into a day-based structure:
   * - Sorts events by day
   * - Adds handlers for event details and RSVP actions
   */
  const eventsOnDays = useMemo(
    sortEventsByDay(
      filteredEvents ?? [],
      (id) => submit({ id: id, action: 'details' }, { method: 'post' }),
      (id, type) =>
        submit({ id: id, type: type, action: 'rsvp' }, { method: 'post' })
    ),
    [events]
  );

  /**
   * Prepares events for each displayed date.
   *
   * @function
   * @returns {DayProps[]} Events for each displayed date
   *
   * @description Maps events to their corresponding dates:
   * - Creates a day object for each date
   * - Fills with events if available, otherwise creates an empty day
   */
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

  /**
   * Dynamically adjusts the number of displayed days based on screen width.
   *
   * @function
   * @description Uses ResizeObserver to:
   * - Calculate optimal number of days to display
   * - Update URL search parameters
   * - Handles initial and responsive layout
   */
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
            icon={<BiHome />}
            onClick={() =>
              setStartingDate(new Date(new Date().setHours(0, 0, 0, 0)))
            }
          />
          <Button
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
            className='foreground-filled border-none rounded-lg p-1 text-white'
          />
          <Button
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
            } p-4 foreground-outlined h-full justify-start gap-y-4 overflow-y-auto relative`}
          >
            <Day {...day} small={true} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
