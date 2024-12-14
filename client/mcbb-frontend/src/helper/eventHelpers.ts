import { DayProps } from '../components/dashboard/Day.component';
import { EventType, UserType } from '../types/databaseTypes';

/**
 * Sorts the events by day
 * @param events The events to sort
 * @param handleDetailsClick The function to call when the user clicks on the details button
 * @param handleRSVPClick The function to call when the user clicks on the RSVP button
 * @returns An array of DayProps
 */
export const sortEventsByDay =
  (
    events: EventType[],
    handleDetailsClick: (id: number) => void,
    handleRSVPClick: (id: number, type: string) => void
  ) =>
  () =>
    Object.entries(
      events.reduce((acc, event) => {
        const localDate = new Date(event.startTime);
        const dateKey = localDate.toLocaleDateString('en-CA'); // ISO format yyyy-MM-dd

        if (!acc[dateKey]) {
          acc[dateKey] = {
            date: localDate,
            events: [],
            handleDetailsClick: handleDetailsClick,
            handleRSVPClick: handleRSVPClick
          };
        }

        acc[dateKey].events.push({
          ...event,
          startTime: localDate,
          endTime: new Date(event.endTime)
        });

        return acc;
      }, {} as Record<string, DayProps>)
    ).map(([, value]) => value);

/**
 * Checks if the event passes the search query
 * Passes if the name includes the search query or if any of the words in the search query
 * include a tag of the event
 * @param event The event to check
 * @param search The search query
 * @returns True if the club passes the search query
 */
export const passesSearch = (event: EventType, search: string) =>
  event.title.toLowerCase().includes(search?.toLowerCase() ?? '') ||
  search
    ?.toLowerCase()
    .split(' ')
    .some((tag) =>
      event.tags?.some((eventTag) => tag.includes(eventTag.toLowerCase()))
    );

/**
 * Checks if the event passes the filter
 * Passes if the event is suggested
 * @param event The event to check
 * @param user The user to check for tags on
 * @param filter The filter to check
 * @returns True if the event passes the filter
 */
export const passesFilter = (
  event: EventType,
  user: UserType,
  filter: string
) =>
  filter === 'Suggested'
    ? event.tags?.some((tag) => user.tags?.includes(tag)) &&
      event.rsvp !== 'block'
    : filter === 'Attending'
    ? event.rsvp === 'rsvp'
    : filter === 'Hosted by Subscribed Clubs'
    ? event.subscribed
    : true;
